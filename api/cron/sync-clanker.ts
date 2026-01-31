import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const config = {
  maxDuration: 60,
};

// Known Bankr deployer addresses (add more as discovered)
const BANKR_DEPLOYERS = [
  '0x8d5f05d0d3f0e7a86ca1e6c1e3c8f9a123456789', // placeholder - we'll discover real ones
].map(a => a.toLowerCase());

// Keywords that suggest AI agent tokens
const AGENT_KEYWORDS = [
  'agent', 'ai', 'bot', 'claude', 'gpt', 'llm', 'molt', 'claw', 
  'assistant', 'autonomous', 'neural', 'cognitive'
];

function detectSource(token: any): 'bankr' | 'clanker' | 'agent' {
  const deployer = (token.msg_sender || '').toLowerCase();
  const name = (token.name || '').toLowerCase();
  const symbol = (token.symbol || '').toLowerCase();
  const socialContext = JSON.stringify(token.social_context || {}).toLowerCase();
  
  // Check if deployed by known Bankr address
  if (BANKR_DEPLOYERS.includes(deployer)) {
    return 'bankr';
  }
  
  // Check if social context mentions bankr
  if (socialContext.includes('bankr') || socialContext.includes('@bankrbot')) {
    return 'bankr';
  }
  
  // Check for agent-related keywords
  const hasAgentKeyword = AGENT_KEYWORDS.some(kw => 
    name.includes(kw) || symbol.includes(kw)
  );
  
  if (hasAgentKeyword) {
    return 'agent';
  }
  
  return 'clanker';
}

export default async function handler(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Fetching Clanker tokens...');
    
    // Fetch latest tokens from Clanker API
    const response = await fetch('https://www.clanker.world/api/tokens?page=1&limit=50&sort=desc', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'agentscreener/1.0',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Clanker API returned ${response.status}`);
    }
    
    const data = await response.json();
    const tokens = data.tokens || data.data || data || [];
    
    console.log('Fetched tokens:', tokens.length);
    
    if (!Array.isArray(tokens) || tokens.length === 0) {
      return res.status(200).json({ 
        success: true, 
        fetched: 0, 
        upserted: 0,
        message: 'No tokens returned from Clanker API'
      });
    }
    
    let upserted = 0;
    let bankrCount = 0;
    let agentCount = 0;
    
    for (const token of tokens) {
      const source = detectSource(token);
      
      if (source === 'bankr') bankrCount++;
      if (source === 'agent') agentCount++;
      
      // Extract token data
      const tokenAddress = token.contract_address || token.address || token.tokenAddress;
      if (!tokenAddress) continue;
      
      const { error } = await supabase
        .from('agents')
        .upsert({
          token_address: tokenAddress.toLowerCase(),
          name: token.name || token.symbol || 'Unknown',
          symbol: token.symbol || '???',
          handle: `@${(token.symbol || 'unknown').toLowerCase()}`,
          karma: 100, // All Clanker tokens are "tokenized" (karma >= 50)
          source: source,
          deployer: token.msg_sender || token.deployer || null,
          cast_hash: token.social_context?.cast_hash || token.castHash || null,
          fid: token.social_context?.fid || token.fid || null,
          pool_address: token.pool_config?.pool_address || token.pool_address || null,
          created_at: token.deployed_at || token.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'token_address',
          ignoreDuplicates: false 
        });
      
      if (!error) upserted++;
    }

    return res.status(200).json({ 
      success: true, 
      fetched: tokens.length,
      upserted,
      bankr: bankrCount,
      agents: agentCount,
      clanker: tokens.length - bankrCount - agentCount
    });

  } catch (error) {
    console.error('Clanker sync error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

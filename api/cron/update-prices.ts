import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const CODEX_API_KEY = process.env.CODEX_API_KEY || '489e53f79f9a03a279561207c02539a9d06180f5';

export const config = { maxDuration: 120 };

export default async function handler(req: any, res: any) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Fetch top 200 Base tokens by volume from Codex
    const codexRes = await fetch('https://graph.codex.io/graphql', {
      method: 'POST',
      headers: {
        'Authorization': CODEX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `{ filterTokens(filters: { network: [8453] }, limit: 200, rankings: { attribute: volume24, direction: DESC }) { results { priceUSD marketCap volume24 liquidity token { address name symbol } } } }`
      })
    });
    
    const codexData = await codexRes.json();
    const tokens = codexData.data?.filterTokens?.results || [];
    
    if (tokens.length === 0) {
      return res.status(200).json({ success: false, message: 'No tokens from Codex' });
    }
    
    // Create lookup map
    const priceMap = new Map();
    for (const t of tokens) {
      priceMap.set(t.token.address.toLowerCase(), {
        price: parseFloat(t.priceUSD) || null,
        mcap: parseFloat(t.marketCap) || null,
        volume_24h: parseFloat(t.volume24) || null,
        liquidity: parseFloat(t.liquidity) || null,
      });
    }
    
    // Get our agents
    const { data: agents } = await supabase
      .from('agents')
      .select('id, token_address')
      .not('token_address', 'is', null);
    
    if (!agents) {
      return res.status(200).json({ success: false, message: 'No agents' });
    }
    
    let updated = 0;
    
    for (const agent of agents) {
      const data = priceMap.get(agent.token_address.toLowerCase());
      if (data && (data.price || data.mcap)) {
        await supabase
          .from('agents')
          .update({
            price: data.price,
            mcap: data.mcap,
            volume_24h: data.volume_24h,
            liquidity: data.liquidity,
            change_24h: null, // Codex doesn't return this in filterTokens
            updated_at: new Date().toISOString(),
          })
          .eq('id', agent.id);
        updated++;
      }
    }
    
    return res.status(200).json({ 
      success: true, 
      codexTokens: tokens.length,
      updated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

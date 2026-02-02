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
    // Get all our agents with token addresses
    const { data: agents } = await supabase
      .from('agents')
      .select('id, token_address')
      .not('token_address', 'is', null);
    
    if (!agents || agents.length === 0) {
      return res.status(200).json({ success: true, updated: 0, message: 'No tokens' });
    }
    
    let updated = 0;
    let errors = 0;
    
    // Batch tokens in groups of 50
    const batchSize = 50;
    
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      const addresses = batch.map(a => a.token_address.toLowerCase());
      
      // Query Codex for these specific tokens
      const codexRes = await fetch('https://graph.codex.io/graphql', {
        method: 'POST',
        headers: {
          'Authorization': CODEX_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `{ 
            filterTokens(
              filters: { 
                network: [8453],
                address: { in: ${JSON.stringify(addresses)} }
              }, 
              limit: 50
            ) { 
              results { 
                priceUSD 
                marketCap 
                volume24 
                liquidity 
                token { address } 
              } 
            } 
          }`
        })
      });
      
      const codexData = await codexRes.json();
      const tokens = codexData.data?.filterTokens?.results || [];
      
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
      
      // Update each agent in batch
      for (const agent of batch) {
        const data = priceMap.get(agent.token_address.toLowerCase());
        if (data && (data.price || data.mcap)) {
          const { error } = await supabase
            .from('agents')
            .update({
              price: data.price,
              mcap: data.mcap,
              volume_24h: data.volume_24h,
              liquidity: data.liquidity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', agent.id);
          
          if (!error) updated++;
          else errors++;
        }
      }
      
      // Rate limit
      await new Promise(r => setTimeout(r, 200));
    }
    
    return res.status(200).json({ 
      success: true, 
      total: agents.length,
      updated,
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

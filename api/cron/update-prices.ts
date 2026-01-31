import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const config = { maxDuration: 60 };

export default async function handler(req: any, res: any) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all tokens with addresses
    const { data: agents } = await supabase
      .from('agents')
      .select('id, token_address')
      .not('token_address', 'is', null)
      .limit(200);

    if (!agents || agents.length === 0) {
      return res.status(200).json({ success: true, updated: 0 });
    }

    let updated = 0;
    
    // Batch into groups of 10
    const batchSize = 10;
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      const addresses = batch.map(a => a.token_address).join(',');
      
      try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addresses}`);
        if (!response.ok) continue;
        
        const data = await response.json();
        const pairs = data.pairs || [];
        
        for (const agent of batch) {
          // Find all pairs for this token, get the one with highest liquidity
          const tokenPairs = pairs.filter((p: any) => 
            p.baseToken?.address?.toLowerCase() === agent.token_address?.toLowerCase()
          );
          
          if (tokenPairs.length > 0) {
            // Sort by liquidity, pick highest
            const pair = tokenPairs.sort((a: any, b: any) => 
              (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
            )[0];
            
            await supabase.from('agents').update({
              price: parseFloat(pair.priceUsd) || null,
              mcap: pair.marketCap || pair.fdv || null,
              volume_24h: pair.volume?.h24 || null,
              liquidity: pair.liquidity?.usd || null,
              change_24h: pair.priceChange?.h24 || null,
              updated_at: new Date().toISOString(),
            }).eq('id', agent.id);
            
            updated++;
          }
        }
      } catch (e) {
        console.error('Batch error:', e);
      }
      
      await new Promise(r => setTimeout(r, 200));
    }

    return res.status(200).json({ success: true, updated, total: agents.length });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

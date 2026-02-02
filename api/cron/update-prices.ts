import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const config = { maxDuration: 120 };

export default async function handler(req: any, res: any) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    // Get agents ordered by volume (prioritize active tokens)
    const { data: agents } = await supabase
      .from('agents')
      .select('id, token_address')
      .not('token_address', 'is', null)
      .order('volume_24h', { ascending: false, nullsFirst: false })
      .limit(200); // Focus on top 200 by volume
    
    if (!agents || agents.length === 0) {
      return res.status(200).json({ success: true, updated: 0 });
    }
    
    let updated = 0;
    const batchSize = 10;
    
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      const addresses = batch.map(a => a.token_address).join(',');
      
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${addresses}`
        );
        
        if (!response.ok) continue;
        
        const data = await response.json();
        const pairs = data.pairs || [];
        
        for (const agent of batch) {
          // Find best pair by liquidity (case insensitive)
          const tokenPairs = pairs.filter((p: any) => 
            p.baseToken?.address?.toLowerCase() === agent.token_address?.toLowerCase() &&
            p.chainId === 'base'
          );
          
          if (tokenPairs.length > 0) {
            const bestPair = tokenPairs.sort((a: any, b: any) => 
              (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
            )[0];
            
            const { error } = await supabase.from('agents').update({
              price: parseFloat(bestPair.priceUsd) || null,
              mcap: bestPair.marketCap || bestPair.fdv || null,
              volume_24h: bestPair.volume?.h24 || null,
              liquidity: bestPair.liquidity?.usd || null,
              change_24h: bestPair.priceChange?.h24 || null,
              updated_at: new Date().toISOString(),
            }).eq('id', agent.id);
            
            if (!error) updated++;
          }
        }
      } catch (e) { 
        console.error('Batch error:', e); 
      }
      
      await new Promise(r => setTimeout(r, 200));
    }
    
    return res.status(200).json({ success: true, total: agents.length, updated });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

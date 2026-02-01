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
    const { data: agents } = await supabase
      .from('agents')
      .select('id, token_address, name')
      .not('token_address', 'is', null);
    if (!agents || agents.length === 0) {
      return res.status(200).json({ success: true, updated: 0, message: 'No tokens' });
    }
    let updated = 0;
    let errors = 0;
    
    const batchSize = 5;
    
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      const addresses = batch.map(a => a.token_address).join(',');
      
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${addresses}`,
          { headers: { 'Accept': 'application/json' } }
        );
        
        if (!response.ok) {
          errors++;
          continue;
        }
        
        const data = await response.json();
        const pairs = data.pairs || [];
        
        for (const agent of batch) {
          const tokenPairs = pairs.filter((p: any) => 
            p.baseToken?.address?.toLowerCase() === agent.token_address?.toLowerCase() &&
            p.chainId === 'base'
          );
          
          if (tokenPairs.length > 0) {
            const bestPair = tokenPairs.sort((a: any, b: any) => 
              (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
            )[0];
            
            const updateData = {
              price: parseFloat(bestPair.priceUsd) || null,
              mcap: bestPair.marketCap || bestPair.fdv || null,
              volume_24h: bestPair.volume?.h24 || null,
              liquidity: bestPair.liquidity?.usd || null,
              change_24h: bestPair.priceChange?.h24 || null,
              updated_at: new Date().toISOString(),
            };
            
            await supabase
              .from('agents')
              .update(updateData)
              .eq('id', agent.id);
            
            updated++;
          }
        }
      } catch (e) {
        errors++;
        console.error('Batch error:', e);
      }
      
      await new Promise(r => setTimeout(r, 300));
    }
    return res.status(200).json({ 
      success: true, 
      updated, 
      total: agents.length,
      errors,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

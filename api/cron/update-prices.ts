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
    const { data: agents } = await supabase
      .from('agents')
      .select('id, token_address, name')
      .not('token_address', 'is', null);

    if (!agents || agents.length === 0) {
      return res.status(200).json({ success: true, updated: 0, message: 'No tokens' });
    }

    let updated = 0;
    let errors = 0;
    
    // Batch into groups of 20
    const batchSize = 20;
    
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      const inputs = batch.map(a => ({ address: a.token_address.toLowerCase(), networkId: 8453 }));
      
      try {
        const response = await fetch('https://graph.codex.io/graphql', {
          method: 'POST',
          headers: {
            'Authorization': CODEX_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: `{
              getTokenPrices(inputs: ${JSON.stringify(inputs).replace(/"([^"]+)":/g, '$1:')}) {
                address
                priceUsd
              }
            }`
          })
        });
        
        const data = await response.json();
        const prices = data.data?.getTokenPrices || [];
        
        for (let j = 0; j < batch.length; j++) {
          const agent = batch[j];
          const priceData = prices[j];
          
          if (priceData && priceData.priceUsd) {
            const price = parseFloat(priceData.priceUsd);
            const { data: tokenInfo } = await supabase
              .from('agents')
              .select('symbol')
              .eq('id', agent.id)
              .single();
            
            // Estimate mcap (price * 1B supply typical for memecoins)
            const mcap = price * 1000000000;
            
            await supabase
              .from('agents')
              .update({
                price: price,
                mcap: mcap,
                updated_at: new Date().toISOString(),
              })
              .eq('id', agent.id);
            
            updated++;
          }
        }
      } catch (e) {
        errors++;
        console.error('Batch error:', e);
      }
      
      await new Promise(r => setTimeout(r, 200));
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

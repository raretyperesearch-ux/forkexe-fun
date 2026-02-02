import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const CODEX_API_KEY = process.env.CODEX_API_KEY || '489e53f79f9a03a279561207c02539a9d06180f5';
const TOKEN_SUPPLY = 100000000000;

export const config = { maxDuration: 120 };

export default async function handler(req: any, res: any) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const { data: agents } = await supabase
      .from('agents')
      .select('id, token_address')
      .not('token_address', 'is', null);
    
    if (!agents || agents.length === 0) {
      return res.status(200).json({ success: true, updated: 0 });
    }
    
    let updated = 0;
    const batchSize = 25;
    
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      const inputs = batch.map(a => `{address: "${a.token_address.toLowerCase()}", networkId: 8453}`).join(', ');
      
      try {
        const codexRes = await fetch('https://graph.codex.io/graphql', {
          method: 'POST',
          headers: { 'Authorization': CODEX_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: `{ getTokenPrices(inputs: [${inputs}]) { address priceUsd } }` })
        });
        
        const codexData = await codexRes.json();
        const prices = codexData.data?.getTokenPrices || [];
        
        const priceMap = new Map();
        for (const p of prices) {
          if (p?.address && p?.priceUsd) priceMap.set(p.address.toLowerCase(), p.priceUsd);
        }
        
        for (const agent of batch) {
          const price = priceMap.get(agent.token_address.toLowerCase());
          if (price) {
            await supabase.from('agents').update({
              price: price,
              mcap: price * TOKEN_SUPPLY,
              updated_at: new Date().toISOString(),
            }).eq('id', agent.id);
            updated++;
          }
        }
      } catch (e) { console.error(e); }
      
      await new Promise(r => setTimeout(r, 300));
    }
    
    return res.status(200).json({ success: true, total: agents.length, updated });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

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
    const response = await fetch('https://clawn.ch/api/tokens');
    const data = await response.json();
    
    if (!data.success || !data.tokens) {
      return res.status(200).json({ error: 'Invalid response', data });
    }
    
    const tokens = data.tokens;
    let upserted = 0;
    
    for (const token of tokens) {
      if (!token.address) continue;
      
      const { error } = await supabase.from('agents').upsert({
        token_address: token.address.toLowerCase(),
        name: token.name || token.symbol || 'Unknown',
        symbol: token.symbol || '???',
        handle: '@' + (token.agent || token.symbol || 'unknown').toLowerCase(),
        karma: 100,
        source: 'clawnch',
        moltbook_id: token.postId || null,
        updated_at: new Date().toISOString(),
        created_at: token.launchedAt || new Date().toISOString(),
      }, { onConflict: 'token_address' });
      
      if (!error) upserted++;
    }

    return res.status(200).json({ 
      success: true, 
      fetched: tokens.length, 
      upserted 
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

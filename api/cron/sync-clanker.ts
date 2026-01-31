import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const config = { maxDuration: 60 };

const AGENT_KEYWORDS = ['agent', 'ai', 'bot', 'claude', 'gpt', 'llm', 'molt', 'claw'];

function detectSource(token: any): string {
  const name = (token.name || '').toLowerCase();
  const symbol = (token.symbol || '').toLowerCase();
  const ctx = JSON.stringify(token.social_context || {}).toLowerCase();
  
  if (ctx.includes('bankr')) return 'bankr';
  if (AGENT_KEYWORDS.some(kw => name.includes(kw) || symbol.includes(kw))) return 'agent';
  return 'clanker';
}

export default async function handler(req: any, res: any) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch('https://www.clanker.world/api/tokens?page=1&limit=50&sort=desc');
    const raw = await response.text();
    
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(200).json({ error: 'Invalid JSON', raw: raw.slice(0, 500) });
    }
    
    const tokens = Array.isArray(data) ? data : (data.tokens || data.data || []);
    
    if (tokens.length === 0) {
      return res.status(200).json({ 
        success: false, 
        message: 'No tokens in response',
        keys: Object.keys(data),
        sample: JSON.stringify(data).slice(0, 500)
      });
    }
    
    let upserted = 0;
    let errors: string[] = [];
    
    for (const token of tokens) {
      const addr = token.contract_address || token.address || token.tokenAddress;
      if (!addr) {
        errors.push('No address: ' + JSON.stringify(token).slice(0, 100));
        continue;
      }
      
      const { error } = await supabase.from('agents').upsert({
        token_address: addr.toLowerCase(),
        name: token.name || 'Unknown',
        symbol: token.symbol || '???',
        handle: '@' + (token.symbol || 'unknown').toLowerCase(),
        karma: 100,
        source: detectSource(token),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'token_address' });
      
      if (error) {
        errors.push(error.message);
      } else {
        upserted++;
      }
    }

    return res.status(200).json({ 
      success: true, 
      fetched: tokens.length, 
      upserted,
      errors: errors.slice(0, 5),
      sampleToken: tokens[0] ? JSON.stringify(tokens[0]).slice(0, 300) : null
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

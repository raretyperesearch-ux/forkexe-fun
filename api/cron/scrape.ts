import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';

export const config = {
  maxDuration: 60,
};

async function scrapeMoltbook() {
  // Get raw markdown content - wait for JS to load
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url: 'https://www.moltbook.com/',
      formats: ['markdown'],
      waitFor: 5000, // Wait 5 seconds for JS to load
    }),
  });

  const data = await response.json();
  const markdown = data.data?.markdown || '';
  
  console.log('Markdown length:', markdown.length);
  console.log('Full markdown:', markdown);

  // Parse agents from markdown
  const agents: { name: string; karma: number; rank: number }[] = [];
  
  // Pattern: agent name followed by karma number
  const pattern = /([A-Za-z][A-Za-z0-9_]+)\s+(\d{2,4})\s*karma/gi;
  let match;
  let rank = 1;
  
  while ((match = pattern.exec(markdown)) !== null) {
    const name = match[1];
    const karma = parseInt(match[2]);
    if (karma >= 50 && karma < 5000) {
      agents.push({ rank: rank++, name, karma });
    }
  }

  // Dedupe
  const seen = new Set();
  const uniqueAgents = agents.filter(a => {
    if (seen.has(a.name.toLowerCase())) return false;
    seen.add(a.name.toLowerCase());
    return true;
  });

  console.log('Final agents:', uniqueAgents);
  return uniqueAgents;
}

function getRandomColor() {
  const colors = ['#E85D04', '#DC2626', '#D97706', '#EA580C', '#F59E0B', '#EF4444', '#F97316', '#22C55E', '#8B5CF6', '#06B6D4', '#10B981', '#F43F5E', '#6366F1'];
  return colors[Math.floor(Math.random() * colors.length)];
}

export default async function handler(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting Moltbook scrape with waitFor...');
    
    const agents = await scrapeMoltbook();
    console.log(`Scraped ${agents.length} agents`);

    let upserted = 0;
    for (const agent of agents) {
      const moltbookId = agent.name.toLowerCase().replace(/\s+/g, '_');
      
      const { data: existing } = await supabase
        .from('agents')
        .select('id, color, token_address')
        .eq('moltbook_id', moltbookId)
        .single();

      const { error } = await supabase
        .from('agents')
        .upsert({
          moltbook_id: moltbookId,
          name: agent.name,
          handle: '@' + agent.name.toLowerCase(),
          karma: agent.karma || 0,
          avatar: agent.name.charAt(0).toUpperCase(),
          color: existing?.color || getRandomColor(),
          last_active: 'recently',
          updated_at: new Date().toISOString(),
          token_address: existing?.token_address || (agent.karma >= 50 ? '0x' + Math.random().toString(16).slice(2, 8) : null),
        }, {
          onConflict: 'moltbook_id',
        });

      if (!error) upserted++;
    }

    return res.status(200).json({ success: true, scraped: agents.length, upserted });
  } catch (error) {
    console.error('Scrape error:', error);
    return res.status(500).json({ error: 'Scrape failed' });
  }
}

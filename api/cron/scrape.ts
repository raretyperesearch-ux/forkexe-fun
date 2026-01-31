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
  // Get raw markdown content
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url: 'https://www.moltbook.com/',
      formats: ['markdown'],
    }),
  });

  const data = await response.json();
  const markdown = data.data?.markdown || '';
  
  console.log('Markdown length:', markdown.length);
  console.log('Full markdown:', markdown);

  // Parse the leaderboard - looking for patterns like "1 Claudy_AI 834 karma"
  const agents: { name: string; karma: number; rank: number }[] = [];
  
  // Look for "Top AI Agents" section
  const topAgentsMatch = markdown.match(/Top AI Agents[\s\S]*?(?=Posts|$)/i);
  const section = topAgentsMatch ? topAgentsMatch[0] : markdown;
  
  console.log('Section to parse:', section);

  // Try to extract agents - multiple patterns
  // Pattern 1: "1 Claudy_AI 834 karma"
  const pattern1 = /(\d{1,2})\s+([A-Za-z][A-Za-z0-9_]+)\s+(\d{2,4})\s*karma/gi;
  let match;
  while ((match = pattern1.exec(section)) !== null) {
    agents.push({ rank: parseInt(match[1]), name: match[2], karma: parseInt(match[3]) });
  }

  // Pattern 2: Look for name followed by number (karma)
  if (agents.length < 5) {
    const pattern2 = /([A-Za-z][A-Za-z0-9_]+)\s+(\d{3,4})/g;
    let rank = 1;
    while ((match = pattern2.exec(markdown)) !== null) {
      const name = match[1];
      const karma = parseInt(match[2]);
      if (karma >= 100 && karma < 2000 && !agents.find(a => a.name.toLowerCase() === name.toLowerCase())) {
        agents.push({ rank: rank++, name, karma });
      }
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
  // Verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Starting Moltbook scrape...');
    
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
      else console.error(`Error upserting ${agent.name}:`, error);
    }

    return res.status(200).json({ 
      success: true, 
      scraped: agents.length,
      upserted,
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return res.status(500).json({ error: 'Scrape failed', details: String(error) });
  }
}

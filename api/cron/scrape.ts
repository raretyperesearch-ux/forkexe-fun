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
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url: 'https://www.moltbook.com/',
      formats: ['extract'],
      extract: {
        schema: {
          type: 'object',
          properties: {
            agents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rank: { type: 'number' },
                  name: { type: 'string' },
                  karma: { type: 'number' },
                  handle: { type: 'string' },
                },
              },
            },
          },
        },
        prompt: 'Extract all agents from the leaderboard with their rank, name, karma score, and Twitter handle.',
      },
    }),
  });

  const data = await response.json();
  return data.data?.extract?.agents || [];
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
      const { error } = await supabase
        .from('agents')
        .upsert({
          moltbook_id: agent.name.toLowerCase().replace(/\s+/g, '_'),
          name: agent.name,
          handle: agent.handle || '@unknown',
          karma: agent.karma || 0,
          avatar: agent.name.charAt(0).toUpperCase(),
          color: getRandomColor(),
          last_active: 'recently',
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'moltbook_id',
        });

      if (!error) upserted++;
    }

    return res.status(200).json({ 
      success: true, 
      scraped: agents.length,
      upserted,
    });
  } catch (error) {
    console.error('Scrape error:', error);
    return res.status(500).json({ error: 'Scrape failed' });
  }
}

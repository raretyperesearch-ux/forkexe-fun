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
            topAgents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  rank: { type: 'number' },
                  name: { type: 'string' },
                  karma: { type: 'number' },
                },
                required: ['name', 'karma'],
              },
            },
          },
          required: ['topAgents'],
        },
        prompt: 'Look at the "Top AI Agents by karma" leaderboard on the RIGHT side of the page. Extract ALL agents shown with their rank number, exact name, and karma score. The list shows agents like Claudy_AI with 834 karma, eudaemon_0 with 783 karma, Dominus with 710 karma, etc. Get all 10 agents from this leaderboard.',
      },
    }),
  });

  const data = await response.json();
  console.log('Firecrawl response:', JSON.stringify(data, null, 2));
  return data.data?.extract?.topAgents || [];
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
      
      // Check if agent exists
      const { data: existing } = await supabase
        .from('agents')
        .select('id, color')
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
          // Auto-tokenize if karma >= 50
          token_address: agent.karma >= 50 ? (existing?.id ? undefined : '0x' + Math.random().toString(16).slice(2, 8)) : null,
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
    return res.status(500).json({ error: 'Scrape failed' });
  }
}

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
      formats: ['markdown'],
      waitFor: 5000,
    }),
  });

  const data = await response.json();
  const markdown = data.data?.markdown || '';
  
  console.log('Markdown length:', markdown.length);

  // Find the Top AI Agents section
  const topSection = markdown.match(/🏆 Top AI Agents[\s\S]*?(?=## 🌊|$)/i);
  const section = topSection ? topSection[0] : markdown;
  
  console.log('Section length:', section.length);

  const agents: { name: string; karma: number; rank: number; handle: string }[] = [];
  
  // The format is: [1\n\nE\n\n✓\n\neudaemon_0\n\n@handle\n\n259\n\nkarma](url)
  // Split by agent links
  const agentLinks = section.match(/\[\d+[\s\S]*?karma\]\(https:\/\/www\.moltbook\.com\/u\/[^)]+\)/g) || [];
  
  console.log('Found agent links:', agentLinks.length);
  
  for (const link of agentLinks) {
    // Extract rank (first number)
    const rankMatch = link.match(/^\[(\d+)/);
    // Extract name (after ✓ and before @)
    const nameMatch = link.match(/✓[\s\\]*\n[\s\\]*\n[\s\\]*([A-Za-z0-9_\s⚡]+?)[\s\\]*\n[\s\\]*\n[\s\\]*@/);
    // Extract karma (number before "karma")
    const karmaMatch = link.match(/(\d+)[\s\\]*\n[\s\\]*\n[\s\\]*karma/);
    // Extract handle
    const handleMatch = link.match(/@([A-Za-z0-9_]+)/);
    
    if (rankMatch && nameMatch && karmaMatch) {
      agents.push({
        rank: parseInt(rankMatch[1]),
        name: nameMatch[1].trim().replace(/\\_/g, '_'),
        handle: handleMatch ? '@' + handleMatch[1] : '@unknown',
        karma: parseInt(karmaMatch[1]),
      });
    }
  }

  console.log('Parsed agents:', JSON.stringify(agents));
  return agents;
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
    console.log('Starting Moltbook scrape v4...');
    
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
          handle: agent.handle,
          karma: agent.karma,
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

    return res.status(200).json({ success: true, scraped: agents.length, upserted });
  } catch (error) {
    console.error('Scrape error:', error);
    return res.status(500).json({ error: 'Scrape failed' });
  }
}

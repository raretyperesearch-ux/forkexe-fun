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

  const agents: { name: string; karma: number; rank: number; handle: string }[] = [];
  
  // Match pattern: [1\n\nE\n\n✓\n\nname\n\n@handle\n\nnumber\n\nkarma](url)
  // The \\ in the log output represents actual backslashes in the string
  const regex = /\[(\d+)\\\n\\\n[A-Z]\\\n\\\n✓\\\n\\\n([^\\\n]+)\\\n\\\n@([^\\\n]+)\\\n\\\n(\d+)\\\n\\\nkarma\]\(https:\/\/www\.moltbook\.com\/u\/[^)]+\)/g;
  
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    agents.push({
      rank: parseInt(match[1]),
      name: match[2].replace(/\\_/g, '_').trim(),
      handle: '@' + match[3].replace(/\\_/g, '_').trim(),
      karma: parseInt(match[4]),
    });
  }
  
  console.log('Regex matches:', agents.length);

  // If regex didn't work, try manual extraction from Top AI Agents section
  if (agents.length === 0) {
    const topSection = markdown.split('🏆 Top AI Agents')[1] || '';
    const submoltSection = topSection.split('🌊 Submolts')[0] || topSection;
    
    console.log('Manual section length:', submoltSection.length);
    
    // Find all moltbook user links in this section
    const userLinks = submoltSection.match(/\(https:\/\/www\.moltbook\.com\/u\/([^)]+)\)/g) || [];
    console.log('User links found:', userLinks.length);
    
    // For each link, extract the username
    const usernames = userLinks.map(link => {
      const m = link.match(/\/u\/([^)]+)/);
      return m ? m[1] : null;
    }).filter(Boolean);
    
    console.log('Usernames:', usernames);
    
    // Now find karma for each - look for pattern "number\n\nkarma" before each username link
    for (let i = 0; i < usernames.length; i++) {
      const username = usernames[i];
      // Find karma by looking for number before this user's section
      const karmaPattern = new RegExp(`(\\d+)\\\\\\n\\\\\\nkarma\\]\\(https:\\/\\/www\\.moltbook\\.com\\/u\\/${username}\\)`);
      const karmaMatch = submoltSection.match(karmaPattern);
      
      if (karmaMatch) {
        agents.push({
          rank: i + 1,
          name: username.replace(/_/g, '_'),
          handle: '@' + username,
          karma: parseInt(karmaMatch[1]),
        });
      }
    }
  }

  console.log('Final agents:', JSON.stringify(agents));
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
    console.log('Starting Moltbook scrape v5...');
    
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

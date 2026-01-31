import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const config = {
  maxDuration: 60,
};

// Colors for avatars
const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default async function handler(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Fetching Moltbook leaderboard...');
    
    // Fetch the Moltbook leaderboard page
    const response = await fetch('https://www.moltbook.com/leaderboard', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      }
    });
    
    if (!response.ok) {
      // Try the main page if leaderboard doesn't exist
      const mainResponse = await fetch('https://www.moltbook.com/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });
      
      if (!mainResponse.ok) {
        throw new Error(`Moltbook returned ${mainResponse.status}`);
      }
    }
    
    const html = await response.text();
    console.log('Fetched HTML length:', html.length);
    
    // Try to find JSON data in the page (Next.js/React apps often embed data)
    const jsonMatches = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
    
    let agents: any[] = [];
    
    if (jsonMatches) {
      try {
        const nextData = JSON.parse(jsonMatches[1]);
        console.log('Found Next.js data');
        // Navigate through the data structure to find agents
        const pageProps = nextData?.props?.pageProps;
        if (pageProps?.agents) {
          agents = pageProps.agents;
        } else if (pageProps?.leaderboard) {
          agents = pageProps.leaderboard;
        } else if (pageProps?.users) {
          agents = pageProps.users;
        }
      } catch (e) {
        console.log('Could not parse Next.js data');
      }
    }
    
    // Fallback: Try to extract from HTML patterns
    if (agents.length === 0) {
      // Look for agent data in various formats
      const karmaPattern = /(?:karma|score|points)["\s:]+(\d+)/gi;
      const namePattern = /(?:name|username|agent)["\s:]+["']([^"']+)["']/gi;
      const handlePattern = /@(\w+)/g;
      
      // Extract potential agent blocks
      const agentBlocks = html.match(/<div[^>]*class="[^"]*agent[^"]*"[^>]*>[\s\S]*?<\/div>/gi) || [];
      console.log('Found agent blocks:', agentBlocks.length);
      
      // Also try to find a JSON API endpoint hint
      const apiMatch = html.match(/["']\/api\/(?:agents|leaderboard|users)[^"']*["']/);
      if (apiMatch) {
        console.log('Found API hint:', apiMatch[0]);
      }
    }
    
    // If still no agents, try the API directly
    if (agents.length === 0) {
      const apiEndpoints = [
        'https://www.moltbook.com/api/leaderboard',
        'https://www.moltbook.com/api/agents',
        'https://www.moltbook.com/api/users',
        'https://api.moltbook.com/leaderboard',
        'https://api.moltbook.com/agents',
      ];
      
      for (const endpoint of apiEndpoints) {
        try {
          console.log('Trying API:', endpoint);
          const apiRes = await fetch(endpoint, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0',
            }
          });
          if (apiRes.ok) {
            const data = await apiRes.json();
            if (Array.isArray(data)) {
              agents = data;
              console.log('Got agents from:', endpoint);
              break;
            } else if (data.agents) {
              agents = data.agents;
              break;
            } else if (data.leaderboard) {
              agents = data.leaderboard;
              break;
            } else if (data.data) {
              agents = data.data;
              break;
            }
          }
        } catch (e) {
          console.log('API failed:', endpoint);
        }
      }
    }
    
    console.log('Total agents found:', agents.length);
    
    if (agents.length === 0) {
      return res.status(200).json({ 
        success: true, 
        scraped: 0, 
        upserted: 0,
        message: 'No agents found - Moltbook structure may have changed'
      });
    }
    
    // Take top 100 by karma
    const topAgents = agents
      .sort((a: any, b: any) => (b.karma || b.score || b.points || 0) - (a.karma || a.score || a.points || 0))
      .slice(0, 100);
    
    let upserted = 0;
    
    for (const agent of topAgents) {
      const name = agent.name || agent.username || agent.displayName || 'Unknown';
      const handle = agent.handle || agent.twitter || agent.username ? `@${(agent.handle || agent.twitter || agent.username).replace('@', '')}` : `@${name.toLowerCase()}`;
      const karma = agent.karma || agent.score || agent.points || 0;
      const moltbookId = agent.id || agent.userId || name.toLowerCase().replace(/\s+/g, '_');
      
      const { error } = await supabase
        .from('agents')
        .upsert({
          moltbook_id: moltbookId,
          name: name,
          handle: handle,
          karma: karma,
          avatar: name.charAt(0).toUpperCase(),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          last_active: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'moltbook_id',
          ignoreDuplicates: false 
        });
      
      if (!error) upserted++;
    }

    return res.status(200).json({ 
      success: true, 
      scraped: topAgents.length,
      upserted 
    });

  } catch (error) {
    console.error('Scrape error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

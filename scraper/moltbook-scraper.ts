import Firecrawl from '@mendable/firecrawl-js';

const FIRECRAWL_API_KEY = 'fc-1a0cdcb1978041fe93f93231ca7a676f';

const firecrawl = new Firecrawl({ apiKey: FIRECRAWL_API_KEY });

interface MoltbookAgent {
  rank: number;
  name: string;
  karma: number;
  handle: string;
  avatar: string;
  color: string;
  lastActive?: string;
}

async function scrapeMoltbookTopAgents(): Promise<MoltbookAgent[]> {
  console.log('🦞 Scraping Moltbook top agents...');
  
  try {
    // Scrape the main page
    const result = await firecrawl.scrapeUrl('https://www.moltbook.com/', {
      formats: ['markdown', 'html'],
    });

    if (!result.success) {
      throw new Error('Failed to scrape Moltbook');
    }

    console.log('✅ Scraped successfully');
    console.log('Content length:', result.markdown?.length || 0);
    
    // Parse the markdown/html to extract agent data
    const agents = parseAgentData(result.markdown || '', result.html || '');
    
    console.log(`Found ${agents.length} agents`);
    return agents;
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
    throw error;
  }
}

function parseAgentData(markdown: string, html: string): MoltbookAgent[] {
  const agents: MoltbookAgent[] = [];
  
  // Try to extract from the "Top AI Agents by karma" section
  // Pattern: rank, name, handle, karma
  
  // Regex patterns to find agent data
  const agentPattern = /(\d+)\s*([A-Za-z_0-9]+)\s*@([A-Za-z_0-9]+)\s*(\d+)\s*karma/gi;
  
  let match;
  while ((match = agentPattern.exec(markdown)) !== null) {
    agents.push({
      rank: parseInt(match[1]),
      name: match[2],
      karma: parseInt(match[4]),
      handle: `@${match[3]}`,
      avatar: match[2].charAt(0).toUpperCase(),
      color: getRandomColor(),
    });
  }

  // If regex didn't work, try line-by-line parsing
  if (agents.length === 0) {
    console.log('Trying alternative parsing...');
    const lines = markdown.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for karma mentions
      if (line.includes('karma')) {
        const karmaMatch = line.match(/(\d+)\s*karma/i);
        const handleMatch = line.match(/@([A-Za-z_0-9]+)/);
        
        if (karmaMatch && handleMatch) {
          // Look for name in previous lines
          const prevLines = lines.slice(Math.max(0, i - 3), i).join(' ');
          const nameMatch = prevLines.match(/([A-Za-z_0-9]+)(?=\s|$)/);
          
          if (nameMatch) {
            agents.push({
              rank: agents.length + 1,
              name: nameMatch[1],
              karma: parseInt(karmaMatch[1]),
              handle: `@${handleMatch[1]}`,
              avatar: nameMatch[1].charAt(0).toUpperCase(),
              color: getRandomColor(),
            });
          }
        }
      }
    }
  }

  // Dedupe by name
  const seen = new Set<string>();
  return agents.filter(agent => {
    if (seen.has(agent.name)) return false;
    seen.add(agent.name);
    return true;
  });
}

function getRandomColor(): string {
  const colors = ['#E85D04', '#DC2626', '#D97706', '#EA580C', '#F59E0B', '#EF4444', '#F97316', '#22C55E'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Also scrape individual agent pages for more details
async function scrapeAgentDetails(agentName: string): Promise<any> {
  console.log(`🔍 Scraping details for ${agentName}...`);
  
  try {
    const result = await firecrawl.scrapeUrl(`https://www.moltbook.com/agent/${agentName}`, {
      formats: ['markdown'],
    });

    if (!result.success) {
      return null;
    }

    return {
      name: agentName,
      content: result.markdown,
    };
  } catch (error) {
    console.error(`Failed to scrape ${agentName}:`, error);
    return null;
  }
}

// Export for use in the app
export { scrapeMoltbookTopAgents, scrapeAgentDetails, type MoltbookAgent };

// Run directly
async function main() {
  console.log('🚀 Starting Moltbook scraper...\n');
  
  const agents = await scrapeMoltbookTopAgents();
  
  console.log('\n📊 Results:\n');
  console.log(JSON.stringify(agents, null, 2));
  
  // Generate code for AgentDiscovery.tsx
  console.log('\n\n// Copy this to MOLTBOOK_AGENTS in AgentDiscovery.tsx:\n');
  console.log('const MOLTBOOK_AGENTS = [');
  agents.forEach((agent, i) => {
    console.log(`  { id: ${i + 1}, name: '${agent.name}', karma: ${agent.karma}, handle: '${agent.handle}', avatar: '${agent.avatar}', color: '${agent.color}', status: 'not_tokenized', lastActive: '${Math.floor(Math.random() * 30) + 1}m ago', posts: ${Math.floor(Math.random() * 500) + 50}, tokenAddress: null, mcap: null, price: null, change24h: null, accumulatedFees: 0 },`);
  });
  console.log('];');
}

main().catch(console.error);

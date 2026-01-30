// Quick test of Firecrawl on Moltbook
// Run: npx tsx test-scrape.ts

const FIRECRAWL_API_KEY = 'fc-1a0cdcb1978041fe93f93231ca7a676f';

async function testScrape() {
  console.log('🦞 Testing Firecrawl on Moltbook...\n');

  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
    },
    body: JSON.stringify({
      url: 'https://www.moltbook.com/',
      formats: ['markdown', 'extract'],
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
                  handle: { type: 'string' },
                },
              },
            },
            recentAgents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  handle: { type: 'string' },
                  lastActive: { type: 'string' },
                },
              },
            },
            stats: {
              type: 'object',
              properties: {
                totalAgents: { type: 'number' },
                submolts: { type: 'number' },
                posts: { type: 'number' },
                comments: { type: 'number' },
              },
            },
          },
        },
      },
    }),
  });

  const data = await response.json();
  
  console.log('📊 Raw response:\n');
  console.log(JSON.stringify(data, null, 2));

  if (data.success && data.data?.extract) {
    console.log('\n\n✅ Extracted data:\n');
    console.log(JSON.stringify(data.data.extract, null, 2));

    // Generate MOLTBOOK_AGENTS array
    if (data.data.extract.topAgents) {
      console.log('\n\n// MOLTBOOK_AGENTS for AgentDiscovery.tsx:\n');
      console.log('const MOLTBOOK_AGENTS = [');
      data.data.extract.topAgents.forEach((agent: any, i: number) => {
        const colors = ['#E85D04', '#DC2626', '#D97706', '#EA580C', '#F59E0B', '#EF4444', '#F97316'];
        const color = colors[i % colors.length];
        const status = i < 3 ? 'live' : (i < 6 ? 'launching' : 'not_tokenized');
        const launchTime = status === 'launching' ? `, launchTime: '${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 59)}m'` : '';
        const mcap = status === 'live' ? Math.floor(Math.random() * 5000000) + 500000 : null;
        const fees = status === 'live' ? Math.floor(Math.random() * 10000) + 1000 : 0;
        
        console.log(`  { id: ${i + 1}, name: '${agent.name}', karma: ${agent.karma}, handle: '${agent.handle}', avatar: '${agent.name?.charAt(0).toUpperCase() || 'A'}', color: '${color}', status: '${status}', lastActive: '${Math.floor(Math.random() * 30) + 1}m ago', posts: ${Math.floor(Math.random() * 500) + 50}, tokenAddress: ${status === 'live' ? `'0x${Math.random().toString(16).slice(2, 8)}'` : 'null'}, mcap: ${mcap}, price: ${mcap ? (Math.random() * 0.01).toFixed(5) : 'null'}, change24h: ${mcap ? (Math.random() * 200 - 50).toFixed(1) : 'null'}, accumulatedFees: ${fees}${launchTime} },`);
      });
      console.log('];');
    }
  }
}

testScrape().catch(console.error);

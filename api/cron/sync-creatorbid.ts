import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const config = { maxDuration: 60 };

interface CreatorBidAgent {
  _id: string;
  name: string;
  symbol: string;
  profilePicture?: string;
  twitter?: { username?: string };
  agentKeyAddress?: string;
  marketCap?: string;
  cumulativeETHVolume?: string;
  createdAtBlockTimestamp?: string;
  isKYCVerified?: boolean;
  chainId?: string;
}

export default async function handler(req: any, res: any) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Fetch agents from CreatorBid API (paginated)
    let allAgents: CreatorBidAgent[] = [];
    let page = 1;
    const limit = 100;
    
    // Fetch up to 10 pages (1000 agents max per run)
    while (page <= 10) {
      const response = await fetch(
        `https://creator.bid/api/agents?limit=${limit}&page=${page}&sortDirection=desc&sortBy=marketCap&extra=twitter`
      );
      
      if (!response.ok) break;
      
      const data = await response.json();
      
      const agents = data.agents || data.data || data;
      if (!Array.isArray(agents) || agents.length === 0) break;
      
      allAgents = [...allAgents, ...agents];
      
      if (agents.length < limit) break; // Last page
      page++;
    }
    
    if (allAgents.length === 0) {
      return res.status(200).json({ error: 'No agents found', page });
    }
    
    let upserted = 0;
    let skipped = 0;
    
    for (const agent of allAgents) {
      // Only process Base chain agents (chainId 8453)
      if (agent.chainId && agent.chainId !== '8453') {
        skipped++;
        continue;
      }
      
      const tokenAddress = agent.agentKeyAddress;
      if (!tokenAddress) {
        skipped++;
        continue;
      }
      
      // Extract twitter handle
      let handle = '@creatorbid';
      if (agent.twitter?.username) {
        handle = '@' + agent.twitter.username;
      }
      
      // Parse marketCap (comes as string like "3626555.439...")
      const mcap = agent.marketCap ? parseFloat(agent.marketCap) : null;
      
      // Convert block timestamp to ISO date
      let createdAt = new Date().toISOString();
      if (agent.createdAtBlockTimestamp) {
        createdAt = new Date(parseInt(agent.createdAtBlockTimestamp) * 1000).toISOString();
      }
      
      const { error } = await supabase.from('agents').upsert({
        token_address: tokenAddress.toLowerCase(),
        name: agent.name || agent.symbol || 'Unknown',
        symbol: agent.symbol || '???',
        handle: handle,
        avatar: agent.profilePicture || null,
        karma: agent.isKYCVerified ? 100 : 0,
        source: 'creatorbid',
        moltbook_id: agent._id || null,
        mcap: mcap,
        chain: 'base',
        updated_at: new Date().toISOString(),
        created_at: createdAt,
      }, { onConflict: 'token_address' });
      
      if (!error) upserted++;
    }

    return res.status(200).json({ 
      success: true, 
      fetched: allAgents.length, 
      upserted,
      skipped
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const config = {
  maxDuration: 60,
};

async function fetchDexScreenerData(tokenAddress: string) {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    const data = await response.json();
    
    if (data.pairs && data.pairs.length > 0) {
      // Get the pair with highest liquidity
      const pair = data.pairs.sort((a: any, b: any) => 
        (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
      )[0];
      
      return {
        price: parseFloat(pair.priceUsd) || 0,
        mcap: pair.marketCap || pair.fdv || 0,
        volume_24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        change_24h: pair.priceChange?.h24 || 0,
        chain: pair.chainId,
        dexId: pair.dexId,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching ${tokenAddress}:`, error);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Fetching tokenized agents...');
    
    // Get all agents with real token addresses (0x... and length 42)
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .like('token_address', '0x%');

    if (error) throw error;

    // Filter to only real addresses (42 chars for ETH/Base)
    const tokenizedAgents = (agents || []).filter(a => 
      a.token_address && a.token_address.length >= 40
    );

    console.log(`Found ${tokenizedAgents.length} tokenized agents`);

    let updated = 0;
    
    for (const agent of tokenizedAgents) {
      const priceData = await fetchDexScreenerData(agent.token_address);
      
      if (priceData && priceData.price > 0) {
        console.log(`${agent.name}: $${priceData.price}, MCap: $${priceData.mcap}`);
        
        const { error: updateError } = await supabase
          .from('agents')
          .update({
            price: priceData.price,
            mcap: priceData.mcap,
            volume_24h: priceData.volume_24h,
            liquidity: priceData.liquidity,
            change_24h: priceData.change_24h,
            updated_at: new Date().toISOString(),
          })
          .eq('id', agent.id);

        if (!updateError) updated++;
      } else {
        console.log(`${agent.name}: No data found on DexScreener`);
      }
      
      // Rate limit - wait 200ms between requests
      await new Promise(r => setTimeout(r, 200));
    }

    return res.status(200).json({ 
      success: true, 
      agents: tokenizedAgents.length,
      updated 
    });

  } catch (error) {
    console.error('Price update error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

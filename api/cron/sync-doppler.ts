import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

const DOPPLER_GRAPHQL = 'https://indexer.doppler.lol/graphql';

const POOLS_QUERY = `
  query GetPools($chainId: Int!, $limit: Int!) {
    pools(
      where: { chainId: $chainId }
      orderBy: "volumeUsd"
      orderDirection: "desc"
      limit: $limit
    ) {
      address
      price
      dollarLiquidity
      volumeUsd
      baseToken {
        address
        name
        symbol
        image
        holderCount
      }
      quoteToken {
        symbol
      }
    }
  }
`;

interface DopplerPool {
  address: string;
  price: string | number;
  dollarLiquidity: string | number;
  volumeUsd: string | number;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
    image?: string;
    holderCount?: number;
  };
  quoteToken: {
    symbol: string;
  };
}

async function fetchDopplerPools(): Promise<DopplerPool[]> {
  try {
    const response = await fetch(DOPPLER_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: POOLS_QUERY,
        variables: { chainId: 8453, limit: 100 }
      })
    });

    if (!response.ok) {
      throw new Error(`Doppler API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return [];
    }

    return data.data?.pools || [];
  } catch (error) {
    console.error('Error fetching Doppler pools:', error);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Starting Doppler sync...');

  try {
    const pools = await fetchDopplerPools();
    console.log(`Fetched ${pools.length} pools from Doppler`);

    if (pools.length === 0) {
      return res.status(200).json({ success: true, message: 'No pools found', synced: 0 });
    }

    let synced = 0;
    let errors = 0;

    for (const pool of pools) {
      try {
        const token = pool.baseToken;
        if (!token?.address || !token?.symbol) continue;
        if (['WETH', 'ETH', 'USDC', 'USDT', 'DAI'].includes(token.symbol.toUpperCase())) continue;

        const price = parseFloat(String(pool.price)) || 0;
        const liquidity = parseFloat(String(pool.dollarLiquidity)) || 0;
        const volume = parseFloat(String(pool.volumeUsd)) || 0;
        const mcap = liquidity > 0 ? liquidity * 2 : 0;

        const agentData = {
          name: token.name || token.symbol,
          symbol: token.symbol,
          token_address: token.address.toLowerCase(),
          price,
          mcap,
          volume_24h: volume,
          liquidity,
          source: 'doppler',
          image_url: token.image || null,
          holder_count: token.holderCount || null,
          pool_address: pool.address,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('agents')
          .upsert(agentData, { onConflict: 'token_address', ignoreDuplicates: false });

        if (error) {
          console.error(`Error upserting ${token.symbol}:`, error.message);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        console.error('Error processing pool:', err);
        errors++;
      }
    }

    return res.status(200).json({ success: true, source: 'doppler', fetched: pools.length, synced, errors });
  } catch (error) {
    console.error('Doppler sync failed:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}

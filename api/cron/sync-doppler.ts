import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

// Doppler REST API (discovered from app.doppler.lol)
const DOPPLER_API = 'https://app.doppler.lol/api/explore';

interface DopplerToken {
  address: string;
  name: string;
  symbol: string;
  image?: string;
  price?: number;
  priceUsd?: number;
  marketCap?: number;
  marketCapUsd?: number;
  volume24h?: number;
  volumeUsd?: number;
  liquidity?: number;
  liquidityUsd?: number;
  dollarLiquidity?: number;
  percentDayChange?: number;
  percent_day_change?: number;
  holderCount?: number;
  chainId?: number;
  poolAddress?: string;
}

async function fetchDopplerTokens(): Promise<DopplerToken[]> {
  try {
    // Fetch Base chain (8453) tokens sorted by volume
    const url = `${DOPPLER_API}?chains=8453&sortBy=volume_usd&sortDirection=desc&offset=0&limit=100`;
    
    console.log('Fetching from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AgentScreener/1.0'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Doppler API error:', response.status, text);
      throw new Error(`Doppler API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Doppler response type:', typeof data, Array.isArray(data) ? `array[${data.length}]` : 'object');
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data;
    } else if (data.tokens) {
      return data.tokens;
    } else if (data.data) {
      return data.data;
    } else if (data.pools) {
      // Extract tokens from pools
      return data.pools.map((pool: any) => ({
        address: pool.baseToken?.address || pool.tokenAddress,
        name: pool.baseToken?.name || pool.name,
        symbol: pool.baseToken?.symbol || pool.symbol,
        image: pool.baseToken?.image || pool.image,
        priceUsd: pool.price || pool.priceUsd,
        volumeUsd: pool.volumeUsd || pool.volume24h,
        dollarLiquidity: pool.dollarLiquidity || pool.liquidityUsd,
        percentDayChange: pool.percentDayChange || pool.percent_day_change,
        poolAddress: pool.address
      }));
    }
    
    console.log('Unknown response format:', Object.keys(data));
    return [];
  } catch (error) {
    console.error('Error fetching Doppler tokens:', error);
    return [];
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Starting Doppler sync...');

  try {
    const tokens = await fetchDopplerTokens();
    console.log(`Fetched ${tokens.length} tokens from Doppler`);

    if (tokens.length === 0) {
      return res.status(200).json({ success: true, message: 'No tokens found', synced: 0 });
    }

    let synced = 0;
    let errors = 0;

    for (const token of tokens) {
      try {
        if (!token.address || !token.symbol) continue;
        if (['WETH', 'ETH', 'USDC', 'USDT', 'DAI'].includes(token.symbol.toUpperCase())) continue;

        const price = token.priceUsd || token.price || 0;
        const liquidity = token.dollarLiquidity || token.liquidityUsd || token.liquidity || 0;
        const volume = token.volumeUsd || token.volume24h || 0;
        const mcap = token.marketCapUsd || token.marketCap || (liquidity > 0 ? liquidity * 2 : 0);
        const change = token.percentDayChange || token.percent_day_change || 0;

        const agentData = {
          name: token.name || token.symbol,
          symbol: token.symbol,
          token_address: token.address.toLowerCase(),
          price,
          mcap,
          volume_24h: volume,
          liquidity,
          change_24h: change,
          source: 'doppler',
          image_url: token.image || null,
          holder_count: token.holderCount || null,
          pool_address: token.poolAddress || null,
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
        console.error('Error processing token:', err);
        errors++;
      }
    }

    return res.status(200).json({ 
      success: true, 
      source: 'doppler', 
      fetched: tokens.length, 
      synced, 
      errors 
    });
  } catch (error) {
    console.error('Doppler sync failed:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}

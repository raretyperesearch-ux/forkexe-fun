import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
);

const DOPPLER_API = 'https://app.doppler.lol/api/explore';

// Convert wei string to USD (divide by 1e18)
function weiToUsd(value: string | number | null | undefined): number {
  if (!value) return 0;
  const str = String(value);
  // Handle very large numbers by using BigInt-like math
  if (str.length > 15) {
    // Divide by removing last 18 digits, then parse
    const intPart = str.slice(0, -18) || '0';
    const decPart = str.slice(-18).padStart(18, '0').slice(0, 2);
    return parseFloat(`${intPart}.${decPart}`);
  }
  return parseFloat(str) / 1e18;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Starting Doppler sync...');

  try {
    const url = `${DOPPLER_API}?chains=8453&sortBy=volume&sortDirection=desc&offset=0&limit=100`;
    console.log('Fetching:', url);
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      return res.status(500).json({ error: `API error: ${response.status}` });
    }

    const data = await response.json();
    const pools = data.pools || [];
    console.log(`Fetched ${pools.length} pools`);

    if (pools.length === 0) {
      return res.status(200).json({ success: true, message: 'No pools', synced: 0 });
    }

    let synced = 0;
    let errors = 0;
    const samples: any[] = [];

    for (const pool of pools) {
      try {
        const token = pool.baseToken;
        if (!token?.address || !token?.symbol) continue;
        if (['WETH', 'ETH', 'USDC', 'USDT', 'DAI'].includes(token.symbol.toUpperCase())) continue;

        const mcap = weiToUsd(pool.marketCapUsd);
        const liquidity = weiToUsd(pool.liquidity);
        const volume = weiToUsd(pool.volume);
        const change = pool.percentDayChange ? parseFloat(pool.percentDayChange) : 0;
        const price = mcap > 0 ? mcap / 1000000000 : 0;

        // Skip tiny tokens
        if (mcap < 1000 && liquidity < 1000) continue;

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
          holder_count: pool.holderCount || null,
          updated_at: new Date().toISOString()
        };

        if (synced < 3) {
          samples.push({ symbol: token.symbol, mcap, volume, change });
        }

        const { error } = await supabase
          .from('agents')
          .upsert(agentData, { onConflict: 'token_address', ignoreDuplicates: false });

        if (error) {
          console.error(`Error ${token.symbol}:`, error.message);
          errors++;
        } else {
          synced++;
        }
      } catch (err) {
        errors++;
      }
    }

    return res.status(200).json({ 
      success: true, 
      fetched: pools.length, 
      synced, 
      errors,
      samples
    });
  } catch (error) {
    console.error('Doppler sync failed:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
}

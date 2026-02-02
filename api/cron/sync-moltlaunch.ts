import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);
export const config = { maxDuration: 180 };
const ETH_PRICE_USD = 2300;

export default async function handler(req: any, res: any) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    let allTokens: any[] = [];
    let offset = 0;
    const limit = 50;
    
    // Paginate through all tokens
    while (true) {
      const response = await fetch(`https://api.flayerlabs.xyz/v1/base/tokens?managerAddress=0x3Bc08524d9DaaDEC9d1Af87818d809611F0fD669&orderBy=datecreated&orderDirection=desc&limit=${limit}&offset=${offset}`);
      const data = await response.json();
      
      if (!data.data || data.data.length === 0) break;
      
      allTokens = allTokens.concat(data.data);
      offset += limit;
      
      if (offset > 500) break;
      await new Promise(r => setTimeout(r, 200));
    }
    
    let upserted = 0;
    let pricesUpdated = 0;
    
    for (const token of allTokens) {
      if (!token.tokenAddress) continue;
      
      const address = token.tokenAddress.toLowerCase();
      
      // Convert marketCapETH from wei to USD (fallback)
      const mcapWei = BigInt(token.marketCapETH || '0');
      const mcapEth = Number(mcapWei) / 1e18;
      const mcapUsd = mcapEth * ETH_PRICE_USD;
      
      // Fetch real price data from DexScreener
      let price = null, volume = null, liquidity = null, change24h = null, realMcap = mcapUsd;
      
      try {
        const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        const dexData = await dexRes.json();
        const pairs = (dexData.pairs || []).filter((p: any) => 
          p.baseToken?.address?.toLowerCase() === address && p.chainId === 'base'
        );
        
        if (pairs.length > 0) {
          const best = pairs.sort((a: any, b: any) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
          price = parseFloat(best.priceUsd) || null;
          realMcap = best.marketCap || best.fdv || mcapUsd;
          volume = best.volume?.h24 || null;
          liquidity = best.liquidity?.usd || null;
          change24h = best.priceChange?.h24 || null;
          pricesUpdated++;
        }
      } catch (e) {}
      
      const { error } = await supabase.from('agents').upsert({
        token_address: address,
        name: token.name || token.symbol || 'Unknown',
        symbol: token.symbol || '???',
        handle: '@' + (token.symbol || 'unknown').toLowerCase(),
        avatar: token.image || null,
        karma: 100,
        source: 'moltlaunch',
        price,
        mcap: realMcap > 0 ? realMcap : null,
        volume_24h: volume,
        liquidity,
        change_24h: change24h,
        updated_at: new Date().toISOString(),
        created_at: token.createdAt ? new Date(token.createdAt * 1000).toISOString() : new Date().toISOString(),
      }, { onConflict: 'token_address' });
      
      if (!error) upserted++;
      
      // Rate limit DexScreener
      await new Promise(r => setTimeout(r, 250));
    }
    
    return res.status(200).json({ 
      success: true, 
      fetched: allTokens.length, 
      upserted,
      pricesUpdated
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

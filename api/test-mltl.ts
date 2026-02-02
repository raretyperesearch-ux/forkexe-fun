import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export default async function handler(req: any, res: any) {
  const address = '0xa448d40f6793773938a6b7427091c35676899125';
  
  // Fetch from DexScreener
  const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
  const data = await response.json();
  const pairs = data.pairs || [];
  
  // Find Base pairs
  const basePairs = pairs.filter((p: any) => 
    p.baseToken?.address?.toLowerCase() === address.toLowerCase() &&
    p.chainId === 'base'
  );
  
  if (basePairs.length === 0) {
    return res.status(200).json({ error: 'No base pairs found', pairsCount: pairs.length });
  }
  
  // Get best pair by liquidity
  const bestPair = basePairs.sort((a: any, b: any) => 
    (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
  )[0];
  
  // Update Supabase
  const updateData = {
    price: parseFloat(bestPair.priceUsd) || null,
    mcap: bestPair.marketCap || bestPair.fdv || null,
    volume_24h: bestPair.volume?.h24 || null,
    liquidity: bestPair.liquidity?.usd || null,
    change_24h: bestPair.priceChange?.h24 || null,
    updated_at: new Date().toISOString(),
  };
  
  const { error } = await supabase
    .from('agents')
    .update(updateData)
    .eq('token_address', address);
  
  return res.status(200).json({ 
    success: !error,
    error: error?.message,
    updateData,
    basePairsCount: basePairs.length,
    bestPairAddress: bestPair.baseToken?.address
  });
}

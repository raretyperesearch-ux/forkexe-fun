import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export const config = { maxDuration: 60 };

interface TrenchesToken {
  address: string;
  name: string;
  symbol: string;
  imageUrl?: string;
  marketCapUSD?: string;
  createdAt?: string;
  wasCreatedByAgent?: boolean;
  chainId?: string;
}

export default async function handler(req: any, res: any) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let allTokens: TrenchesToken[] = [];
    let offset = 0;
    const limit = 50;
    
    // Fetch all pages
    while (true) {
      const response = await fetch(
        `https://trenches.bid/api/tokens?chainId=8453&limit=${limit}&offset=${offset}`
      );
      
      if (!response.ok) break;
      
      const data = await response.json();
      const tokens = data.data || [];
      
      if (!Array.isArray(tokens) || tokens.length === 0) break;
      
      allTokens = [...allTokens, ...tokens];
      
      if (!data.pagination?.hasMore) break;
      offset += limit;
      
      // Safety limit
      if (offset > 500) break;
    }
    
    if (allTokens.length === 0) {
      return res.status(200).json({ error: 'No tokens found' });
    }
    
    let upserted = 0;
    let skipped = 0;
    
    for (const token of allTokens) {
      if (!token.address) {
        skipped++;
        continue;
      }
      
      // Parse marketCap
      const mcap = token.marketCapUSD ? parseFloat(token.marketCapUSD) : null;
      
      // Skip tokens with essentially 0 mcap
      if (mcap !== null && mcap < 0.01) {
        skipped++;
        continue;
      }
      
      const { error } = await supabase.from('agents').upsert({
        token_address: '0x' + token.address.toLowerCase(),
        name: token.name || token.symbol || 'Unknown',
        symbol: token.symbol || '???',
        handle: '@trenchesbid',
        avatar: token.imageUrl || null,
        karma: token.wasCreatedByAgent ? 100 : 0,
        source: 'trenches',
        mcap: mcap,
        updated_at: new Date().toISOString(),
        created_at: token.createdAt || new Date().toISOString(),
      }, { onConflict: 'token_address' });
      
      if (!error) upserted++;
    }

    return res.status(200).json({ 
      success: true, 
      fetched: allTokens.length, 
      upserted,
      skipped
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

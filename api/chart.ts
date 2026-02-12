export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { token, pool, timeframe, trades } = req.query;

  try {
    // Fetch trades for a pool
    if (trades === 'true' && pool && typeof pool === 'string') {
      const tradesRes = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/base/pools/${pool}/trades?trade_volume_in_usd_greater_than=0`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      const data = await tradesRes.json();
      return res.status(200).json(data);
    }

    // If we have a pool address, fetch OHLCV directly
    if (pool && typeof pool === 'string') {
      let aggregate = '15';
      let limit = 96;

      if (timeframe === '1h') {
        aggregate = '1';
        limit = 60;
      } else if (timeframe === '6h') {
        aggregate = '5';
        limit = 72;
      } else if (timeframe === '24h') {
        aggregate = '15';
        limit = 96;
      } else if (timeframe === '7d') {
        aggregate = '60';
        limit = 168;
      }

      const ohlcvRes = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/base/pools/${pool}/ohlcv/minute?aggregate=${aggregate}&limit=${limit}&currency=usd`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      const data = await ohlcvRes.json();
      return res.status(200).json(data);
    }

    // If we have a token address, fetch pools first
    if (token && typeof token === 'string') {
      const url = `https://api.geckoterminal.com/api/v2/networks/base/tokens/${token}/pools?page=1`;
      console.log('Fetching pools for token:', token, 'URL:', url);
      
      const poolsRes = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!poolsRes.ok) {
        console.error('GeckoTerminal API error:', poolsRes.status, poolsRes.statusText);
        return res.status(200).json({ data: [], error: `API returned ${poolsRes.status}` });
      }

      const data = await poolsRes.json();
      console.log('Pools response:', JSON.stringify(data).slice(0, 200));
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: 'Missing token or pool parameter' });
  } catch (error) {
    console.error('GeckoTerminal proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch data', details: String(error) });
  }
}



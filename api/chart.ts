export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { token, pool, timeframe } = req.query;

  try {
    if (pool && typeof pool === 'string') {
      let aggregate = '15';
      let limit = 96;

      if (timeframe === '1h') { aggregate = '1'; limit = 60; }
      else if (timeframe === '6h') { aggregate = '5'; limit = 72; }
      else if (timeframe === '24h') { aggregate = '15'; limit = 96; }
      else if (timeframe === '7d') { aggregate = '60'; limit = 168; }

      const ohlcvRes = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/base/pools/${pool}/ohlcv/minute?aggregate=${aggregate}&limit=${limit}&currency=usd`,
        { headers: { 'Accept': 'application/json' } }
      );
      return res.status(200).json(await ohlcvRes.json());
    }

    if (token && typeof token === 'string') {
      const poolsRes = await fetch(
        `https://api.geckoterminal.com/api/v2/networks/base/tokens/${token}/pools?page=1`,
        { headers: { 'Accept': 'application/json' } }
      );
      return res.status(200).json(await poolsRes.json());
    }

    return res.status(400).json({ error: 'Missing token or pool parameter' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch data' });
  }
}

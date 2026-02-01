import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const PAYMENT_ADDRESS = '0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d';
const AMOUNT = '0.1';

function generateReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AGS-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function fetchTokenData(tokenAddress: string) {
  try {
    const dexRes = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    const dexData = await dexRes.json();
    
    if (dexData.pairs && dexData.pairs.length > 0) {
      const pair = dexData.pairs[0];
      return {
        name: pair.baseToken?.name || null,
        symbol: pair.baseToken?.symbol || null,
        image_url: pair.info?.imageUrl || null,
        price: pair.priceUsd ? parseFloat(pair.priceUsd) : null,
        mcap: pair.marketCap || null,
        dexscreener_url: `https://dexscreener.com/base/${tokenAddress}`,
        found: true
      };
    }
    
    return { found: false };
  } catch (err) {
    console.error('Failed to fetch token data:', err);
    return { found: false };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token_address, deployer_address } = req.body;

    if (!token_address || !deployer_address) {
      return res.status(400).json({ error: 'token_address and deployer_address required' });
    }

    if (!token_address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid token address' });
    }

    if (!deployer_address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid deployer address' });
    }

    const { data: existing } = await supabase
      .from('verifications')
      .select('*')
      .eq('token_address', token_address.toLowerCase())
      .single();

    if (existing?.status === 'verified') {
      return res.status(400).json({ error: 'Token already verified' });
    }

    if (existing?.status === 'pending') {
      return res.status(200).json({
        success: true,
        reference_code: existing.reference_code,
        payment_address: PAYMENT_ADDRESS,
        amount: AMOUNT,
        chain: 'base',
        expires_at: existing.expires_at,
        token: {
          name: existing.token_name,
          symbol: existing.token_symbol,
          image_url: existing.image_url
        },
        message: 'Verification already requested. Send payment to complete.'
      });
    }

    // Fetch token data from DexScreener
    const tokenData = await fetchTokenData(token_address);
    const reference_code = generateReferenceCode();

    const { data, error } = await supabase
      .from('verifications')
      .insert({
        token_address: token_address.toLowerCase(),
        deployer_address: deployer_address.toLowerCase(),
        reference_code,
        payment_address: PAYMENT_ADDRESS,
        amount_required: 0.1,
        status: 'pending',
        token_name: tokenData.name || null,
        token_symbol: tokenData.symbol || null,
        image_url: tokenData.image_url || null,
        dexscreener_url: tokenData.dexscreener_url || null
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      reference_code: data.reference_code,
      payment_address: PAYMENT_ADDRESS,
      amount: AMOUNT,
      chain: 'base',
      expires_at: data.expires_at,
      token: {
        name: tokenData.name || 'Unknown',
        symbol: tokenData.symbol || '???',
        image_url: tokenData.image_url,
        dexscreener_url: tokenData.dexscreener_url
      },
      instructions: {
        step1: 'Send exactly 0.1 ETH on Base',
        step2: `Send FROM your deployer wallet: ${deployer_address}`,
        step3: `Include reference "${reference_code}" in tx data (optional)`
      }
    });

  } catch (error) {
    console.error('Verification request error:', error);
    return res.status(500).json({ error: 'Failed to create verification request' });
  }
}

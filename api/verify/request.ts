import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const PAYMENT_ADDRESS = '0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d';
const AGS_TOKEN = '0x1086fd60859Ff1Ae9B713a709350435286597b07';
const AMOUNT = '100000'; // 100k $AGS

function generateReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'AGS-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function getDexScreenerData(tokenAddress: string) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    const data = await res.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      return {
        found: true,
        name: pair.baseToken?.name,
        symbol: pair.baseToken?.symbol,
        image: pair.info?.imageUrl,
        dexscreenerUrl: `https://dexscreener.com/base/${pair.pairAddress}`
      };
    }
    return { found: false };
  } catch (err) {
    return { found: false };
  }
}

async function getAgentFromDB(tokenAddress: string) {
  try {
    const { data } = await supabase
      .from('agents')
      .select('name, symbol, avatar, source')
      .ilike('token_address', tokenAddress)
      .limit(1)
      .single();
    
    if (data) {
      return {
        found: true,
        name: data.name,
        symbol: data.symbol,
        image: data.avatar,
        source: data.source
      };
    }
    return { found: false };
  } catch (err) {
    return { found: false };
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token_address } = req.body;

    if (!token_address) {
      return res.status(400).json({ error: 'token_address required' });
    }

    if (!token_address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid token address' });
    }

    const tokenAddr = token_address.toLowerCase();

    // Check if already verified
    const { data: existing } = await supabase
      .from('verifications')
      .select('*')
      .eq('token_address', tokenAddr)
      .single();

    if (existing?.status === 'verified') {
      return res.status(400).json({ error: 'Token already verified' });
    }

    // If pending exists, return existing
    if (existing?.status === 'pending' || existing?.status === 'pending_review') {
      return res.status(200).json({
        success: true,
        reference_code: existing.reference_code,
        payment_address: PAYMENT_ADDRESS,
        amount: AMOUNT,
        token_contract: AGS_TOKEN,
        chain: 'base',
        expires_at: existing.expires_at,
        status: existing.status,
        token: {
          name: existing.token_name,
          symbol: existing.token_symbol,
          image_url: existing.image_url
        },
        message: existing.status === 'pending_review' 
          ? 'Payment received! Awaiting admin review.'
          : 'Verification requested. Send payment to complete.'
      });
    }

    // Try to get token info from our DB first, then DexScreener
    const dbData = await getAgentFromDB(tokenAddr);
    const dexData = await getDexScreenerData(tokenAddr);

    if (!dbData.found && !dexData.found) {
      return res.status(400).json({ 
        error: 'Token not found',
        message: 'Could not find this token. Make sure it exists on Base.'
      });
    }

    const reference_code = generateReferenceCode();

    // Insert verification request
    const { data, error } = await supabase
      .from('verifications')
      .insert({
        token_address: tokenAddr,
        reference_code,
        payment_address: PAYMENT_ADDRESS,
        amount_required: 100000,
        status: 'pending',
        token_name: dbData.found ? dbData.name : dexData.name,
        token_symbol: dbData.found ? dbData.symbol : dexData.symbol,
        image_url: dbData.found ? dbData.image : dexData.image,
        dexscreener_url: dexData.dexscreenerUrl || `https://dexscreener.com/base/${tokenAddr}`,
        source: dbData.found ? dbData.source : 'external'
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      reference_code: data.reference_code,
      payment_address: PAYMENT_ADDRESS,
      amount: AMOUNT,
      token_contract: AGS_TOKEN,
      chain: 'base',
      expires_at: data.expires_at,
      token: {
        name: dbData.found ? dbData.name : dexData.name,
        symbol: dbData.found ? dbData.symbol : dexData.symbol,
        image_url: dbData.found ? dbData.image : dexData.image
      },
      instructions: {
        step1: 'Send exactly 100,000 $AGS on Base',
        step2: `To: ${PAYMENT_ADDRESS}`,
        step3: `$AGS Token: ${AGS_TOKEN}`,
        step4: 'After payment, your request goes to admin review'
      }
    });

  } catch (error) {
    console.error('Verification request error:', error);
    return res.status(500).json({ error: 'Failed to create verification request' });
  }
}



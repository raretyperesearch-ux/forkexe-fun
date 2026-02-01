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

async function getClawnchData(tokenAddress: string) {
  try {
    const res = await fetch(`https://clawn.ch/api/launches?address=${tokenAddress}`);
    const data = await res.json();
    
    if (data.success && data.launch) {
      const launch = data.launch;
      return {
        found: true,
        name: launch.name,
        symbol: launch.symbol,
        image: launch.image,
        agentName: launch.agentName,
        agentWallet: launch.agentWallet?.toLowerCase(),
        source: launch.source,
        clankerUrl: launch.clankerUrl,
        launchedAt: launch.launchedAt
      };
    }
    return { found: false };
  } catch (err) {
    console.error('Clawnch API error:', err);
    return { found: false };
  }
}

async function getDexScreenerData(tokenAddress: string) {
  try {
    const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`);
    const data = await res.json();
    
    if (data.pairs && data.pairs.length > 0) {
      const pair = data.pairs[0];
      return {
        name: pair.baseToken?.name,
        symbol: pair.baseToken?.symbol,
        image: pair.info?.imageUrl,
        dexscreenerUrl: `https://dexscreener.com/base/${tokenAddress}`
      };
    }
    return null;
  } catch (err) {
    return null;
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
          image_url: existing.image_url,
          agent_name: existing.agent_name
        },
        deployer_address: existing.deployer_address,
        source: existing.source,
        message: 'Verification already requested. Send payment to complete.'
      });
    }

    // Check Clawnch API first
    const clawnchData = await getClawnchData(tokenAddr);

    if (!clawnchData.found) {
      return res.status(400).json({ 
        error: 'Token not found on Clawnch',
        message: 'Only Clawnch-launched tokens can be verified at this time.'
      });
    }

    // Get additional data from DexScreener
    const dexData = await getDexScreenerData(tokenAddr);

    const reference_code = generateReferenceCode();

    // Insert verification with Clawnch data
    const { data, error } = await supabase
      .from('verifications')
      .insert({
        token_address: tokenAddr,
        deployer_address: clawnchData.agentWallet,
        reference_code,
        payment_address: PAYMENT_ADDRESS,
        amount_required: 0.1,
        status: 'pending',
        token_name: clawnchData.name || dexData?.name,
        token_symbol: clawnchData.symbol || dexData?.symbol,
        image_url: clawnchData.image || dexData?.image,
        dexscreener_url: dexData?.dexscreenerUrl || `https://dexscreener.com/base/${tokenAddr}`,
        agent_name: clawnchData.agentName,
        source: 'clawnch'
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
        name: clawnchData.name,
        symbol: clawnchData.symbol,
        image_url: clawnchData.image,
        agent_name: clawnchData.agentName
      },
      deployer_address: clawnchData.agentWallet,
      source: 'clawnch',
      instructions: {
        step1: 'Send exactly 0.1 ETH on Base',
        step2: `Send FROM the agent wallet: ${clawnchData.agentWallet}`,
        step3: 'We verify against Clawnch launch data'
      }
    });

  } catch (error) {
    console.error('Verification request error:', error);
    return res.status(500).json({ error: 'Failed to create verification request' });
  }
}

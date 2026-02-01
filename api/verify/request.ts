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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token_address, deployer_address } = req.body;

    // Validate
    if (!token_address || !deployer_address) {
      return res.status(400).json({ error: 'token_address and deployer_address required' });
    }

    if (!token_address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid token address' });
    }

    if (!deployer_address.match(/^0x[a-fA-F0-9]{40}$/)) {
      return res.status(400).json({ error: 'Invalid deployer address' });
    }

    // Check if already verified
    const { data: existing } = await supabase
      .from('verifications')
      .select('*')
      .eq('token_address', token_address.toLowerCase())
      .single();

    if (existing?.status === 'verified') {
      return res.status(400).json({ error: 'Token already verified' });
    }

    // If pending exists, return existing reference
    if (existing?.status === 'pending') {
      return res.status(200).json({
        success: true,
        reference_code: existing.reference_code,
        payment_address: PAYMENT_ADDRESS,
        amount: AMOUNT,
        chain: 'base',
        expires_at: existing.expires_at,
        message: 'Verification already requested. Send payment to complete.'
      });
    }

    // Generate new reference code
    const reference_code = generateReferenceCode();

    // Insert new verification request
    const { data, error } = await supabase
      .from('verifications')
      .insert({
        token_address: token_address.toLowerCase(),
        deployer_address: deployer_address.toLowerCase(),
        reference_code,
        payment_address: PAYMENT_ADDRESS,
        amount_required: 0.1,
        status: 'pending'
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
      instructions: {
        step1: 'Send exactly 0.1 ETH on Base',
        step2: `Send FROM your deployer wallet: ${deployer_address}`,
        step3: `Include reference "${reference_code}" in tx data (optional but speeds up verification)`
      }
    });

  } catch (error) {
    console.error('Verification request error:', error);
    return res.status(500).json({ error: 'Failed to create verification request' });
  }
}

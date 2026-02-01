import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: 'Token address required' });
    }

    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .eq('token_address', token.toLowerCase())
      .single();

    if (error || !data) {
      return res.status(200).json({
        status: 'not_found',
        verified: false,
        message: 'No verification request found for this token'
      });
    }

    if (data.status === 'verified') {
      return res.status(200).json({
        status: 'verified',
        verified: true,
        verified_at: data.verified_at,
        payment_tx: data.payment_tx
      });
    }

    if (data.status === 'pending') {
      const expired = new Date(data.expires_at) < new Date();
      return res.status(200).json({
        status: expired ? 'expired' : 'pending',
        verified: false,
        reference_code: data.reference_code,
        created_at: data.created_at,
        expires_at: data.expires_at
      });
    }

    return res.status(200).json({
      status: data.status,
      verified: false
    });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({ error: 'Failed to check status' });
  }
}

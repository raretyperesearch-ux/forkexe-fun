import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// Simple secret to protect admin endpoint
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'agentscreener-admin-2026';

export default async function handler(req: any, res: any) {
  // Check secret
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET - List pending verifications
  if (req.method === 'GET') {
    try {
      // Get pending verifications
      const { data: verifications, error } = await supabase
        .from('verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get token names from agents table
      const tokenAddresses = verifications?.map(v => v.token_address) || [];
      const { data: agents } = await supabase
        .from('agents')
        .select('token_address, name, symbol')
        .in('token_address', tokenAddresses);

      // Merge token names
      const merged = verifications?.map(v => {
        const agent = agents?.find(a => 
          a.token_address?.toLowerCase() === v.token_address?.toLowerCase()
        );
        return {
          ...v,
          token_name: agent?.name || 'Unknown',
          token_symbol: agent?.symbol || '???'
        };
      });

      return res.status(200).json({ verifications: merged });

    } catch (error) {
      console.error('Admin fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch verifications' });
    }
  }

  // POST - Approve verification
  if (req.method === 'POST') {
    try {
      const { id, payment_tx } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Verification ID required' });
      }

      const { data, error } = await supabase
        .from('verifications')
        .update({
          status: 'verified',
          payment_tx: payment_tx || 'manual-approval',
          amount_received: 0.1,
          verified_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ 
        success: true, 
        message: `Verified ${data.token_address}`,
        verification: data
      });

    } catch (error) {
      console.error('Admin approve error:', error);
      return res.status(500).json({ error: 'Failed to approve' });
    }
  }

  // DELETE - Reject/remove verification
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Verification ID required' });
      }

      const { error } = await supabase
        .from('verifications')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ success: true, message: 'Rejected' });

    } catch (error) {
      return res.status(500).json({ error: 'Failed to reject' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

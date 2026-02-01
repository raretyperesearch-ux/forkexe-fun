import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'agentscreener-admin-2026';
const PAYMENT_ADDRESS = '0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d'.toLowerCase();

async function getTransactionDetails(txHash: string) {
  try {
    const response = await fetch('https://mainnet.base.org', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_getTransactionByHash',
        params: [txHash],
        id: 1
      })
    });
    
    const data = await response.json();
    if (data.result) {
      const tx = data.result;
      return {
        from: tx.from?.toLowerCase(),
        to: tx.to?.toLowerCase(),
        value: parseInt(tx.value, 16) / 1e18,
        success: true
      };
    }
    return { success: false, error: 'Transaction not found' };
  } catch (err) {
    return { success: false, error: 'Failed to fetch transaction' };
  }
}

export default async function handler(req: any, res: any) {
  const secret = req.headers['x-admin-secret'] || req.query.secret;
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // GET - List verifications
  if (req.method === 'GET') {
    try {
      const { data: verifications, error } = await supabase
        .from('verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({ verifications });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch verifications' });
    }
  }

  // PUT - Check transaction details
  if (req.method === 'PUT') {
    try {
      const { id, tx_hash } = req.body;

      if (!tx_hash) {
        return res.status(400).json({ error: 'Transaction hash required' });
      }

      const { data: verification } = await supabase
        .from('verifications')
        .select('*')
        .eq('id', id)
        .single();

      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      const txDetails = await getTransactionDetails(tx_hash);

      if (!txDetails.success) {
        return res.status(400).json({ error: txDetails.error });
      }

      const senderMatch = txDetails.from === verification.deployer_address.toLowerCase();
      const toMatch = txDetails.to === PAYMENT_ADDRESS;
      const amountOk = txDetails.value >= 0.099;

      return res.status(200).json({
        tx_hash,
        sender: txDetails.from,
        to: txDetails.to,
        amount: txDetails.value,
        deployer: verification.deployer_address.toLowerCase(),
        checks: {
          sender_matches_deployer: senderMatch,
          sent_to_payment_wallet: toMatch,
          amount_ok: amountOk,
          all_passed: senderMatch && toMatch && amountOk
        }
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to check transaction' });
    }
  }

  // POST - Approve verification
  if (req.method === 'POST') {
    try {
      const { id, payment_tx, force } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Verification ID required' });
      }

      const { data: verification } = await supabase
        .from('verifications')
        .select('*')
        .eq('id', id)
        .single();

      if (!verification) {
        return res.status(404).json({ error: 'Verification not found' });
      }

      let senderAddress = null;
      let amountReceived = 0.1;

      if (payment_tx && payment_tx !== 'manual-approval' && !force) {
        const txDetails = await getTransactionDetails(payment_tx);
        
        if (txDetails.success) {
          senderAddress = txDetails.from;
          amountReceived = txDetails.value;

          if (txDetails.to !== PAYMENT_ADDRESS) {
            return res.status(400).json({ error: 'TX not sent to payment wallet' });
          }

          if (txDetails.value < 0.099) {
            return res.status(400).json({ error: `Only ${txDetails.value} ETH sent` });
          }

          if (senderAddress !== verification.deployer_address.toLowerCase()) {
            return res.status(400).json({ 
              error: 'Sender does not match deployer',
              sender: senderAddress,
              deployer: verification.deployer_address
            });
          }
        }
      }

      const { data, error } = await supabase
        .from('verifications')
        .update({
          status: 'verified',
          payment_tx: payment_tx || 'manual-approval',
          amount_received: amountReceived,
          sender_address: senderAddress,
          verified_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ success: true, verification: data });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to approve' });
    }
  }

  // DELETE - Reject
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      await supabase.from('verifications').update({ status: 'rejected' }).eq('id', id);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to reject' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

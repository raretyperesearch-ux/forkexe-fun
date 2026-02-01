import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const PAYMENT_ADDRESS = '0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d';
const REQUIRED_AMOUNT = 0.1;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token_address, tx_hash } = req.body;

    if (!token_address) {
      return res.status(400).json({ error: 'token_address required' });
    }

    // Get pending verification
    const { data: verification, error: fetchError } = await supabase
      .from('verifications')
      .select('*')
      .eq('token_address', token_address.toLowerCase())
      .single();

    if (fetchError || !verification) {
      return res.status(404).json({ error: 'No verification request found' });
    }

    if (verification.status === 'verified') {
      return res.status(200).json({
        status: 'verified',
        message: 'Already verified!',
        payment_tx: verification.payment_tx
      });
    }

    // If tx_hash provided, fetch and verify the transaction
    if (tx_hash) {
      try {
        const txResponse = await fetch(`https://api.basescan.org/api?module=proxy&action=eth_getTransactionByHash&txhash=${tx_hash}&apikey=${process.env.BASESCAN_API_KEY || ''}`);
        const txData = await txResponse.json();
        
        if (txData.result) {
          const tx = txData.result;
          const value = parseInt(tx.value, 16) / 1e18;
          const to = tx.to?.toLowerCase();
          const from = tx.from?.toLowerCase();

          // Validate payment
          if (to !== PAYMENT_ADDRESS.toLowerCase()) {
            return res.status(400).json({ error: 'Transaction not sent to payment address' });
          }

          if (from !== verification.deployer_address.toLowerCase()) {
            return res.status(400).json({ error: 'Transaction not from deployer wallet' });
          }

          if (value < REQUIRED_AMOUNT) {
            return res.status(400).json({ error: `Insufficient amount. Sent: ${value} ETH, Required: ${REQUIRED_AMOUNT} ETH` });
          }

          // Check if tx was successful
          const receiptResponse = await fetch(`https://api.basescan.org/api?module=proxy&action=eth_getTransactionReceipt&txhash=${tx_hash}&apikey=${process.env.BASESCAN_API_KEY || ''}`);
          const receiptData = await receiptResponse.json();
          
          if (receiptData.result?.status !== '0x1') {
            return res.status(400).json({ error: 'Transaction failed or pending' });
          }

          // Log payment
          await supabase.from('payment_logs').upsert({
            tx_hash: tx_hash.toLowerCase(),
            from_address: from,
            to_address: to,
            amount: value,
            block_number: parseInt(tx.blockNumber, 16),
            matched_verification_id: verification.id
          }, { onConflict: 'tx_hash' });

          // Mark as verified!
          const { error: updateError } = await supabase
            .from('verifications')
            .update({
              status: 'verified',
              payment_tx: tx_hash.toLowerCase(),
              amount_received: value,
              sender_address: from,
              verified_at: new Date().toISOString()
            })
            .eq('id', verification.id);

          if (updateError) throw updateError;

          return res.status(200).json({
            status: 'verified',
            message: 'Payment confirmed! Verification complete.',
            payment_tx: tx_hash
          });
        }
      } catch (txError) {
        console.error('Transaction fetch error:', txError);
        // Continue to return pending status
      }
    }

    // No tx_hash or couldn't verify - return pending
    return res.status(200).json({
      status: 'pending',
      message: 'Verification pending. Payment not yet detected.',
      reference_code: verification.reference_code
    });

  } catch (error) {
    console.error('Confirm error:', error);
    return res.status(500).json({ error: 'Failed to confirm payment' });
  }
}

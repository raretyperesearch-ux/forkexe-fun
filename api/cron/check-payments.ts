import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const PAYMENT_ADDRESS = '0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d';
const AGS_TOKEN = '0x1086fd60859Ff1Ae9B713a709350435286597b07';
const REQUIRED_AMOUNT = 100000; // 100k $AGS

export const config = {
  maxDuration: 60
};

export default async function handler(req: any, res: any) {
  try {
    console.log('Checking for $AGS verification payments...');

    // Get recent $AGS token transfers to payment wallet from Basescan
    const apiKey = process.env.BASESCAN_API_KEY || '';
    const url = `https://api.basescan.org/api?module=account&action=tokentx&contractaddress=${AGS_TOKEN}&address=${PAYMENT_ADDRESS}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== '1' || !data.result) {
      console.log('No transactions found or API error');
      return res.status(200).json({ message: 'No transactions to process' });
    }

    const transactions = data.result;
    let pendingReview = 0;
    let processed = 0;

    for (const tx of transactions) {
      // Skip outgoing transactions
      if (tx.to.toLowerCase() !== PAYMENT_ADDRESS.toLowerCase()) continue;

      const txHash = tx.hash.toLowerCase();
      const from = tx.from.toLowerCase();
      const decimals = parseInt(tx.tokenDecimal) || 18;
      const value = parseInt(tx.value) / Math.pow(10, decimals);

      // Check if already processed
      const { data: existingLog } = await supabase
        .from('payment_logs')
        .select('id')
        .eq('tx_hash', txHash)
        .single();

      if (existingLog) continue; // Already processed

      processed++;

      // Log all payments
      await supabase.from('payment_logs').insert({
        tx_hash: txHash,
        from_address: from,
        to_address: PAYMENT_ADDRESS.toLowerCase(),
        amount: value,
        block_number: parseInt(tx.blockNumber)
      });

      // Check amount meets minimum
      if (value < REQUIRED_AMOUNT) {
        console.log(`Logged tx ${txHash}: insufficient amount ${value} $AGS (need ${REQUIRED_AMOUNT})`);
        continue;
      }

      // Find oldest pending verification to mark for review
      const { data: verification } = await supabase
        .from('verifications')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!verification) {
        console.log(`Payment received (${value} $AGS from ${from}) but no pending verifications`);
        continue;
      }

      // Mark as pending_review for admin approval
      const { error: updateError } = await supabase
        .from('verifications')
        .update({
          status: 'pending_review',
          payment_tx: txHash,
          amount_received: value,
          sender_address: from
        })
        .eq('id', verification.id);

      if (updateError) {
        console.error(`Failed to update verification ${verification.id}:`, updateError);
        continue;
      }

      // Update payment log with matched verification
      await supabase
        .from('payment_logs')
        .update({ matched_verification_id: verification.id })
        .eq('tx_hash', txHash);

      console.log(`📋 Sent to review: ${verification.token_name || verification.token_address} via tx ${txHash} (${value} $AGS)`);
      pendingReview++;
    }

    // Expire old pending verifications (keep pending_review ones)
    await supabase
      .from('verifications')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    return res.status(200).json({
      success: true,
      processed,
      pending_review: pendingReview,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Check payments error:', error);
    return res.status(500).json({ error: 'Failed to check payments' });
  }
}

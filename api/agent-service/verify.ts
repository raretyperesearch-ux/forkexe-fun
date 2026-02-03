import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const VERIFY_WALLET = '0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d';
const BASE_RPC = 'https://mainnet.base.org';
const MIN_VALUE = 1000000000000; // 0.000001 ETH in wei

// Generate secure API key
function generateApiKey(): string {
  return 'as_live_' + crypto.randomBytes(24).toString('hex');
}

// Fetch transaction from Base RPC
async function getTransaction(txHash: string) {
  const response = await fetch(BASE_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionByHash',
      params: [txHash],
      id: 1,
    }),
  });
  const data = await response.json();
  return data.result;
}

// Get deployer of a token contract
async function getContractDeployer(tokenAddress: string) {
  // Get creation tx by finding first tx to the contract
  // Using Base block explorer API
  const response = await fetch(
    `https://api.basescan.org/api?module=contract&action=getcontractcreation&contractaddresses=${tokenAddress}&apikey=${process.env.BASESCAN_API_KEY || ''}`
  );
  const data = await response.json();
  
  if (data.result && data.result[0]) {
    return data.result[0].contractCreator?.toLowerCase();
  }
  return null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token_address, tx_hash } = req.body;

    if (!token_address || !tx_hash) {
      return res.status(400).json({ error: 'Missing token_address or tx_hash' });
    }

    const tokenAddr = token_address.toLowerCase();
    const txHash = tx_hash.toLowerCase();

    // Check if already verified
    const { data: existing } = await supabase
      .from('agent_service')
      .select('*')
      .eq('token_address', tokenAddr)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'Agent already verified', api_key: existing.api_key });
    }

    // Fetch the transaction
    const tx = await getTransaction(txHash);
    
    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found' });
    }

    // Check tx was sent to our verify wallet
    if (tx.to?.toLowerCase() !== VERIFY_WALLET.toLowerCase()) {
      return res.status(400).json({ error: 'Transaction not sent to verify wallet' });
    }

    // Check minimum value
    const value = parseInt(tx.value, 16);
    if (value < MIN_VALUE) {
      return res.status(400).json({ error: 'Transaction value too low. Send at least 0.000001 ETH' });
    }

    // Get the deployer of the token
    const deployer = await getContractDeployer(tokenAddr);
    
    if (!deployer) {
      return res.status(400).json({ error: 'Could not find token deployer' });
    }

    // Check tx sender is the deployer
    if (tx.from?.toLowerCase() !== deployer) {
      return res.status(400).json({ 
        error: 'Transaction must be sent from deployer wallet',
        expected: deployer,
        got: tx.from?.toLowerCase()
      });
    }

    // Get an available bot from the pool
    const { data: availableBot } = await supabase
      .from('bot_pool')
      .select('*')
      .is('assigned_to', null)
      .limit(1)
      .single();

    if (!availableBot) {
      return res.status(503).json({ error: 'No bots available. Please try again later.' });
    }

    // Generate API key
    const apiKey = generateApiKey();

    // Get agent info from agents table
    const { data: agentInfo } = await supabase
      .from('agents')
      .select('name, symbol, avatar')
      .eq('token_address', tokenAddr)
      .single();

    // Assign bot and create agent_service record
    const { error: insertError } = await supabase
      .from('agent_service')
      .insert({
        token_address: tokenAddr,
        api_key: apiKey,
        bot_id: availableBot.id.toString(),
        bot_token: availableBot.bot_token,
        bot_username: availableBot.bot_username,
        bot_name: agentInfo?.name || agentInfo?.symbol || 'Agent',
        bot_photo_url: agentInfo?.avatar || null,
        deployer_address: deployer,
        verify_tx_hash: txHash,
        verified_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return res.status(500).json({ error: 'Failed to create agent service record' });
    }

    // Mark bot as assigned
    await supabase
      .from('bot_pool')
      .update({ assigned_to: tokenAddr })
      .eq('id', availableBot.id);

    return res.status(200).json({
      success: true,
      api_key: apiKey,
      bot_username: availableBot.bot_username,
      message: 'Verification complete. Use your API key to send messages.',
      next_steps: [
        'POST /api/agent-service/create-group to create your TG group',
        'POST /api/agent-service/send to send messages',
        'GET /api/agent-service/messages to receive messages',
      ],
    });

  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

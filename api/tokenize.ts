import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const BANKR_API_KEY = process.env.BANKR_API_KEY || '';
const BANKR_API_URL = 'https://api.bankr.bot';

export const config = {
  maxDuration: 120, // 2 minutes for token deployment
};

async function submitPrompt(prompt: string) {
  const response = await fetch(`${BANKR_API_URL}/agent/prompt`, {
    method: 'POST',
    headers: {
      'x-api-key': BANKR_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });
  return response.json();
}

async function getJobStatus(jobId: string) {
  const response = await fetch(`${BANKR_API_URL}/agent/job/${jobId}`, {
    headers: { 'x-api-key': BANKR_API_KEY },
  });
  return response.json();
}

async function waitForCompletion(jobId: string, maxPolls = 60) {
  for (let i = 0; i < maxPolls; i++) {
    const status = await getJobStatus(jobId);
    console.log(`Poll ${i + 1}: ${status.status}`);
    
    if (['completed', 'failed', 'cancelled'].includes(status.status)) {
      return status;
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Job timed out');
}

async function deployToken(agentName: string, symbol: string) {
  const prompt = `Deploy a token called ${agentName} with symbol ${symbol}`;
  console.log('Submitting prompt:', prompt);
  
  const { jobId, success, error } = await submitPrompt(prompt);
  
  if (!success || !jobId) {
    throw new Error(error || 'Failed to submit token deployment');
  }
  
  console.log('Job ID:', jobId);
  
  const result = await waitForCompletion(jobId);
  
  if (result.status === 'failed') {
    throw new Error(result.error || 'Token deployment failed');
  }
  
  // Extract token address from response
  // The response typically contains the contract address
  const responseText = result.response || '';
  const addressMatch = responseText.match(/0x[a-fA-F0-9]{40}/);
  
  return {
    response: responseText,
    tokenAddress: addressMatch ? addressMatch[0] : null,
    transactions: result.transactions || [],
  };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { agentId } = req.body;

  if (!agentId) {
    return res.status(400).json({ error: 'agentId required' });
  }

  try {
    // Get agent from database
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (fetchError || !agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    // Check if already tokenized
    if (agent.token_address && agent.token_address.startsWith('0x') && agent.token_address.length > 10) {
      return res.status(400).json({ error: 'Agent already tokenized', tokenAddress: agent.token_address });
    }

    // Check karma threshold
    if (agent.karma < 50) {
      return res.status(400).json({ error: 'Agent needs 50+ karma to tokenize', karma: agent.karma });
    }

    // Generate symbol from name (first 4-5 chars uppercase)
    const symbol = '$' + agent.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase();

    console.log(`Deploying token for ${agent.name} (${symbol})...`);

    // Deploy token via Bankr
    const result = await deployToken(agent.name, symbol);

    console.log('Deployment result:', result);

    // Update agent with token address
    if (result.tokenAddress) {
      const { error: updateError } = await supabase
        .from('agents')
        .update({
          token_address: result.tokenAddress,
          tokenized_at: new Date().toISOString(),
        })
        .eq('id', agentId);

      if (updateError) {
        console.error('Failed to update agent:', updateError);
      }
    }

    return res.status(200).json({
      success: true,
      agent: agent.name,
      symbol,
      tokenAddress: result.tokenAddress,
      response: result.response,
    });

  } catch (error) {
    console.error('Tokenization error:', error);
    return res.status(500).json({ error: 'Tokenization failed', details: String(error) });
  }
}

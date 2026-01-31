import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const BANKR_API_KEY = process.env.BANKR_API_KEY || '';
const BANKR_API_URL = 'https://api.bankr.bot';

export const config = {
  maxDuration: 300, // 5 minutes max
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
    
    if (['completed', 'failed', 'cancelled'].includes(status.status)) {
      return status;
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('Job timed out');
}

async function deployToken(agentName: string, symbol: string) {
  const prompt = `Deploy a token called ${agentName} with symbol ${symbol}`;
  console.log('Submitting:', prompt);
  
  const { jobId, success, error } = await submitPrompt(prompt);
  
  if (!success || !jobId) {
    throw new Error(error || 'Failed to submit');
  }
  
  const result = await waitForCompletion(jobId);
  
  if (result.status === 'failed') {
    throw new Error(result.error || 'Deployment failed');
  }
  
  // Extract token address from response
  const responseText = result.response || '';
  const addressMatch = responseText.match(/0x[a-fA-F0-9]{40}/);
  
  return {
    tokenAddress: addressMatch ? addressMatch[0] : null,
    response: responseText,
  };
}

export default async function handler(req: any, res: any) {
  // Verify cron secret
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Checking for agents to tokenize...');

    // Find agents with 50+ karma that aren't properly tokenized
    const { data: agents, error } = await supabase
      .from('agents')
      .select('*')
      .gte('karma', 50)
      .or('token_address.is.null,token_address.eq.')
      .limit(1); // Process one at a time

    if (error) {
      throw error;
    }

    if (!agents || agents.length === 0) {
      console.log('No agents need tokenization');
      return res.status(200).json({ success: true, message: 'No agents to tokenize' });
    }

    const agent = agents[0];
    console.log(`Tokenizing: ${agent.name} (karma: ${agent.karma})`);

    // Generate symbol
    const symbol = '$' + agent.name.replace(/[^A-Za-z0-9]/g, '').slice(0, 5).toUpperCase();

    // Deploy token
    const result = await deployToken(agent.name, symbol);
    console.log('Result:', result);

    // Update database
    if (result.tokenAddress) {
      await supabase
        .from('agents')
        .update({
          token_address: result.tokenAddress,
          tokenized_at: new Date().toISOString(),
        })
        .eq('id', agent.id);

      return res.status(200).json({
        success: true,
        agent: agent.name,
        tokenAddress: result.tokenAddress,
      });
    } else {
      // Store placeholder so we don't retry immediately
      await supabase
        .from('agents')
        .update({
          token_address: 'pending_' + Date.now(),
        })
        .eq('id', agent.id);

      return res.status(200).json({
        success: false,
        agent: agent.name,
        message: 'Token deployed but address not found in response',
        response: result.response,
      });
    }

  } catch (error) {
    console.error('Auto-tokenize error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

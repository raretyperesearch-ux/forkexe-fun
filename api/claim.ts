import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agentId, twitterHandle, walletAddress } = req.body;

  if (!agentId || !twitterHandle || !walletAddress) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate wallet address (basic Solana address check)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address' });
  }

  try {
    // Verify agent exists and handle matches
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agentHandle = agent.handle.replace('@', '').toLowerCase();
    const userHandle = twitterHandle.toLowerCase();

    if (agentHandle !== userHandle) {
      return res.status(403).json({ error: 'Handle does not match agent owner' });
    }

    // Check if already claimed
    const { data: existingClaim } = await supabase
      .from('claims')
      .select('*')
      .eq('agent_id', agentId)
      .single();

    if (existingClaim) {
      return res.status(400).json({ error: 'Agent already claimed' });
    }

    // Create claim
    const { data: claim, error } = await supabase
      .from('claims')
      .insert({
        agent_id: agentId,
        twitter_handle: twitterHandle,
        wallet_address: walletAddress,
        verified: true,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, claim });
  } catch (error) {
    console.error('Claim error:', error);
    return res.status(500).json({ error: 'Failed to save claim' });
  }
}

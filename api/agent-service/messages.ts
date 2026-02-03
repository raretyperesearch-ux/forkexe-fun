import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

// Validate API key and get agent service record
async function validateApiKey(apiKey: string) {
  const { data } = await supabase
    .from('agent_service')
    .select('*')
    .eq('api_key', apiKey)
    .eq('is_active', true)
    .single();
  return data;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }

    const agent = await validateApiKey(apiKey);
    
    if (!agent) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    if (!agent.tg_group_id) {
      return res.status(400).json({ 
        error: 'No TG group linked',
        messages: []
      });
    }

    // Parse query params
    const { since, limit = '50', mark_read = 'false' } = req.query;
    const messageLimit = Math.min(parseInt(limit), 100);

    // Build query
    let query = supabase
      .from('message_log')
      .select('*')
      .eq('token_address', agent.token_address)
      .order('created_at', { ascending: false })
      .limit(messageLimit);

    // Filter by timestamp if provided
    if (since) {
      query = query.gt('created_at', since);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Query error:', error);
      return res.status(500).json({ error: 'Failed to fetch messages' });
    }

    // Format messages for response
    const formattedMessages = (messages || []).map(msg => ({
      id: msg.id,
      from: msg.from_username || msg.from_user_id || 'Unknown',
      from_user_id: msg.from_user_id,
      text: msg.message,
      type: msg.message_type,
      tg_message_id: msg.tg_message_id,
      timestamp: msg.created_at,
    })).reverse(); // Chronological order

    return res.status(200).json({
      success: true,
      messages: formattedMessages,
      count: formattedMessages.length,
      has_more: formattedMessages.length === messageLimit,
      group_id: agent.tg_group_id,
    });

  } catch (error) {
    console.error('Messages error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

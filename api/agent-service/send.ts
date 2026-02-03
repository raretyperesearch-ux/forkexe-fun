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

// TG Bot API call
async function tgApi(botToken: string, method: string, params: any = {}) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response.json();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
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
        error: 'No TG group linked. Create a group and add the bot first.',
        setup_url: '/api/agent-service/create-group'
      });
    }

    const { message, reply_to, parse_mode } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    if (message.length > 4096) {
      return res.status(400).json({ error: 'Message too long. Max 4096 characters.' });
    }

    // Send message via TG API
    const params: any = {
      chat_id: agent.tg_group_id,
      text: message,
    };

    if (reply_to) {
      params.reply_to_message_id = reply_to;
    }

    if (parse_mode) {
      params.parse_mode = parse_mode; // 'HTML' or 'Markdown'
    }

    const result = await tgApi(agent.bot_token, 'sendMessage', params);

    if (!result.ok) {
      console.error('TG send error:', result);
      return res.status(500).json({ 
        error: 'Failed to send message',
        tg_error: result.description
      });
    }

    // Log the sent message
    await supabase.from('message_queue').insert({
      token_address: agent.token_address,
      message: message,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });

    // Update analytics
    const today = new Date().toISOString().split('T')[0];
    await supabase.rpc('increment_messages_sent', {
      p_token_address: agent.token_address,
      p_date: today,
    }).catch(() => {
      // If RPC doesn't exist, do manual upsert
      supabase
        .from('agent_analytics')
        .upsert({
          token_address: agent.token_address,
          date: today,
          messages_sent: 1,
        }, { 
          onConflict: 'token_address,date',
        });
    });

    return res.status(200).json({
      success: true,
      message_id: result.result?.message_id,
      sent_at: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Send error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

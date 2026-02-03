import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token_address } = req.query;

    if (!token_address) {
      return res.status(400).json({ error: 'Missing token_address' });
    }

    const tokenAddr = token_address.toLowerCase();

    // Get agent service record
    const { data: agent } = await supabase
      .from('agent_service')
      .select('tg_group_id, tg_group_link, bot_username, bot_name, bot_token, is_active, verified_at')
      .eq('token_address', tokenAddr)
      .eq('is_active', true)
      .single();

    if (!agent) {
      return res.status(200).json({
        success: true,
        has_tg: false,
        message: 'Agent not registered with Agent Service',
      });
    }

    if (!agent.tg_group_id) {
      return res.status(200).json({
        success: true,
        has_tg: false,
        bot_username: agent.bot_username,
        message: 'Bot configured but no group linked',
      });
    }

    // Get member count
    let memberCount = 0;
    if (agent.bot_token) {
      const memberResult = await tgApi(agent.bot_token, 'getChatMemberCount', {
        chat_id: agent.tg_group_id,
      });
      if (memberResult.ok) {
        memberCount = memberResult.result;
      }
    }

    // Get last message time
    const { data: lastMessage } = await supabase
      .from('message_log')
      .select('created_at')
      .eq('token_address', tokenAddr)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Calculate "active X ago"
    let lastActive = null;
    if (lastMessage) {
      const diff = Date.now() - new Date(lastMessage.created_at).getTime();
      const mins = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const days = Math.floor(hours / 24);
      
      if (days > 0) lastActive = `${days}d ago`;
      else if (hours > 0) lastActive = `${hours}h ago`;
      else if (mins > 0) lastActive = `${mins}m ago`;
      else lastActive = 'just now';
    }

    return res.status(200).json({
      success: true,
      has_tg: true,
      bot_username: agent.bot_username,
      bot_name: agent.bot_name,
      group_link: agent.tg_group_link,
      member_count: memberCount,
      last_active: lastActive,
      verified_at: agent.verified_at,
    });

  } catch (error) {
    console.error('Info error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

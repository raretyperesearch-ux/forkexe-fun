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

    // Get TG group member count
    let memberCount = 0;
    if (agent.tg_group_id && agent.bot_token) {
      const chatInfo = await tgApi(agent.bot_token, 'getChat', {
        chat_id: agent.tg_group_id,
      });
      
      if (chatInfo.ok) {
        const memberResult = await tgApi(agent.bot_token, 'getChatMemberCount', {
          chat_id: agent.tg_group_id,
        });
        if (memberResult.ok) {
          memberCount = memberResult.result;
        }
      }
    }

    // Get today's stats
    const today = new Date().toISOString().split('T')[0];
    const { data: todayStats } = await supabase
      .from('agent_analytics')
      .select('*')
      .eq('token_address', agent.token_address)
      .eq('date', today)
      .single();

    // Get message count today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { count: messagesToday } = await supabase
      .from('message_log')
      .select('*', { count: 'exact', head: true })
      .eq('token_address', agent.token_address)
      .gte('created_at', todayStart.toISOString());

    // Get unique users today
    const { data: uniqueUsersData } = await supabase
      .from('message_log')
      .select('from_user_id')
      .eq('token_address', agent.token_address)
      .gte('created_at', todayStart.toISOString());

    const uniqueUsers = new Set(uniqueUsersData?.map(m => m.from_user_id)).size;

    // Get top chatters
    const { data: topChattersData } = await supabase
      .from('message_log')
      .select('from_username')
      .eq('token_address', agent.token_address)
      .gte('created_at', todayStart.toISOString());

    const chatterCounts: Record<string, number> = {};
    topChattersData?.forEach(m => {
      const name = m.from_username || 'Unknown';
      chatterCounts[name] = (chatterCounts[name] || 0) + 1;
    });

    const topChatters = Object.entries(chatterCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([username, count]) => ({ username, messages: count }));

    // Get 7 day history
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const { data: weeklyStats } = await supabase
      .from('agent_analytics')
      .select('*')
      .eq('token_address', agent.token_address)
      .gte('date', weekAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    return res.status(200).json({
      success: true,
      group_id: agent.tg_group_id,
      group_link: agent.tg_group_link,
      bot_username: agent.bot_username,
      member_count: memberCount,
      today: {
        messages_received: messagesToday || 0,
        messages_sent: todayStats?.messages_sent || 0,
        unique_users: uniqueUsers,
      },
      top_chatters: topChatters,
      weekly: weeklyStats || [],
      verified_at: agent.verified_at,
    });

  } catch (error) {
    console.error('Stats error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

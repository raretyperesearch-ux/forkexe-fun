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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { botId } = req.query;
    const update = req.body;

    if (!botId) {
      return res.status(400).json({ error: 'Missing botId' });
    }

    // Find the agent by bot_id
    const { data: agent } = await supabase
      .from('agent_service')
      .select('*')
      .eq('bot_id', botId)
      .single();

    if (!agent) {
      console.error('Unknown bot:', botId);
      return res.status(200).json({ ok: true }); // Don't error, just ignore
    }

    // Handle different update types
    const message = update.message || update.edited_message;
    const myChatMember = update.my_chat_member;

    // Bot was added to a group
    if (myChatMember) {
      const chat = myChatMember.chat;
      const newStatus = myChatMember.new_chat_member?.status;

      // Bot was added as member or admin
      if (chat.type === 'group' || chat.type === 'supergroup') {
        if (newStatus === 'member' || newStatus === 'administrator') {
          // Save the group ID
          const { error } = await supabase
            .from('agent_service')
            .update({
              tg_group_id: chat.id.toString(),
              updated_at: new Date().toISOString(),
            })
            .eq('token_address', agent.token_address);

          if (!error) {
            // Generate invite link
            const linkResult = await tgApi(agent.bot_token, 'createChatInviteLink', {
              chat_id: chat.id,
              name: 'AgentScreener',
              creates_join_request: false,
            });

            if (linkResult.ok) {
              await supabase
                .from('agent_service')
                .update({
                  tg_group_link: linkResult.result.invite_link,
                })
                .eq('token_address', agent.token_address);
            }

            // Send welcome message
            await tgApi(agent.bot_token, 'sendMessage', {
              chat_id: chat.id,
              text: `🤖 Agent activated!\n\nThis chat is now connected to AgentScreener.\n\nI'll be your AI community manager. Let's build! 🚀`,
            });
          }
        }

        // Bot was removed
        if (newStatus === 'left' || newStatus === 'kicked') {
          await supabase
            .from('agent_service')
            .update({
              tg_group_id: null,
              tg_group_link: null,
              updated_at: new Date().toISOString(),
            })
            .eq('token_address', agent.token_address);
        }
      }

      return res.status(200).json({ ok: true });
    }

    // Regular message
    if (message && message.text) {
      const chat = message.chat;
      const from = message.from;

      // Only process group messages
      if (chat.type !== 'group' && chat.type !== 'supergroup') {
        // DM - could handle separately
        return res.status(200).json({ ok: true });
      }

      // Make sure this is the linked group
      if (chat.id.toString() !== agent.tg_group_id) {
        return res.status(200).json({ ok: true });
      }

      // Don't log messages from the bot itself
      if (from.is_bot) {
        return res.status(200).json({ ok: true });
      }

      // Handle commands
      if (message.text.startsWith('/')) {
        const command = message.text.split(' ')[0].toLowerCase();
        
        if (command === '/start') {
          await tgApi(agent.bot_token, 'sendMessage', {
            chat_id: chat.id,
            text: `Welcome! I'm the AI agent for this community.\n\nCommands:\n/price - Token price\n/stats - Token stats\n/links - Important links`,
            reply_to_message_id: message.message_id,
          });
        }

        if (command === '/price') {
          // Fetch price from agents table
          const { data: tokenData } = await supabase
            .from('agents')
            .select('price, change_24h, symbol')
            .eq('token_address', agent.token_address)
            .single();

          if (tokenData) {
            const change = tokenData.change_24h || 0;
            const emoji = change >= 0 ? '🟢' : '🔴';
            await tgApi(agent.bot_token, 'sendMessage', {
              chat_id: chat.id,
              text: `${emoji} $${tokenData.symbol}\n\nPrice: $${tokenData.price?.toFixed(8) || 'N/A'}\n24h: ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
              reply_to_message_id: message.message_id,
            });
          }
        }

        if (command === '/stats') {
          const { data: tokenData } = await supabase
            .from('agents')
            .select('*')
            .eq('token_address', agent.token_address)
            .single();

          if (tokenData) {
            await tgApi(agent.bot_token, 'sendMessage', {
              chat_id: chat.id,
              text: `📊 ${tokenData.name} Stats\n\nMCap: $${formatNumber(tokenData.mcap)}\nVolume: $${formatNumber(tokenData.volume_24h)}\nLiquidity: $${formatNumber(tokenData.liquidity)}`,
              reply_to_message_id: message.message_id,
            });
          }
        }

        if (command === '/links') {
          await tgApi(agent.bot_token, 'sendMessage', {
            chat_id: chat.id,
            text: `🔗 Links\n\n📈 AgentScreener: https://agentscreener.pro\n📊 DexScreener: https://dexscreener.com/base/${agent.token_address}\n🔍 BaseScan: https://basescan.org/token/${agent.token_address}`,
            reply_to_message_id: message.message_id,
          });
        }

        return res.status(200).json({ ok: true });
      }

      // Log the message
      await supabase.from('message_log').insert({
        token_address: agent.token_address,
        tg_group_id: chat.id.toString(),
        from_user_id: from.id.toString(),
        from_username: from.username || from.first_name || 'Unknown',
        message: message.text,
        message_type: 'text',
        tg_message_id: message.message_id.toString(),
        created_at: new Date(message.date * 1000).toISOString(),
      });

      // Update analytics
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('agent_analytics')
        .upsert({
          token_address: agent.token_address,
          date: today,
          messages_received: 1,
        }, { 
          onConflict: 'token_address,date',
        });
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(200).json({ ok: true }); // Always return 200 to TG
  }
}

function formatNumber(num: number | null): string {
  if (!num) return 'N/A';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
}

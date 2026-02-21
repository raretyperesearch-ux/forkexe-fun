import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8529493155:AAFJJvN6teg9DjlIPvf7Hsk7ILRPE_5hl18';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc3B3aHh2bHF3dnlscmdpeWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDk0NTQsImV4cCI6MjA4NTM4NTQ1NH0.f6AuOz7HfkMFGf-RuoRP3BJofxzPd1DXKsQd1MFfmUA'
);

// Helper: Format number with K/M suffix
function formatNumber(num: number | null): string {
  if (!num) return 'N/A';
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

// Helper: Format change with emoji
function formatChange(change: number | null): string {
  if (!change) return '0%';
  const emoji = change >= 0 ? '🟢' : '🔴';
  return `${emoji} ${change >= 0 ? '+' : ''}${Number(change).toFixed(2)}%`;
}

// Send message to Telegram
async function sendMessage(chatId: number, text: string, parseMode = 'Markdown') {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true
    })
  });
}

// Answer inline query
async function answerInlineQuery(queryId: string, results: any[]) {
  await fetch(`${TELEGRAM_API}/answerInlineQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inline_query_id: queryId,
      results,
      cache_time: 30
    })
  });
}

// Get agent by symbol
async function getAgentBySymbol(symbol: string) {
  const cleanSymbol = symbol.replace('$', '').toUpperCase();
  const { data } = await supabase
    .from('agents')
    .select('*')
    .ilike('symbol', cleanSymbol)
    .order('mcap', { ascending: false })
    .limit(1);
  
  return data?.[0] || null;
}

// Get top agents
async function getTopAgents(limit = 5, ascending = false) {
  const { data } = await supabase
    .from('agents')
    .select('*')
    .not('change_24h', 'is', null)
    .gt('mcap', 10000)
    .gt('volume_24h', 1000)
    .order('change_24h', { ascending })
    .limit(limit);
  
  return data || [];
}

// Get verified agents
async function getVerifiedAgents(limit = 10) {
  const { data } = await supabase
    .from('verifications')
    .select('*')
    .eq('status', 'verified')
    .order('verified_at', { ascending: false })
    .limit(limit);
  
  return data || [];
}

// Format agent message
function formatAgentMessage(agent: any): string {
  return `
🤖 *${agent.name}* ($${agent.symbol})

💰 MCap: ${formatNumber(agent.mcap)}
💧 Liquidity: ${formatNumber(agent.liquidity)}
📊 24h Vol: ${formatNumber(agent.volume_24h)}
${formatChange(agent.change_24h)}

🔗 [DexScreener](https://dexscreener.com/base/${agent.token_address})
🌐 [AgentScreener](https://agentscreener.pro)
`.trim();
}

// Handle commands
async function handleCommand(chatId: number, command: string, args: string) {
  switch (command) {
    case '/start':
    case '/help':
      await sendMessage(chatId, `
👋 *Welcome to AgentScreener Bot!*

Track AI agent tokens on Base.

*Commands:*
/price <symbol> - Get token stats
/top - Top 5 gainers
/losers - Top 5 losers
/verified - Verified agents

*Inline Mode:*
Type \`@agentscreener_bot $CLAWNCH\` in any chat!

🦞 agentscreener.pro
`.trim());
      break;

    case '/price':
      if (!args) {
        await sendMessage(chatId, 'Usage: /price <symbol>\nExample: /price CLAWNCH');
        return;
      }
      const agent = await getAgentBySymbol(args);
      if (agent) {
        await sendMessage(chatId, formatAgentMessage(agent));
      } else {
        await sendMessage(chatId, `❌ Agent not found: ${args}`);
      }
      break;

    case '/top':
      const gainers = await getTopAgents(5, false);
      if (gainers.length) {
        let msg = '🚀 *Top 5 Gainers (24h)*\n\n';
        gainers.forEach((a, i) => {
          msg += `${i + 1}. *$${a.symbol}* ${formatChange(a.change_24h)}\n`;
          msg += `   MCap: ${formatNumber(a.mcap)} | Vol: ${formatNumber(a.volume_24h)}\n\n`;
        });
        msg += '🦞 agentscreener.pro';
        await sendMessage(chatId, msg);
      } else {
        await sendMessage(chatId, '❌ No data available');
      }
      break;

    case '/losers':
      const losers = await getTopAgents(5, true);
      if (losers.length) {
        let msg = '📉 *Top 5 Losers (24h)*\n\n';
        losers.forEach((a, i) => {
          msg += `${i + 1}. *$${a.symbol}* ${formatChange(a.change_24h)}\n`;
          msg += `   MCap: ${formatNumber(a.mcap)} | Vol: ${formatNumber(a.volume_24h)}\n\n`;
        });
        msg += '🦞 agentscreener.pro';
        await sendMessage(chatId, msg);
      } else {
        await sendMessage(chatId, '❌ No data available');
      }
      break;

    case '/verified':
      const verified = await getVerifiedAgents(10);
      if (verified.length) {
        let msg = '✅ *Verified Agents*\n\n';
        verified.forEach((v, i) => {
          msg += `${i + 1}. *${v.token_name}* ($${v.token_symbol})\n`;
        });
        msg += '\n🦞 agentscreener.pro';
        await sendMessage(chatId, msg);
      } else {
        await sendMessage(chatId, '❌ No verified agents found');
      }
      break;
  }
}

// Handle inline queries
async function handleInlineQuery(queryId: string, query: string) {
  // Default: show top gainers
  if (!query || query === 'top') {
    const agents = await getTopAgents(5, false);
    const results = agents.map((agent, i) => ({
      type: 'article',
      id: `top-${agent.id}`,
      title: `${i + 1}. $${agent.symbol} ${formatChange(agent.change_24h)}`,
      description: `MCap: ${formatNumber(agent.mcap)} | Vol: ${formatNumber(agent.volume_24h)}`,
      input_message_content: {
        message_text: formatAgentMessage(agent),
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      }
    }));
    await answerInlineQuery(queryId, results);
    return;
  }

  // Search by symbol
  if (query.startsWith('$') || query.length >= 2) {
    const agent = await getAgentBySymbol(query);
    if (agent) {
      const results = [{
        type: 'article',
        id: `agent-${agent.id}`,
        title: `$${agent.symbol} - ${agent.name}`,
        description: `${formatChange(agent.change_24h)} | MCap: ${formatNumber(agent.mcap)}`,
        input_message_content: {
          message_text: formatAgentMessage(agent),
          parse_mode: 'Markdown',
          disable_web_page_preview: true
        }
      }];
      await answerInlineQuery(queryId, results);
      return;
    }
  }

  // No results
  await answerInlineQuery(queryId, []);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'AgentScreener Bot webhook active' });
  }

  try {
    const update = req.body;

    // Handle regular messages/commands
    if (update.message?.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();
      
      if (text.startsWith('/')) {
        const [command, ...argParts] = text.split(' ');
        const args = argParts.join(' ').trim();
        await handleCommand(chatId, command.toLowerCase(), args);
      }
    }

    // Handle inline queries
    if (update.inline_query) {
      const queryId = update.inline_query.id;
      const query = update.inline_query.query.trim();
      await handleInlineQuery(queryId, query);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
}

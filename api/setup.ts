import type { VercelRequest, VercelResponse } from '@vercel/node';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8529493155:AAFJJvN6teg9DjlIPvf7Hsk7ILRPE_5hl18';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const action = req.query.action as string;
  
  // Get webhook URL from request or construct from host
  const host = req.headers.host || 'agentscreener.xyz';
  const webhookUrl = `https://${host}/api/telegram/webhook`;

  try {
    if (action === 'set') {
      // Set webhook
      const response = await fetch(`${TELEGRAM_API}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'inline_query']
        })
      });
      const data = await response.json();
      return res.status(200).json({ 
        action: 'setWebhook',
        webhookUrl,
        result: data 
      });
    }

    if (action === 'delete') {
      // Delete webhook
      const response = await fetch(`${TELEGRAM_API}/deleteWebhook`);
      const data = await response.json();
      return res.status(200).json({ 
        action: 'deleteWebhook',
        result: data 
      });
    }

    if (action === 'info') {
      // Get webhook info
      const response = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
      const data = await response.json();
      return res.status(200).json({ 
        action: 'getWebhookInfo',
        result: data 
      });
    }

    // Get bot info
    const meResponse = await fetch(`${TELEGRAM_API}/getMe`);
    const meData = await meResponse.json();
    
    const webhookResponse = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();

    return res.status(200).json({
      bot: meData.result,
      webhook: webhookData.result,
      expectedUrl: webhookUrl,
      actions: {
        setWebhook: `${req.url}?action=set`,
        deleteWebhook: `${req.url}?action=delete`,
        getInfo: `${req.url}?action=info`
      }
    });
  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}

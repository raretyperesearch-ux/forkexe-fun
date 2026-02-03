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
  if (req.method !== 'PATCH' && req.method !== 'GET') {
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

    // GET - return current settings
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        settings: {
          bot_name: agent.bot_name,
          bot_username: agent.bot_username,
          bot_photo_url: agent.bot_photo_url,
          tg_group_id: agent.tg_group_id,
          tg_group_link: agent.tg_group_link,
          is_active: agent.is_active,
          verified_at: agent.verified_at,
        },
      });
    }

    // PATCH - update settings
    const { bot_name, bot_photo_url, description } = req.body;
    
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    // Update bot name in TG
    if (bot_name && bot_name !== agent.bot_name) {
      const nameResult = await tgApi(agent.bot_token, 'setMyName', { 
        name: bot_name.slice(0, 64)
      });
      
      if (nameResult.ok) {
        updates.bot_name = bot_name;
      } else {
        console.error('Failed to set bot name:', nameResult);
      }
    }

    // Update description in TG
    if (description) {
      await tgApi(agent.bot_token, 'setMyDescription', {
        description: description.slice(0, 512)
      });
    }

    // Update photo URL (stored, but TG photo update is complex)
    if (bot_photo_url) {
      updates.bot_photo_url = bot_photo_url;
      // TODO: Actually update TG bot photo (requires file upload)
    }

    // Save to DB
    const { error } = await supabase
      .from('agent_service')
      .update(updates)
      .eq('token_address', agent.token_address);

    if (error) {
      console.error('Update error:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    return res.status(200).json({
      success: true,
      message: 'Settings updated',
      updated: Object.keys(updates).filter(k => k !== 'updated_at'),
    });

  } catch (error) {
    console.error('Settings error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

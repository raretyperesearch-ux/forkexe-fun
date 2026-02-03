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

    // Check if group already exists
    if (agent.tg_group_id) {
      return res.status(400).json({ 
        error: 'Group already exists',
        group_id: agent.tg_group_id,
        invite_link: agent.tg_group_link
      });
    }

    const { name, description } = req.body;
    const groupName = name || agent.bot_name || 'Agent Community';
    const groupDesc = description || `Official community powered by Agent Service`;

    // Unfortunately, bots cannot create groups directly via API
    // They need to be added to a group by a user
    // 
    // WORKAROUND: We create a channel (bots CAN create channels)
    // OR we use a supergroup that was pre-created
    //
    // For MVP: Return instructions for manual setup
    // The agent dev creates the group, adds the bot, then we save the group ID

    // For now, we'll set up the bot to be ready and return instructions
    // When bot is added to a group, webhook will capture the group ID

    // Set bot info
    if (agent.bot_name) {
      await tgApi(agent.bot_token, 'setMyName', { name: agent.bot_name });
    }

    if (agent.bot_photo_url) {
      // Download and set photo
      try {
        const photoResponse = await fetch(agent.bot_photo_url);
        const photoBuffer = await photoResponse.arrayBuffer();
        const base64Photo = Buffer.from(photoBuffer).toString('base64');
        
        // TG requires multipart form for photos - skip for MVP
        // await tgApi(agent.bot_token, 'setMyProfilePhoto', { photo: ... });
      } catch (e) {
        console.error('Failed to set bot photo:', e);
      }
    }

    // Set bot description
    await tgApi(agent.bot_token, 'setMyDescription', { 
      description: groupDesc.slice(0, 512)
    });

    // Set bot commands
    await tgApi(agent.bot_token, 'setMyCommands', {
      commands: [
        { command: 'start', description: 'Start interacting with the agent' },
        { command: 'price', description: 'Get current token price' },
        { command: 'stats', description: 'Get token stats' },
        { command: 'links', description: 'Get important links' },
      ]
    });

    return res.status(200).json({
      success: true,
      bot_username: agent.bot_username,
      message: 'Bot configured. Create a TG group and add the bot as admin.',
      instructions: [
        `1. Create a new Telegram group named "${groupName}"`,
        `2. Add ${agent.bot_username} to the group`,
        `3. Make the bot an admin with "Post Messages" permission`,
        `4. Send /start in the group - this links the group automatically`,
        `5. The group will appear on your AgentScreener profile`,
      ],
    });

  } catch (error) {
    console.error('Create group error:', error);
    return res.status(500).json({ error: String(error) });
  }
}

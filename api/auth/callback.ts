import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import { createClient } from '@supabase/supabase-js';

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || 'basvE0m5N73lZql07Q8BTd3Tu';
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || '4jY9mYCos7lE3MUMrdGimihMeJvoCeG8wEBGXmrE3lopJyZpB5';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const oauth = new OAuth({
  consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

export default async function handler(req: any, res: any) {
  const { oauth_token, oauth_verifier, agentId } = req.query;

  if (!oauth_token || !oauth_verifier || !agentId) {
    return res.redirect('/?error=missing_params');
  }

  try {
    // Step 2: Exchange for access token
    const accessTokenData = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: { oauth_token, oauth_verifier },
    };

    const authHeader = oauth.toHeader(oauth.authorize(accessTokenData, { key: oauth_token, secret: '' }));

    const tokenResponse = await fetch(accessTokenData.url, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `oauth_verifier=${oauth_verifier}`,
    });

    const tokenText = await tokenResponse.text();
    const tokenParams = new URLSearchParams(tokenText);
    const accessToken = tokenParams.get('oauth_token');
    const accessTokenSecret = tokenParams.get('oauth_token_secret');
    const twitterHandle = tokenParams.get('screen_name');
    const twitterUserId = tokenParams.get('user_id');

    if (!twitterHandle) {
      throw new Error('Failed to get Twitter handle');
    }

    // Check if this Twitter handle owns the agent
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (!agent) {
      return res.redirect('/?error=agent_not_found');
    }

    // Check if handle matches (remove @ if present)
    const agentHandle = agent.handle.replace('@', '').toLowerCase();
    const userHandle = twitterHandle.toLowerCase();

    if (agentHandle !== userHandle) {
      return res.redirect(`/?error=handle_mismatch&expected=${agentHandle}&got=${userHandle}`);
    }

    // Handle matches! Ask for wallet address
    // For now, redirect to a page where they can enter their wallet
    res.redirect(`/claim?agentId=${agentId}&handle=${twitterHandle}&verified=true`);

  } catch (error) {
    console.error('Twitter callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}

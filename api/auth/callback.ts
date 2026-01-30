import { createClient } from '@supabase/supabase-js';

const CLIENT_ID = process.env.TWITTER_CLIENT_ID || 'ZFRiY29yVWdaSnlBRm5rVDlydVU6MTpjaQ';
const CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET || 'lmOuFfBhn-ONvltevEgUYbASzsM5_9q7luQyyzMToYYTxafMR9';
const CALLBACK_URL = 'https://forkexe-fun.vercel.app/api/auth/callback';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || ''
);

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
  }
  return cookies;
}

export default async function handler(req: any, res: any) {
  const { code, state, error } = req.query;

  if (error) {
    return res.redirect(`/?error=${error}`);
  }

  if (!code || !state) {
    return res.redirect('/?error=missing_params');
  }

  // Get code verifier from cookie
  const cookies = parseCookies(req.headers.cookie || '');
  const codeVerifier = cookies['code_verifier'];

  if (!codeVerifier) {
    return res.redirect('/?error=missing_verifier');
  }

  // Decode state to get agentId
  let agentId: string;
  try {
    const stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    agentId = stateData.agentId;
  } catch {
    return res.redirect('/?error=invalid_state');
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: CALLBACK_URL,
        code_verifier: codeVerifier,
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      console.error('Token error:', tokenData);
      return res.redirect('/?error=token_failed');
    }

    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    const twitterHandle = userData.data?.username;

    if (!twitterHandle) {
      return res.redirect('/?error=user_fetch_failed');
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

    // Handle matches! Redirect to claim page
    res.redirect(`/claim?agentId=${agentId}&handle=${twitterHandle}&verified=true`);

  } catch (error) {
    console.error('Twitter callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}

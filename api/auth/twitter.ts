import crypto from 'crypto';
import OAuth from 'oauth-1.0a';

const CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || 'basvE0m5N73lZql07Q8BTd3Tu';
const CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || '4jY9mYCos7lE3MUMrdGimihMeJvoCeG8wEBGXmrE3lopJyZpB5';
const CALLBACK_URL = 'https://forkexe-fun.vercel.app/api/auth/callback';

const oauth = new OAuth({
  consumer: { key: CONSUMER_KEY, secret: CONSUMER_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

export default async function handler(req: any, res: any) {
  const agentId = req.query.agentId;
  
  if (!agentId) {
    return res.status(400).json({ error: 'agentId required' });
  }

  try {
    // Step 1: Get request token
    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: `${CALLBACK_URL}?agentId=${agentId}` },
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData));

    const response = await fetch(requestData.url, {
      method: 'POST',
      headers: {
        ...authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const text = await response.text();
    const params = new URLSearchParams(text);
    const oauthToken = params.get('oauth_token');

    if (!oauthToken) {
      throw new Error('Failed to get request token');
    }

    // Redirect to Twitter auth page
    res.redirect(`https://api.twitter.com/oauth/authorize?oauth_token=${oauthToken}`);
  } catch (error) {
    console.error('Twitter auth error:', error);
    res.status(500).json({ error: 'Auth failed' });
  }
}

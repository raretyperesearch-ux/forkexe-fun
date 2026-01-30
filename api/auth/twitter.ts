import crypto from 'crypto';

const CLIENT_ID = process.env.TWITTER_CLIENT_ID || 'ZFRiY29yVWdaSnlBRm5rVDlydVU6MTpjaQ';
const CALLBACK_URL = 'https://forkexe-fun.vercel.app/api/auth/callback';

function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString('base64url');
}

function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

export default async function handler(req: any, res: any) {
  const agentId = req.query.agentId;
  
  if (!agentId) {
    return res.status(400).json({ error: 'agentId required' });
  }

  // Generate state with agentId
  const state = Buffer.from(JSON.stringify({ agentId })).toString('base64url');
  
  // Generate code verifier and challenge for PKCE
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  
  // Store code verifier in cookie for callback
  res.setHeader('Set-Cookie', `code_verifier=${codeVerifier}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    scope: 'tweet.read users.read',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  res.redirect(`https://twitter.com/i/oauth2/authorize?${params.toString()}`);
}

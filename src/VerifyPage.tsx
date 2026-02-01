import { useState } from 'react';

export default function VerifyPage() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestVerification = async () => {
    if (!tokenAddress) {
      setError('Enter token address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/verify/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token_address: tokenAddress })
      });
      const data = await res.json();
      
      if (data.error) {
        setError(data.message || data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError('Failed to request verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0a', 
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 50 }}>
          <h1 style={{ fontSize: 36, marginBottom: 10 }}>Get Verified ✅</h1>
          <p style={{ color: '#888', fontSize: 18 }}>
            For Clawnch agents. Prove your token is legit.
          </p>
        </div>

        {/* What Verification Proves */}
        <div style={{ 
          background: '#1a1a1a', 
          border: '1px solid #333', 
          borderRadius: 16, 
          padding: 24,
          marginBottom: 30
        }}>
          <h2 style={{ marginBottom: 16, fontSize: 20 }}>What Verification Proves</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🦞</span>
              <span>Launched via Clawnch (verified against their API)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🔐</span>
              <span>You control the agent's fee wallet</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>✅</span>
              <span>Blue checkmark on agentscreener.pro</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🔍</span>
              <span>Appear in "Verified" filter tab</span>
            </div>
          </div>
        </div>

        {/* Cost */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1a3a1a 0%, #0a1a0a 100%)',
          border: '1px solid #2a5a2a', 
          borderRadius: 16, 
          padding: 24,
          marginBottom: 30,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 8 }}>ONE-TIME COST</div>
          <div style={{ fontSize: 48, fontWeight: 700 }}>0.1 ETH</div>
          <div style={{ color: '#888', marginTop: 8 }}>on Base</div>
        </div>

        {/* How It Works */}
        <div style={{ 
          background: '#1a1a1a', 
          border: '1px solid #333', 
          borderRadius: 16, 
          padding: 24,
          marginBottom: 30
        }}>
          <h2 style={{ marginBottom: 20, fontSize: 20 }}>How It Works</h2>
          
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', background: '#3B82F6', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0
              }}>1</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Enter Token Address</div>
                <div style={{ color: '#888', fontSize: 14 }}>We check Clawnch to find your agent</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', background: '#3B82F6', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0
              }}>2</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Send 0.1 ETH</div>
                <div style={{ color: '#888', fontSize: 14 }}>From your agent's fee wallet (we get this from Clawnch)</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ 
                width: 32, height: 32, borderRadius: '50%', background: '#3B82F6', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, flexShrink: 0
              }}>3</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Get Verified</div>
                <div style={{ color: '#888', fontSize: 14 }}>Badge appears within 24 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Request Form */}
        {!result ? (
          <div style={{ 
            background: '#1a1a1a', 
            border: '1px solid #333', 
            borderRadius: 16, 
            padding: 24,
            marginBottom: 30
          }}>
            <h2 style={{ marginBottom: 20, fontSize: 20 }}>Request Verification</h2>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, color: '#888' }}>
                Token Contract Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 8,
                  border: '1px solid #333',
                  background: '#0a0a0a',
                  color: '#fff',
                  fontSize: 14,
                  fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                Must be a token launched via Clawnch
              </div>
            </div>
            
            {error && (
              <div style={{ 
                color: '#EF4444', 
                marginBottom: 16, 
                fontSize: 14,
                padding: 12,
                background: '#2a1a1a',
                borderRadius: 8
              }}>{error}</div>
            )}
            
            <button
              onClick={requestVerification}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 8,
                border: 'none',
                background: '#3B82F6',
                color: '#fff',
                fontSize: 16,
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Checking Clawnch...' : 'Check Token'}
            </button>
          </div>
        ) : (
          /* Payment Instructions */
          <div style={{ 
            background: '#1a1a1a', 
            border: '1px solid #3B82F6', 
            borderRadius: 16, 
            padding: 24,
            marginBottom: 30
          }}>
            <h2 style={{ marginBottom: 8, fontSize: 20, color: '#3B82F6' }}>✓ Token Found on Clawnch</h2>
            <p style={{ color: '#888', marginBottom: 20 }}>Send payment to complete verification.</p>
            
            {/* Token Info */}
            <div style={{ 
              marginBottom: 20, 
              padding: 16, 
              background: '#0a0a0a', 
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 16
            }}>
              {result.token?.image_url && (
                <img src={result.token.image_url} alt="" style={{ width: 56, height: 56, borderRadius: 8 }} />
              )}
              <div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>
                  {result.token?.name} <span style={{ color: '#888' }}>${result.token?.symbol}</span>
                </div>
                {result.token?.agent_name && (
                  <div style={{ fontSize: 14, color: '#888' }}>by {result.token.agent_name}</div>
                )}
                <div style={{ fontSize: 12, color: '#22C55E', marginTop: 4 }}>🦞 Verified Clawnch Launch</div>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>Send Exactly</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>0.1 ETH</div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>To Address</div>
              <div style={{ 
                padding: 12, 
                background: '#0a0a0a', 
                borderRadius: 8, 
                fontFamily: 'monospace',
                fontSize: 14,
                wordBreak: 'break-all'
              }}>
                {result.payment_address}
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>From Wallet (Agent's Fee Wallet)</div>
              <div style={{ 
                padding: 12, 
                background: '#0a0a0a', 
                borderRadius: 8, 
                fontFamily: 'monospace',
                fontSize: 14,
                wordBreak: 'break-all',
                color: '#F59E0B'
              }}>
                {result.deployer_address}
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                This is the wallet from Clawnch records. Payment must come from this address.
              </div>
            </div>
            
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 4 }}>Reference Code</div>
              <div style={{ 
                padding: 12, 
                background: '#0a0a0a', 
                borderRadius: 8, 
                fontFamily: 'monospace',
                fontSize: 18,
                fontWeight: 600
              }}>
                {result.reference_code}
              </div>
            </div>
            
            <div style={{ 
              padding: 16, 
              background: '#1a2a1a', 
              borderRadius: 8, 
              border: '1px solid #2a4a2a',
              marginBottom: 20
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>⚠️ Important</div>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#888', fontSize: 14 }}>
                <li>Send from the agent wallet shown above (we verify against Clawnch)</li>
                <li>Send on Base chain only</li>
                <li>Verification approved within 24 hours</li>
              </ul>
            </div>
            
            <button
              onClick={() => { setResult(null); setTokenAddress(''); }}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 8,
                border: '1px solid #333',
                background: 'transparent',
                color: '#888',
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Start Over
            </button>
          </div>
        )}

        {/* For Agents */}
        <div style={{ 
          background: '#1a1a1a', 
          border: '1px solid #333', 
          borderRadius: 16, 
          padding: 24,
          marginBottom: 30
        }}>
          <h2 style={{ marginBottom: 12, fontSize: 20 }}>🤖 For Agents (Programmatic)</h2>
          <p style={{ color: '#888', marginBottom: 16 }}>
            Agents can verify themselves via API. Same process, just automated.
          </p>
          <a 
            href="/skill.md" 
            target="_blank"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              borderRadius: 8,
              background: '#222',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 14
            }}
          >
            View API Docs →
          </a>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{ color: '#3B82F6', textDecoration: 'none' }}>
            ← Back to agentscreener
          </a>
        </div>
      </div>
    </div>
  );
}

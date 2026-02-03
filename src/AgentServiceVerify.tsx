import { useState } from 'react';

const VERIFY_WALLET = '0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d';

export default function AgentServiceVerify() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleVerify = async () => {
    if (!tokenAddress || !txHash) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/agent-service/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_address: tokenAddress,
          tx_hash: txHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Verification failed');
        return;
      }

      setResult(data);
      setStep(3);
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '40px 20px',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            🤖 Agent Service
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Connect your AI agent to Telegram
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '40px',
          marginBottom: '40px',
        }}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: step >= s ? '#3B82F6' : '#333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
                fontSize: '14px',
                fontWeight: 600,
              }}>
                {step > s ? '✓' : s}
              </div>
              <div style={{ fontSize: '11px', color: step >= s ? '#fff' : '#666' }}>
                {s === 1 ? 'Send TX' : s === 2 ? 'Verify' : 'Done'}
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Instructions */}
        {step === 1 && (
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #222',
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>
              Step 1: Prove Ownership
            </h2>
            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
              Send a tiny transaction (0.000001 ETH) from your <strong>deployer wallet</strong> to verify you own this agent's token.
            </p>

            <div style={{
              backgroundColor: '#0a0a0a',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                Send to:
              </div>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '13px',
                wordBreak: 'break-all',
                color: '#3B82F6',
              }}>
                {VERIFY_WALLET}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(VERIFY_WALLET)}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  backgroundColor: 'transparent',
                  color: '#888',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Copy Address
              </button>
            </div>

            <div style={{
              backgroundColor: '#1a1a0a',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid #333300',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '12px', color: '#F59E0B' }}>
                ⚠️ Must be sent from the wallet that deployed your token contract
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3B82F6',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              I've Sent the Transaction →
            </button>
          </div>
        )}

        {/* Step 2: Enter Details */}
        {step === 2 && (
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #222',
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '16px' }}>
              Step 2: Verify
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                Token Contract Address
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  backgroundColor: '#0a0a0a',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '6px' }}>
                Transaction Hash
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  backgroundColor: '#0a0a0a',
                  color: '#fff',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            {error && (
              <div style={{
                backgroundColor: '#1a0a0a',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #330000',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#EF4444',
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  backgroundColor: 'transparent',
                  color: '#888',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleVerify}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: loading ? '#333' : '#3B82F6',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Verifying...' : 'Verify Ownership'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && result && (
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #222',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>Verified!</h2>
              <p style={{ color: '#888', fontSize: '14px' }}>
                Your agent is now connected to Agent Service
              </p>
            </div>

            <div style={{
              backgroundColor: '#0a0a0a',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                Your API Key (save this!)
              </div>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px',
                wordBreak: 'break-all',
                color: '#22C55E',
                marginBottom: '8px',
              }}>
                {result.api_key}
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result.api_key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  backgroundColor: 'transparent',
                  color: '#888',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Copy API Key
              </button>
            </div>

            <div style={{
              backgroundColor: '#0a0a0a',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <div style={{ fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                Your Bot
              </div>
              <div style={{ fontSize: '14px', color: '#3B82F6' }}>
                {result.bot_username}
              </div>
            </div>

            <div style={{
              backgroundColor: '#0a1a0a',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #003300',
              marginBottom: '24px',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#22C55E' }}>
                Next Steps:
              </div>
              <ol style={{ margin: 0, paddingLeft: '20px', color: '#888', fontSize: '13px', lineHeight: '1.8' }}>
                {result.next_steps?.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3B82F6',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

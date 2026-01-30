import { useState } from 'react';

export default function ClaimPage() {
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Get params from URL
  const params = new URLSearchParams(window.location.search);
  const agentId = params.get('agentId');
  const handle = params.get('handle');
  const verified = params.get('verified');

  if (!agentId || !handle || verified !== 'true') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0d0d0d', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#EF4444' }}>Invalid Claim Link</h1>
          <p style={{ color: '#888' }}>Please start the claim process from forkexe.fun</p>
          <a href="/" style={{ color: '#22c55e' }}>← Back to Home</a>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          twitterHandle: handle,
          walletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Claim failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Claim failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#0d0d0d', 
        color: '#fff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
          <h1 style={{ color: '#22c55e', marginBottom: '10px' }}>Claimed!</h1>
          <p style={{ color: '#888', marginBottom: '20px' }}>
            Your wallet is now linked to @{handle}. Trading fees will be routed to your wallet.
          </p>
          <a 
            href="/" 
            style={{ 
              display: 'inline-block',
              padding: '12px 24px', 
              backgroundColor: '#22c55e', 
              color: '#fff', 
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Back to Screener
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0d0d0d', 
      color: '#fff', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{ 
        backgroundColor: '#1a1a1a', 
        padding: '40px', 
        borderRadius: '16px', 
        maxWidth: '450px', 
        width: '100%',
        margin: '20px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🦞</div>
          <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>Claim Your Agent</h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Verified as <span style={{ color: '#1DA1F2' }}>@{handle}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px', 
              color: '#888' 
            }}>
              Solana Wallet Address
            </label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter your Solana wallet address"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#0d0d0d',
                border: '1px solid #333',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              required
            />
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#EF4444' + '20', 
              color: '#EF4444', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: loading ? '#888' : '#22c55e',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Claiming...' : 'Claim Agent'}
          </button>
        </form>

        <p style={{ 
          marginTop: '20px', 
          fontSize: '12px', 
          color: '#666', 
          textAlign: 'center' 
        }}>
          Trading fees will be routed to this wallet address
        </p>
      </div>
    </div>
  );
}

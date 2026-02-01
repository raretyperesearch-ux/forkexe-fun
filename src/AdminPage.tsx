import { useState, useEffect } from 'react';

const ADMIN_SECRET = 'agentscreener-admin-2026'; // Change this!

type Verification = {
  id: number;
  token_address: string;
  token_name: string;
  token_symbol: string;
  deployer_address: string;
  reference_code: string;
  status: string;
  created_at: string;
  verified_at: string | null;
  payment_tx: string | null;
};

export default function AdminPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [_, setLoading] = useState(true);
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);

  const fetchVerifications = async () => {
    try {
      const res = await fetch(`/api/admin?secret=${ADMIN_SECRET}`);
      const data = await res.json();
      if (data.verifications) {
        setVerifications(data.verifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const approveVerification = async (id: number) => {
    const tx = prompt('Enter transaction hash (optional):') || 'manual-approval';
    
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify({ id, payment_tx: tx })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Verified!');
        fetchVerifications();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Failed to verify');
    }
  };

  const rejectVerification = async (id: number) => {
    if (!confirm('Reject this verification?')) return;
    
    try {
      const res = await fetch('/api/admin', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-secret': ADMIN_SECRET
        },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchVerifications();
      }
    } catch (err) {
      alert('Failed to reject');
    }
  };

  useEffect(() => {
    if (authed) {
      fetchVerifications();
    }
  }, [authed]);

  // Simple auth gate
  if (!authed) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0a', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#fff', marginBottom: '20px' }}>🔐 Admin</h1>
          <input
            type="password"
            placeholder="Enter secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && secret === ADMIN_SECRET) {
                setAuthed(true);
              }
            }}
            style={{
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: '#1a1a1a',
              color: '#fff',
              fontSize: '16px',
              width: '250px'
            }}
          />
          <button
            onClick={() => {
              if (secret === ADMIN_SECRET) setAuthed(true);
              else alert('Wrong secret');
            }}
            style={{
              marginLeft: '10px',
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#3B82F6',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  const pending = verifications.filter(v => v.status === 'pending');
  const verified = verifications.filter(v => v.status === 'verified');

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0a', 
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px' }}>🛡️ Verification Admin</h1>
        <p style={{ color: '#888', marginBottom: '30px' }}>
          Payment wallet: <code style={{ color: '#3B82F6' }}>0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d</code>
        </p>

        {/* Pending */}
        <h2 style={{ color: '#F59E0B', marginBottom: '15px' }}>
          ⏳ Pending ({pending.length})
        </h2>
        
        {pending.length === 0 ? (
          <p style={{ color: '#666' }}>No pending verifications</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '40px' }}>
            {pending.map((v) => (
              <div 
                key={v.id}
                style={{
                  background: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>
                    {v.token_name} <span style={{ color: '#888' }}>${v.token_symbol}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                    Token: <code>{v.token_address}</code>
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                    Deployer: <code>{v.deployer_address}</code>
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Ref: {v.reference_code} • {new Date(v.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => approveVerification(v.id)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#22C55E',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => rejectVerification(v.id)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: '1px solid #444',
                      background: 'transparent',
                      color: '#888',
                      cursor: 'pointer'
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Verified */}
        <h2 style={{ color: '#22C55E', marginBottom: '15px' }}>
          ✅ Verified ({verified.length})
        </h2>
        
        {verified.length === 0 ? (
          <p style={{ color: '#666' }}>No verified tokens yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {verified.map((v) => (
              <div 
                key={v.id}
                style={{
                  background: '#0f1f0f',
                  border: '1px solid #1a3a1a',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                  ✅ {v.token_name} <span style={{ color: '#888' }}>${v.token_symbol}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Token: <code>{v.token_address}</code>
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  Verified: {v.verified_at ? new Date(v.verified_at).toLocaleString() : 'N/A'}
                  {v.payment_tx && v.payment_tx !== 'manual-approval' && (
                    <> • <a href={`https://basescan.org/tx/${v.payment_tx}`} target="_blank" style={{ color: '#3B82F6' }}>View tx</a></>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '40px', textAlign: 'center', color: '#444' }}>
          <button 
            onClick={fetchVerifications}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #333',
              background: '#1a1a1a',
              color: '#888',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

type Verification = {
  id: number;
  token_address: string;
  token_name: string | null;
  token_symbol: string | null;
  image_url: string | null;
  dexscreener_url: string | null;
  deployer_address: string;
  reference_code: string;
  status: string;
  created_at: string;
  verified_at: string | null;
  payment_tx: string | null;
};

type TxCheck = {
  sender: string;
  to: string;
  amount: number;
  deployer: string;
  checks: {
    sender_matches_deployer: boolean;
    sent_to_payment_wallet: boolean;
    amount_ok: boolean;
    all_passed: boolean;
  };
};

export default function AdminPage() {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [txInputs, setTxInputs] = useState<Record<number, string>>({});
  const [txResults, setTxResults] = useState<Record<number, TxCheck | null>>({});
  const [loading, setLoading] = useState<Record<number, boolean>>({});

  const fetchVerifications = async (adminSecret: string) => {
    try {
      const res = await fetch(`/api/admin?secret=${adminSecret}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setAuthed(false);
        return;
      }
      setVerifications(data.verifications || []);
      setAuthed(true);
      setError('');
    } catch {
      setError('Failed to connect');
    }
  };

  const checkTx = async (id: number) => {
    const txHash = txInputs[id];
    if (!txHash) return alert('Enter transaction hash first');

    setLoading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch('/api/admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ id, tx_hash: txHash })
      });
      const data = await res.json();
      if (data.error) {
        alert('Error: ' + data.error);
        setTxResults(prev => ({ ...prev, [id]: null }));
      } else {
        setTxResults(prev => ({ ...prev, [id]: data }));
      }
    } catch {
      alert('Failed to check');
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const approve = async (id: number, force = false) => {
    const txHash = txInputs[id] || 'manual-approval';
    
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
        body: JSON.stringify({ id, payment_tx: txHash, force })
      });
      const data = await res.json();
      if (data.error) {
        alert('Error: ' + data.error);
      } else {
        alert('Verified!');
        setTxInputs(prev => ({ ...prev, [id]: '' }));
        setTxResults(prev => ({ ...prev, [id]: null }));
        fetchVerifications(secret);
      }
    } catch {
      alert('Failed');
    }
  };

  const reject = async (id: number) => {
    if (!confirm('Reject?')) return;
    await fetch('/api/admin', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
      body: JSON.stringify({ id })
    });
    fetchVerifications(secret);
  };

  // Login screen
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#fff', marginBottom: 20 }}>Admin</h1>
          {error && <p style={{ color: '#f44', marginBottom: 10 }}>{error}</p>}
          <input
            type="password"
            placeholder="Secret"
            value={secret}
            onChange={e => setSecret(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchVerifications(secret)}
            style={{ padding: '12px 20px', borderRadius: 8, border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: 16, width: 200 }}
          />
          <button onClick={() => fetchVerifications(secret)} style={{ marginLeft: 10, padding: '12px 24px', borderRadius: 8, border: 'none', background: '#3B82F6', color: '#fff', fontSize: 16, cursor: 'pointer' }}>
            Enter
          </button>
        </div>
      </div>
    );
  }

  const pending = verifications.filter(v => v.status === 'pending');
  const verified = verifications.filter(v => v.status === 'verified');

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', padding: 20, fontFamily: 'system-ui', color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1>Verification Admin</h1>
        <p style={{ color: '#888', marginBottom: 30 }}>
          Payment wallet: <code style={{ color: '#3B82F6' }}>0xa660a38f40a519f2e351cc9a5ca2f5fee1a9be0d</code>
        </p>

        {/* PENDING */}
        <h2 style={{ color: '#F59E0B' }}>Pending ({pending.length})</h2>
        {pending.length === 0 ? (
          <p style={{ color: '#666' }}>No pending</p>
        ) : (
          pending.map(v => {
            const result = txResults[v.id];
            const allPassed = result?.checks?.all_passed;

            return (
              <div key={v.id} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                {/* Token Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  {v.image_url && (
                    <img src={v.image_url} alt="" style={{ width: 48, height: 48, borderRadius: 8 }} />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>
                      {v.token_name || 'Unknown'} <span style={{ color: '#888' }}>${v.token_symbol || '???'}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#888' }}>
                      <a href={v.dexscreener_url || `https://dexscreener.com/base/${v.token_address}`} target="_blank" rel="noreferrer" style={{ color: '#3B82F6' }}>
                        DexScreener ↗
                      </a>
                      {' • '}
                      <a href={`https://www.clanker.world/clanker/${v.token_address}`} target="_blank" rel="noreferrer" style={{ color: '#3B82F6' }}>
                        Clanker ↗
                      </a>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                  Token: <code>{v.token_address}</code>
                </div>
                <div style={{ fontSize: 12, color: '#F59E0B', marginBottom: 4 }}>
                  Deployer: <code>{v.deployer_address}</code>
                </div>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 16 }}>
                  Ref: {v.reference_code} • {new Date(v.created_at).toLocaleString()}
                </div>

                {/* TX Input */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    placeholder="Paste tx hash (0x...)"
                    value={txInputs[v.id] || ''}
                    onChange={e => setTxInputs(prev => ({ ...prev, [v.id]: e.target.value }))}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #333', background: '#0a0a0a', color: '#fff', fontFamily: 'monospace', fontSize: 12 }}
                  />
                  <button
                    onClick={() => checkTx(v.id)}
                    disabled={loading[v.id]}
                    style={{ padding: '10px 16px', borderRadius: 8, border: '1px solid #333', background: '#222', color: '#fff', cursor: 'pointer' }}
                  >
                    {loading[v.id] ? '...' : 'Check'}
                  </button>
                </div>

                {/* TX Results */}
                {result && (
                  <div style={{ background: allPassed ? '#0f2f0f' : '#2f0f0f', border: `1px solid ${allPassed ? '#1a5a1a' : '#5a1a1a'}`, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 12 }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      {allPassed ? '✅ All checks passed' : '❌ Checks failed'}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      Sender: <code style={{ color: result.checks.sender_matches_deployer ? '#4f4' : '#f44' }}>{result.sender}</code>
                      {result.checks.sender_matches_deployer ? ' ✅' : ' ❌ MISMATCH'}
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      Deployer: <code>{result.deployer}</code>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      To: <code>{result.to}</code> {result.checks.sent_to_payment_wallet ? '✅' : '❌'}
                    </div>
                    <div>
                      Amount: <code>{result.amount} ETH</code> {result.checks.amount_ok ? '✅' : '❌'}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  {allPassed && (
                    <button onClick={() => approve(v.id)} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#22C55E', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                      ✓ Approve
                    </button>
                  )}
                  {result && !allPassed && (
                    <button onClick={() => approve(v.id, true)} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#666', color: '#fff', cursor: 'pointer' }}>
                      Force Approve
                    </button>
                  )}
                  <button onClick={() => reject(v.id)} style={{ padding: '10px 24px', borderRadius: 8, border: '1px solid #444', background: 'transparent', color: '#888', cursor: 'pointer' }}>
                    Reject
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* VERIFIED */}
        <h2 style={{ color: '#22C55E', marginTop: 40 }}>Verified ({verified.length})</h2>
        {verified.length === 0 ? (
          <p style={{ color: '#666' }}>No verified tokens</p>
        ) : (
          verified.map(v => (
            <div key={v.id} style={{ background: '#0f1f0f', border: '1px solid #1a3a1a', borderRadius: 12, padding: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              {v.image_url && (
                <img src={v.image_url} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  ✅ {v.token_name || 'Unknown'} <span style={{ color: '#888' }}>${v.token_symbol || '???'}</span>
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {v.token_address.slice(0, 10)}...{v.token_address.slice(-8)}
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  {v.verified_at && new Date(v.verified_at).toLocaleString()}
                  {v.payment_tx && v.payment_tx !== 'manual-approval' && (
                    <> • <a href={`https://basescan.org/tx/${v.payment_tx}`} target="_blank" rel="noreferrer" style={{ color: '#3B82F6' }}>tx</a></>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <button onClick={() => fetchVerifications(secret)} style={{ padding: '10px 20px', borderRadius: 8, border: '1px solid #333', background: '#1a1a1a', color: '#888', cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}

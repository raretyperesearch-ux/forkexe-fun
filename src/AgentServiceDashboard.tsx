import { useState, useEffect } from 'react';

export default function AgentServiceDashboard() {
  const [apiKey, setApiKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Check for saved API key
  useEffect(() => {
    const savedKey = localStorage.getItem('agent_service_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      authenticateWithKey(savedKey);
    }
  }, []);

  const authenticateWithKey = async (key: string) => {
    setLoading(true);
    setError('');

    try {
      // Fetch stats to validate key
      const response = await fetch('/api/agent-service/stats', {
        headers: { 'x-api-key': key },
      });

      if (!response.ok) {
        setError('Invalid API key');
        localStorage.removeItem('agent_service_api_key');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setStats(data);
      setIsAuthenticated(true);
      localStorage.setItem('agent_service_api_key', key);

      // Fetch settings
      const settingsRes = await fetch('/api/agent-service/settings', {
        headers: { 'x-api-key': key },
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.settings);
      }

      // Fetch recent messages
      const messagesRes = await fetch('/api/agent-service/messages?limit=20', {
        headers: { 'x-api-key': key },
      });
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData.messages || []);
      }
    } catch (err) {
      setError('Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (!apiKey) {
      setError('Please enter your API key');
      return;
    }
    authenticateWithKey(apiKey);
  };

  const handleLogout = () => {
    localStorage.removeItem('agent_service_api_key');
    setIsAuthenticated(false);
    setApiKey('');
    setStats(null);
    setSettings(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!testMessage.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch('/api/agent-service/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ message: testMessage }),
      });

      if (response.ok) {
        setTestMessage('');
        // Refresh stats
        authenticateWithKey(apiKey);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSendingMessage(false);
    }
  };

  const refreshData = () => {
    authenticateWithKey(apiKey);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        color: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: '#111',
          borderRadius: '12px',
          padding: '32px',
          border: '1px solid #222',
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>
            🤖 Agent Service
          </h1>
          <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
            Enter your API key to access dashboard
          </p>

          <input
            type="password"
            placeholder="as_live_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid #333',
              backgroundColor: '#0a0a0a',
              color: '#fff',
              fontSize: '14px',
              fontFamily: 'monospace',
              marginBottom: '16px',
            }}
          />

          {error && (
            <div style={{
              color: '#EF4444',
              fontSize: '13px',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: loading ? '#333' : '#3B82F6',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {loading ? 'Connecting...' : 'Login'}
          </button>

          <p style={{ color: '#666', fontSize: '12px', textAlign: 'center' }}>
            Don't have an API key?{' '}
            <a href="/agent-service/verify" style={{ color: '#3B82F6' }}>
              Verify your agent
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Dashboard
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '20px',
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '32px',
        }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>
              🤖 Agent Dashboard
            </h1>
            <p style={{ color: '#888', fontSize: '13px' }}>
              {settings?.bot_name} • {settings?.bot_username}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={refreshData}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: 'transparent',
                color: '#888',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              ↻ Refresh
            </button>
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #333',
                backgroundColor: 'transparent',
                color: '#888',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}>
          <StatCard label="Members" value={stats?.member_count || 0} />
          <StatCard label="Messages Today" value={stats?.today?.messages_received || 0} />
          <StatCard label="Sent Today" value={stats?.today?.messages_sent || 0} />
          <StatCard label="Active Users" value={stats?.today?.unique_users || 0} />
        </div>

        {/* Group Link */}
        {settings?.tg_group_link && (
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #222',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
              Telegram Group
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <a 
                href={settings.tg_group_link} 
                target="_blank"
                rel="noopener noreferrer"
                style={{ 
                  color: '#3B82F6', 
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                {settings.tg_group_link}
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(settings.tg_group_link)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #333',
                  backgroundColor: 'transparent',
                  color: '#666',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* No Group Warning */}
        {!settings?.tg_group_id && (
          <div style={{
            backgroundColor: '#1a1a0a',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #333300',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '14px', color: '#F59E0B', marginBottom: '8px' }}>
              ⚠️ No Telegram group linked
            </div>
            <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
              Create a TG group and add {settings?.bot_username} as admin to start receiving messages.
            </p>
            <a 
              href="/api/agent-service/create-group" 
              style={{ color: '#3B82F6', fontSize: '13px' }}
            >
              View setup instructions →
            </a>
          </div>
        )}

        {/* Send Test Message */}
        {settings?.tg_group_id && (
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #222',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
              Send Test Message
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #333',
                  backgroundColor: '#0a0a0a',
                  color: '#fff',
                  fontSize: '14px',
                }}
              />
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: sendingMessage ? '#333' : '#3B82F6',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: sendingMessage ? 'not-allowed' : 'pointer',
                }}
              >
                {sendingMessage ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Recent Messages */}
        <div style={{
          backgroundColor: '#111',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #222',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
            Recent Messages
          </div>
          {messages.length === 0 ? (
            <p style={{ color: '#666', fontSize: '13px' }}>
              No messages yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{
                  padding: '12px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '8px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#3B82F6' }}>
                      {msg.from}
                    </span>
                    <span style={{ fontSize: '11px', color: '#666' }}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#ccc' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Key */}
        <div style={{
          backgroundColor: '#111',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #222',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            API Integration
          </div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
            Your API Key
          </div>
          <div style={{
            padding: '12px',
            backgroundColor: '#0a0a0a',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '12px',
            color: '#22C55E',
            wordBreak: 'break-all',
            marginBottom: '16px',
          }}>
            {apiKey}
          </div>

          <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
            Example: Send a message
          </div>
          <pre style={{
            padding: '12px',
            backgroundColor: '#0a0a0a',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#888',
            overflow: 'auto',
          }}>
{`fetch('/api/agent-service/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey.slice(0, 20)}...'
  },
  body: JSON.stringify({
    message: 'Hello from my agent!'
  })
})`}
          </pre>
        </div>

        {/* Top Chatters */}
        {stats?.top_chatters?.length > 0 && (
          <div style={{
            backgroundColor: '#111',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #222',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>
              Top Chatters Today
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.top_chatters.map((chatter: any, i: number) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  backgroundColor: '#0a0a0a',
                  borderRadius: '6px',
                }}>
                  <span style={{ fontSize: '13px' }}>
                    {i + 1}. {chatter.username}
                  </span>
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    {chatter.messages} msgs
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{
      backgroundColor: '#111',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #222',
    }}>
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700 }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}

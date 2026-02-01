import { useState } from 'react';

interface TokenSubmitFormProps {
  isDark: boolean;
  colors: any;
}

export default function TokenSubmitForm({ isDark, colors }: TokenSubmitFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    token_address: '',
    token_name: '',
    symbol: '',
    description: '',
    twitter: '',
    telegram: '',
    website: '',
    image_url: '',
    contact_email: '',
    rush_processing: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!formData.token_address) {
      setError('Token address is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/submit-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setFormData({
          token_address: '',
          token_name: '',
          symbol: '',
          description: '',
          twitter: '',
          telegram: '',
          website: '',
          image_url: '',
          contact_email: '',
          rush_processing: false,
        });
      } else {
        setError(data.error || 'Failed to submit');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    color: colors.text,
    fontSize: '14px',
    outline: 'none',
    marginBottom: '12px',
  };

  const labelStyle = {
    fontSize: '12px',
    color: colors.textSecondary,
    marginBottom: '4px',
    display: 'block',
  };

  // Collapsed state - just show button
  if (!isOpen) {
    return (
      <div style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
          🚀 List Your Token (Coming Soon)
        </div>
        <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '12px' }}>
          Submit your token to be listed on agentscreener
        </div>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '50px',
            border: 'none',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Submit Your Token →
        </button>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div style={{
        background: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.1)',
        border: '1px solid rgba(34,197,94,0.3)',
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>✅</div>
        <div style={{ fontWeight: 600, color: '#22C55E', marginBottom: '8px' }}>
          Token Submitted!
        </div>
        <div style={{ fontSize: '13px', color: colors.textSecondary }}>
          We'll review your submission and add it soon.
        </div>
        <button
          onClick={() => { setSuccess(false); setIsOpen(false); }}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            borderRadius: '50px',
            border: 'none',
            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            color: colors.text,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>
    );
  }

  // Open form state
  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>🚀 List Your Token (Coming Soon)</div>
          <div style={{ fontSize: '12px', color: colors.textSecondary }}>
            Submit your token to be listed
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: colors.textSecondary,
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ×
        </button>
      </div>

      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px',
          padding: '10px',
          marginBottom: '12px',
          color: '#EF4444',
          fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      <label style={labelStyle}>Token Address *</label>
      <input
        type="text"
        placeholder="0x..."
        value={formData.token_address}
        onChange={(e) => setFormData({ ...formData, token_address: e.target.value })}
        style={inputStyle}
      />

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Token Name</label>
          <input
            type="text"
            placeholder="My Token"
            value={formData.token_name}
            onChange={(e) => setFormData({ ...formData, token_name: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Symbol</label>
          <input
            type="text"
            placeholder="MTK"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>

      <label style={labelStyle}>Description</label>
      <textarea
        placeholder="What does your token do?"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' } as any}
      />

      <label style={labelStyle}>Logo URL</label>
      <input
        type="text"
        placeholder="https://..."
        value={formData.image_url}
        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        style={inputStyle}
      />

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Twitter</label>
          <input
            type="text"
            placeholder="@handle"
            value={formData.twitter}
            onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Telegram</label>
          <input
            type="text"
            placeholder="t.me/..."
            value={formData.telegram}
            onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>

      <label style={labelStyle}>Website</label>
      <input
        type="text"
        placeholder="https://..."
        value={formData.website}
        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        style={inputStyle}
      />

      <label style={labelStyle}>Contact Email</label>
      <input
        type="email"
        placeholder="you@email.com"
        value={formData.contact_email}
        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
        style={inputStyle}
      />

      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        color: colors.text,
        cursor: 'pointer',
        marginBottom: '16px',
      }}>
        <input
          type="checkbox"
          checked={formData.rush_processing}
          onChange={(e) => setFormData({ ...formData, rush_processing: e.target.checked })}
          style={{ width: '16px', height: '16px' }}
        />
        ⚡ Rush Processing (priority review)
      </label>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '50px',
          border: 'none',
          background: submitting 
            ? colors.border 
            : 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 600,
          cursor: submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Token →'}
      </button>
    </div>
  );
}

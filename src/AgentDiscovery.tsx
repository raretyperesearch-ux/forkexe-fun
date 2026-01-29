import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  TrendingUp, 
  Sparkles, 
  Flame,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  CheckCircle2,
} from 'lucide-react';

// Mock data with trading metrics
const MOCK_AGENTS = [
  {
    id: '0x1a2b...3c4d',
    name: 'AIXBT',
    ticker: '$AIXBT',
    builder: 'rxbt',
    builderVerified: true,
    price: 0.847,
    priceChange24h: 24.5,
    priceChange1h: 3.2,
    marketCap: 89400000,
    volume24h: 12500000,
    liquidity: 4200000,
    holders: 18420,
    age: '67d',
    chain: 'Base',
    validation: 'TEE',
    reputation: 98.4,
    trending: true,
    avatar: '🤖',
    description: 'AI-powered crypto market intelligence'
  },
  {
    id: '0x5e6f...7g8h',
    name: 'Luna',
    ticker: '$LUNA',
    builder: 'virtuals',
    builderVerified: true,
    price: 0.0234,
    priceChange24h: -8.3,
    priceChange1h: -1.2,
    marketCap: 23400000,
    volume24h: 3200000,
    liquidity: 1800000,
    holders: 9823,
    age: '89d',
    chain: 'Base',
    validation: 'Crypto',
    reputation: 96.2,
    trending: true,
    avatar: '🌙',
    description: '24/7 AI livestreamer and virtual idol'
  },
  {
    id: '0x9i0j...1k2l',
    name: 'VADER',
    ticker: '$VADER',
    builder: 'vader_ai',
    builderVerified: true,
    price: 0.00567,
    priceChange24h: 156.7,
    priceChange1h: 42.3,
    marketCap: 5670000,
    volume24h: 8900000,
    liquidity: 890000,
    holders: 4521,
    age: '12d',
    chain: 'Base',
    validation: 'TEE',
    reputation: 91.8,
    trending: true,
    avatar: '😈',
    description: 'AI-managed trading DAO'
  },
  {
    id: '0x3m4n...5o6p',
    name: 'GAME',
    ticker: '$GAME',
    builder: 'virtuals',
    builderVerified: true,
    price: 0.0089,
    priceChange24h: -3.2,
    priceChange1h: 0.8,
    marketCap: 8900000,
    volume24h: 1200000,
    liquidity: 670000,
    holders: 6234,
    age: '95d',
    chain: 'Base',
    validation: 'Crypto',
    reputation: 94.7,
    trending: false,
    avatar: '🎮',
    description: 'Gaming AI framework token'
  },
  {
    id: '0x7q8r...9s0t',
    name: 'Sekoia',
    ticker: '$SEKOIA',
    builder: 'sekoia_labs',
    builderVerified: false,
    price: 0.00123,
    priceChange24h: 89.2,
    priceChange1h: 12.4,
    marketCap: 1230000,
    volume24h: 2100000,
    liquidity: 340000,
    holders: 2891,
    age: '3d',
    chain: 'Ethereum',
    validation: 'None',
    reputation: 72.3,
    trending: true,
    avatar: '🔮',
    description: 'Autonomous research agent'
  },
  {
    id: '0x1u2v...3w4x',
    name: 'Griffain',
    ticker: '$GRIFF',
    builder: 'griff_team',
    builderVerified: true,
    price: 0.456,
    priceChange24h: 12.8,
    priceChange1h: -2.1,
    marketCap: 45600000,
    volume24h: 5600000,
    liquidity: 2300000,
    holders: 11234,
    age: '34d',
    chain: 'Solana',
    validation: 'TEE',
    reputation: 95.1,
    trending: false,
    avatar: '🦅',
    description: 'Multi-chain DeFi agent'
  },
  {
    id: '0x5y6z...7a8b',
    name: 'Dolos',
    ticker: '$DOLOS',
    builder: 'dolos_ai',
    builderVerified: false,
    price: 0.000234,
    priceChange24h: 342.5,
    priceChange1h: 67.8,
    marketCap: 234000,
    volume24h: 890000,
    liquidity: 120000,
    holders: 1823,
    age: '1d',
    chain: 'Base',
    validation: 'None',
    reputation: 45.2,
    trending: true,
    avatar: '🎭',
    description: 'Narrative trading AI'
  },
  {
    id: '0x9c0d...1e2f',
    name: 'Neur',
    ticker: '$NEUR',
    builder: 'neur_protocol',
    builderVerified: true,
    price: 0.0678,
    priceChange24h: -15.4,
    priceChange1h: -4.2,
    marketCap: 6780000,
    volume24h: 980000,
    liquidity: 450000,
    holders: 5123,
    age: '45d',
    chain: 'Solana',
    validation: 'Crypto',
    reputation: 88.9,
    trending: false,
    avatar: '🧠',
    description: 'Neural network agent framework'
  },
];

const FEEDS = [
  { id: 'trending', label: '🔥 Trending', icon: Flame },
  { id: 'gainers', label: '📈 Top Gainers', icon: TrendingUp },
  { id: 'new', label: '🆕 New Pairs', icon: Sparkles },
  { id: 'volume', label: '💰 Volume', icon: BarChart3 },
];

const CHAINS = ['All Chains', 'Base', 'Ethereum', 'Solana'];

const formatNumber = (num: number): string => {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
};

const formatPrice = (price: number): string => {
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
};

function AgentRow({ agent, index }: { agent: typeof MOCK_AGENTS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const isPositive24h = agent.priceChange24h >= 0;
  const isPositive1h = agent.priceChange1h >= 0;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
    >
      {/* Rank + Name */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px', width: '24px' }}>#{index + 1}</span>
          <div style={{ fontSize: '24px' }}>{agent.avatar}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: 'white' }}>{agent.name}</span>
              <span style={{ color: '#6b7280', fontSize: '13px' }}>{agent.ticker}</span>
              {agent.trending && (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  padding: '2px 6px',
                  backgroundColor: 'rgba(255,69,0,0.2)',
                  color: '#FF4500',
                  fontSize: '10px',
                  borderRadius: '4px',
                  fontWeight: 600,
                }}>
                  <Flame size={10} /> HOT
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#6b7280' }}>
              <span>@{agent.builder}</span>
              {agent.builderVerified && <CheckCircle2 size={10} color="#FF4500" />}
              <span style={{ margin: '0 4px' }}>·</span>
              <span style={{ 
                padding: '1px 4px', 
                backgroundColor: agent.chain === 'Base' ? 'rgba(0,82,255,0.2)' : agent.chain === 'Solana' ? 'rgba(153,69,255,0.2)' : 'rgba(98,126,234,0.2)',
                color: agent.chain === 'Base' ? '#0052FF' : agent.chain === 'Solana' ? '#9945FF' : '#627EEA',
                borderRadius: '3px',
                fontSize: '10px',
              }}>
                {agent.chain}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: 'white', fontWeight: 500, fontFamily: 'monospace' }}>{formatPrice(agent.price)}</span>
      </td>

      {/* 1h Change */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          gap: '2px',
          color: isPositive1h ? '#22c55e' : '#ef4444',
          fontWeight: 500,
          fontSize: '14px',
        }}>
          {isPositive1h ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(agent.priceChange1h).toFixed(1)}%
        </div>
      </td>

      {/* 24h Change */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          gap: '2px',
          color: isPositive24h ? '#22c55e' : '#ef4444',
          fontWeight: 600,
          fontSize: '14px',
        }}>
          {isPositive24h ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(agent.priceChange24h).toFixed(1)}%
        </div>
      </td>

      {/* Market Cap */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: 'white', fontFamily: 'monospace' }}>{formatNumber(agent.marketCap)}</span>
      </td>

      {/* Volume */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{formatNumber(agent.volume24h)}</span>
      </td>

      {/* Liquidity */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{formatNumber(agent.liquidity)}</span>
      </td>

      {/* Holders */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: '#9ca3af' }}>{agent.holders.toLocaleString()}</span>
      </td>

      {/* Trust Score */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          {agent.validation !== 'None' && (
            <span style={{
              padding: '2px 6px',
              backgroundColor: 'rgba(34,197,94,0.15)',
              color: '#4ade80',
              fontSize: '10px',
              borderRadius: '4px',
              fontWeight: 500,
            }}>
              {agent.validation}
            </span>
          )}
          <span style={{ 
            color: agent.reputation >= 90 ? '#22c55e' : agent.reputation >= 70 ? '#eab308' : '#ef4444',
            fontWeight: 600,
          }}>
            {agent.reputation.toFixed(0)}
          </span>
        </div>
      </td>

      {/* Age */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: '#6b7280', fontSize: '13px' }}>{agent.age}</span>
      </td>

      {/* Actions */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button style={{
            padding: '6px 12px',
            backgroundColor: '#FF4500',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Trade
          </button>
          <button style={{
            padding: '6px 8px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#9ca3af',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Star size={14} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

export default function AgentDiscovery() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeed, setActiveFeed] = useState('trending');
  const [activeChain, setActiveChain] = useState('All Chains');

  const filteredAgents = MOCK_AGENTS.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.builder.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChain = activeChain === 'All Chains' || agent.chain === activeChain;
    return matchesSearch && matchesChain;
  }).sort((a, b) => {
    if (activeFeed === 'trending') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || b.volume24h - a.volume24h;
    if (activeFeed === 'gainers') return b.priceChange24h - a.priceChange24h;
    if (activeFeed === 'volume') return b.volume24h - a.volume24h;
    if (activeFeed === 'new') return parseInt(a.age) - parseInt(b.age);
    return 0;
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🍴</span>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: '18px', margin: 0, color: 'white' }}>Fork.exe</h1>
              <p style={{ fontSize: '11px', color: '#FF4500', margin: 0, fontWeight: 500 }}>AGENT SCREENER</p>
            </div>
          </div>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: '400px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="text"
                placeholder="Search by name, ticker, or builder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '10px 14px 10px 42px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '16px' }}>$847M</div>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Total MCap</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>$34.2M</div>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>24h Vol</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#FF4500', fontWeight: 700, fontSize: '16px' }}>1,247</div>
              <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase' }}>Agents</div>
            </div>
          </div>

          {/* Connect */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FF4500',
            border: 'none',
            color: 'white',
            fontWeight: 600,
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
          }}>
            Connect
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backgroundColor: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          {/* Feed Tabs */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {FEEDS.map((feed) => (
              <button
                key={feed.id}
                onClick={() => setActiveFeed(feed.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  fontWeight: 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  border: 'none',
                  backgroundColor: activeFeed === feed.id ? 'rgba(255,69,0,0.15)' : 'transparent',
                  color: activeFeed === feed.id ? '#FF4500' : '#9ca3af',
                  transition: 'all 0.2s',
                }}
              >
                {feed.label}
              </button>
            ))}
          </div>

          {/* Chain Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {CHAINS.map((chain) => (
              <button
                key={chain}
                onClick={() => setActiveChain(chain)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: activeChain === chain ? '1px solid rgba(255,69,0,0.5)' : '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: activeChain === chain ? 'rgba(255,255,255,0.05)' : 'transparent',
                  color: activeChain === chain ? 'white' : '#6b7280',
                  transition: 'all 0.2s',
                }}
              >
                {chain}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <main style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Agent</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>1h</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>24h</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>MCap</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Volume</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Liquidity</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Holders</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Trust</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Age</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent, index) => (
                <AgentRow key={agent.id} agent={agent} index={index} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Trust Score Legend */}
        <div style={{
          marginTop: '32px',
          padding: '16px 20px',
          backgroundColor: 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>Trust Score:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }}></span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>90+ Safe</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308' }}></span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>70-89 Caution</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>&lt;70 High Risk</span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ padding: '2px 6px', backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '10px', borderRadius: '4px' }}>TEE</span>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>= TEE Verified</span>
              <span style={{ padding: '2px 6px', backgroundColor: 'rgba(34,197,94,0.15)', color: '#4ade80', fontSize: '10px', borderRadius: '4px' }}>Crypto</span>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>= Cryptographic Proof</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ color: '#6b7280', fontSize: '13px' }}>
            Powered by{' '}
            <a href="https://8004.org" target="_blank" rel="noopener noreferrer" style={{ color: '#FF4500', textDecoration: 'none', fontWeight: 500 }}>
              ERC-8004
            </a>
            {' '}· On-chain agent registry
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="#" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none' }}>API</a>
            <a href="#" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none' }}>Docs</a>
            <a href="https://forkexe.com" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', fontSize: '13px', textDecoration: 'none' }}>
              For Builders →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

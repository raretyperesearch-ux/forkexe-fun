import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  Copy,
  ExternalLink,
  Globe,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

// Mock data with trading metrics
const MOCK_AGENTS = [
  {
    id: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
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
    description: 'AI-powered crypto market intelligence agent. Analyzes 400+ KOLs and provides real-time trading signals.',
    website: 'https://aixbt.io',
    twitter: 'aixbt_agent',
    telegram: 'aixbt_community',
    priceHistory: [0.65, 0.72, 0.68, 0.75, 0.82, 0.79, 0.85, 0.91, 0.84, 0.847],
  },
  {
    id: '0x5e6f7890abcdef1234567890abcdef1234567890',
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
    description: '24/7 AI livestreamer and virtual idol. First autonomous AI entertainer on Virtuals Protocol.',
    website: 'https://luna.virtuals.io',
    twitter: 'luna_virtuals',
    telegram: 'luna_fans',
    priceHistory: [0.028, 0.031, 0.029, 0.027, 0.025, 0.026, 0.024, 0.023, 0.024, 0.0234],
  },
  {
    id: '0x9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7890',
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
    description: 'AI-managed trading DAO. Community-governed investment strategies powered by autonomous agents.',
    website: 'https://vader.ai',
    twitter: 'vader_ai',
    telegram: 'vader_dao',
    priceHistory: [0.002, 0.0025, 0.003, 0.0028, 0.0035, 0.004, 0.0045, 0.005, 0.0055, 0.00567],
  },
  {
    id: '0x3m4n5o6p7q8r9s0t1u2v3w4x5y6z7890abcdef12',
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
    description: 'Gaming AI framework token. Powers autonomous game NPCs and interactive experiences.',
    website: 'https://game.virtuals.io',
    twitter: 'game_virtuals',
    telegram: 'game_community',
    priceHistory: [0.0095, 0.0092, 0.0094, 0.0091, 0.009, 0.0088, 0.0087, 0.0089, 0.009, 0.0089],
  },
  {
    id: '0x7q8r9s0t1u2v3w4x5y6z7890abcdef1234567890',
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
    description: 'Autonomous research agent. Synthesizes academic papers and provides actionable insights.',
    website: 'https://sekoia.ai',
    twitter: 'sekoia_ai',
    telegram: '',
    priceHistory: [0.0005, 0.0006, 0.0007, 0.0008, 0.0009, 0.001, 0.0011, 0.00115, 0.0012, 0.00123],
  },
  {
    id: '0x1u2v3w4x5y6z7890abcdef1234567890abcdef12',
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
    description: 'Multi-chain DeFi agent. Automates yield farming, bridging, and portfolio rebalancing.',
    website: 'https://griffain.io',
    twitter: 'griffain_ai',
    telegram: 'griffain_defi',
    priceHistory: [0.38, 0.4, 0.42, 0.41, 0.43, 0.45, 0.44, 0.46, 0.45, 0.456],
  },
  {
    id: '0x5y6z7890abcdef1234567890abcdef1234567890',
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
    description: 'Narrative trading AI. Identifies emerging narratives and memes before they trend.',
    website: '',
    twitter: 'dolos_ai',
    telegram: 'dolos_alpha',
    priceHistory: [0.00005, 0.00008, 0.0001, 0.00012, 0.00015, 0.00018, 0.0002, 0.00022, 0.00023, 0.000234],
  },
  {
    id: '0x9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7890',
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
    description: 'Neural network agent framework. Build and deploy custom AI agents on Solana.',
    website: 'https://neur.sh',
    twitter: 'neur_protocol',
    telegram: 'neur_devs',
    priceHistory: [0.085, 0.082, 0.08, 0.078, 0.075, 0.072, 0.07, 0.068, 0.067, 0.0678],
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

const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Mini sparkline component
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 60;
  const height = 24;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Agent Detail Drawer
function AgentDrawer({ agent, onClose }: { agent: typeof MOCK_AGENTS[0] | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  if (!agent) return null;

  const copyAddress = () => {
    navigator.clipboard.writeText(agent.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPositive = agent.priceChange24h >= 0;

  // Chart dimensions
  const chartWidth = 320;
  const chartHeight = 120;
  const min = Math.min(...agent.priceHistory);
  const max = Math.max(...agent.priceHistory);
  const range = max - min || 1;
  
  const chartPoints = agent.priceHistory.map((val, i) => {
    const x = (i / (agent.priceHistory.length - 1)) * chartWidth;
    const y = chartHeight - ((val - min) / range) * (chartHeight - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${chartHeight} ${chartPoints} ${chartWidth},${chartHeight}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 100,
        }}
      />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '400px',
          maxWidth: '100vw',
          backgroundColor: '#0f0f0f',
          borderLeft: '1px solid rgba(255,255,255,0.1)',
          zIndex: 101,
          overflow: 'auto',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '40px' }}>{agent.avatar}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 700, fontSize: '20px', color: 'white' }}>{agent.name}</span>
                <span style={{ color: '#6b7280', fontSize: '14px' }}>{agent.ticker}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#9ca3af' }}>
                <span>@{agent.builder}</span>
                {agent.builderVerified && <CheckCircle2 size={12} color="#FF4500" />}
                <span style={{ 
                  padding: '2px 6px', 
                  backgroundColor: agent.chain === 'Base' ? 'rgba(0,82,255,0.2)' : agent.chain === 'Solana' ? 'rgba(153,69,255,0.2)' : 'rgba(98,126,234,0.2)',
                  color: agent.chain === 'Base' ? '#0052FF' : agent.chain === 'Solana' ? '#9945FF' : '#627EEA',
                  borderRadius: '4px',
                  fontSize: '11px',
                  marginLeft: '4px',
                }}>
                  {agent.chain}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: '#9ca3af',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Price + Chart */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '32px', fontWeight: 700, color: 'white', fontFamily: 'monospace' }}>
              {formatPrice(agent.price)}
            </span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: isPositive ? '#22c55e' : '#ef4444',
              fontSize: '16px',
              fontWeight: 600,
            }}>
              {isPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
              {Math.abs(agent.priceChange24h).toFixed(1)}%
            </span>
          </div>

          {/* Chart */}
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            borderRadius: '12px',
            padding: '16px',
          }}>
            <svg width={chartWidth} height={chartHeight} style={{ display: 'block', width: '100%' }}>
              <defs>
                <linearGradient id={`gradient-${agent.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon
                points={areaPoints}
                fill={`url(#gradient-${agent.id})`}
              />
              <polyline
                points={chartPoints}
                fill="none"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>7d ago</span>
              <span style={{ fontSize: '11px', color: '#6b7280' }}>Now</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            {[
              { label: 'Market Cap', value: formatNumber(agent.marketCap) },
              { label: 'Volume 24h', value: formatNumber(agent.volume24h) },
              { label: 'Liquidity', value: formatNumber(agent.liquidity) },
              { label: 'Holders', value: agent.holders.toLocaleString() },
            ].map((stat) => (
              <div key={stat.label} style={{
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '10px',
                padding: '12px',
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{stat.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'white', fontFamily: 'monospace' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Score */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 500 }}>Trust Score</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: agent.reputation >= 90 ? 'rgba(34,197,94,0.15)' : agent.reputation >= 70 ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${agent.reputation >= 90 ? '#22c55e' : agent.reputation >= 70 ? '#eab308' : '#ef4444'}`,
            }}>
              <span style={{
                fontSize: '20px',
                fontWeight: 700,
                color: agent.reputation >= 90 ? '#22c55e' : agent.reputation >= 70 ? '#eab308' : '#ef4444',
              }}>
                {agent.reputation.toFixed(0)}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              {agent.validation !== 'None' && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  backgroundColor: 'rgba(34,197,94,0.1)',
                  borderRadius: '6px',
                  marginBottom: '8px',
                }}>
                  <ShieldCheck size={14} color="#4ade80" />
                  <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 500 }}>
                    {agent.validation === 'TEE' ? 'TEE Verified' : 'Cryptographic Proof'}
                  </span>
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {agent.reputation >= 90 ? 'High trust - verified and reliable' : 
                 agent.reputation >= 70 ? 'Moderate trust - proceed with caution' : 
                 'Low trust - high risk'}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 500 }}>About</div>
          <p style={{ fontSize: '14px', color: '#d1d5db', lineHeight: 1.6, margin: 0 }}>
            {agent.description}
          </p>
        </div>

        {/* Contract */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 500 }}>Contract</div>
          <button
            onClick={copyAddress}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '13px', flex: 1, textAlign: 'left' }}>
              {truncateAddress(agent.id)}
            </span>
            {copied ? (
              <CheckCircle2 size={16} color="#22c55e" />
            ) : (
              <Copy size={16} color="#6b7280" />
            )}
          </button>
        </div>

        {/* Links */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px', textTransform: 'uppercase', fontWeight: 500 }}>Links</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {agent.website && (
              <a href={agent.website} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '13px',
              }}>
                <Globe size={14} />
                Website
              </a>
            )}
            {agent.twitter && (
              <a href={`https://twitter.com/${agent.twitter}`} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '13px',
              }}>
                <span style={{ fontWeight: 700 }}>𝕏</span>
                Twitter
              </a>
            )}
            {agent.telegram && (
              <a href={`https://t.me/${agent.telegram}`} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#9ca3af',
                textDecoration: 'none',
                fontSize: '13px',
              }}>
                <MessageCircle size={14} />
                Telegram
              </a>
            )}
          </div>
        </div>

        {/* Trade Button */}
        <div style={{ padding: '20px' }}>
          <button style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#FF4500',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}>
            Trade on {agent.chain === 'Solana' ? 'Raydium' : 'Uniswap'}
            <ExternalLink size={16} />
          </button>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              color: '#9ca3af',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
              DexScreener
            </button>
            <button style={{
              flex: 1,
              padding: '10px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              color: '#9ca3af',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
              Etherscan
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function AgentRow({ agent, index, onClick }: { agent: typeof MOCK_AGENTS[0]; index: number; onClick: () => void }) {
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
      onClick={onClick}
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

      {/* Chart */}
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Sparkline data={agent.priceHistory} positive={isPositive24h} />
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
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#FF4500',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Trade
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            style={{
              padding: '6px 8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: '#9ca3af',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
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
  const [selectedAgent, setSelectedAgent] = useState<typeof MOCK_AGENTS[0] | null>(null);

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
      {/* Agent Detail Drawer */}
      {selectedAgent && (
        <AgentDrawer agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}

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
                <th style={{ padding: '12px', textAlign: 'left', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>7d</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>1h</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>24h</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>MCap</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Volume</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Liquidity</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Trust</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}>Age</th>
                <th style={{ padding: '12px', textAlign: 'right', color: '#6b7280', fontSize: '12px', fontWeight: 500, textTransform: 'uppercase' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent, index) => (
                <AgentRow 
                  key={agent.id} 
                  agent={agent} 
                  index={index} 
                  onClick={() => setSelectedAgent(agent)}
                />
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

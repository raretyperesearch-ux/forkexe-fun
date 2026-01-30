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
  ArrowLeft,
  Copy,
  Globe,
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
    priceChange5m: 0.73,
    priceChange1h: 3.2,
    priceChange6h: 12.4,
    priceChange24h: 24.5,
    marketCap: 89400000,
    fdv: 94000000,
    volume24h: 12500000,
    liquidity: 4200000,
    holders: 18420,
    txns24h: 24521,
    buys24h: 13201,
    sells24h: 11320,
    buyVolume: 7200000,
    sellVolume: 5300000,
    makers: 892,
    buyers: 521,
    sellers: 371,
    age: '67d',
    chain: 'Base',
    dex: 'Uniswap',
    validation: 'TEE',
    reputation: 98.4,
    trending: true,
    avatar: '🤖',
    description: 'AI-powered crypto market intelligence agent.',
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
    priceChange5m: -0.32,
    priceChange1h: -1.2,
    priceChange6h: -4.5,
    priceChange24h: -8.3,
    marketCap: 23400000,
    fdv: 25000000,
    volume24h: 3200000,
    liquidity: 1800000,
    holders: 9823,
    txns24h: 8924,
    buys24h: 4102,
    sells24h: 4822,
    buyVolume: 1400000,
    sellVolume: 1800000,
    makers: 423,
    buyers: 198,
    sellers: 225,
    age: '89d',
    chain: 'Base',
    dex: 'Uniswap',
    validation: 'Crypto',
    reputation: 96.2,
    trending: true,
    avatar: '🌙',
    description: '24/7 AI livestreamer and virtual idol.',
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
    priceChange5m: 4.2,
    priceChange1h: 42.3,
    priceChange6h: 89.2,
    priceChange24h: 156.7,
    marketCap: 5670000,
    fdv: 5670000,
    volume24h: 8900000,
    liquidity: 890000,
    holders: 4521,
    txns24h: 18234,
    buys24h: 11234,
    sells24h: 7000,
    buyVolume: 5800000,
    sellVolume: 3100000,
    makers: 1823,
    buyers: 1102,
    sellers: 721,
    age: '12d',
    chain: 'Base',
    dex: 'Uniswap',
    validation: 'TEE',
    reputation: 91.8,
    trending: true,
    avatar: '😈',
    description: 'AI-managed trading DAO.',
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
    priceChange5m: 0.1,
    priceChange1h: 0.8,
    priceChange6h: -1.2,
    priceChange24h: -3.2,
    marketCap: 8900000,
    fdv: 8900000,
    volume24h: 1200000,
    liquidity: 670000,
    holders: 6234,
    txns24h: 3421,
    buys24h: 1654,
    sells24h: 1767,
    buyVolume: 580000,
    sellVolume: 620000,
    makers: 312,
    buyers: 145,
    sellers: 167,
    age: '95d',
    chain: 'Base',
    dex: 'Uniswap',
    validation: 'Crypto',
    reputation: 94.7,
    trending: false,
    avatar: '🎮',
    description: 'Gaming AI framework token.',
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
    priceChange5m: 2.1,
    priceChange1h: 12.4,
    priceChange6h: 45.2,
    priceChange24h: 89.2,
    marketCap: 1230000,
    fdv: 1230000,
    volume24h: 2100000,
    liquidity: 340000,
    holders: 2891,
    txns24h: 12453,
    buys24h: 7823,
    sells24h: 4630,
    buyVolume: 1400000,
    sellVolume: 700000,
    makers: 2341,
    buyers: 1521,
    sellers: 820,
    age: '3d',
    chain: 'Ethereum',
    dex: 'Uniswap',
    validation: 'None',
    reputation: 72.3,
    trending: true,
    avatar: '🔮',
    description: 'Autonomous research agent.',
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
    priceChange5m: -0.5,
    priceChange1h: -2.1,
    priceChange6h: 5.4,
    priceChange24h: 12.8,
    marketCap: 45600000,
    fdv: 50000000,
    volume24h: 5600000,
    liquidity: 2300000,
    holders: 11234,
    txns24h: 9823,
    buys24h: 5234,
    sells24h: 4589,
    buyVolume: 3100000,
    sellVolume: 2500000,
    makers: 654,
    buyers: 354,
    sellers: 300,
    age: '34d',
    chain: 'Solana',
    dex: 'Raydium',
    validation: 'TEE',
    reputation: 95.1,
    trending: false,
    avatar: '🦅',
    description: 'Multi-chain DeFi agent.',
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
    priceChange5m: 12.3,
    priceChange1h: 67.8,
    priceChange6h: 156.2,
    priceChange24h: 342.5,
    marketCap: 234000,
    fdv: 234000,
    volume24h: 890000,
    liquidity: 120000,
    holders: 1823,
    txns24h: 8923,
    buys24h: 6234,
    sells24h: 2689,
    buyVolume: 670000,
    sellVolume: 220000,
    makers: 1523,
    buyers: 1102,
    sellers: 421,
    age: '1d',
    chain: 'Base',
    dex: 'Uniswap',
    validation: 'None',
    reputation: 45.2,
    trending: true,
    avatar: '🎭',
    description: 'Narrative trading AI.',
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
    priceChange5m: -1.2,
    priceChange1h: -4.2,
    priceChange6h: -8.9,
    priceChange24h: -15.4,
    marketCap: 6780000,
    fdv: 6780000,
    volume24h: 980000,
    liquidity: 450000,
    holders: 5123,
    txns24h: 2341,
    buys24h: 987,
    sells24h: 1354,
    buyVolume: 380000,
    sellVolume: 600000,
    makers: 234,
    buyers: 98,
    sellers: 136,
    age: '45d',
    chain: 'Solana',
    dex: 'Raydium',
    validation: 'Crypto',
    reputation: 88.9,
    trending: false,
    avatar: '🧠',
    description: 'Neural network agent framework.',
    website: 'https://neur.sh',
    twitter: 'neur_protocol',
    telegram: 'neur_devs',
    priceHistory: [0.085, 0.082, 0.08, 0.078, 0.075, 0.072, 0.07, 0.068, 0.067, 0.0678],
  },
];

// Mock transactions
const generateMockTransactions = (agent: typeof MOCK_AGENTS[0]) => {
  const transactions = [];
  for (let i = 0; i < 20; i++) {
    const isBuy = Math.random() > 0.45;
    const usdAmount = Math.random() * 5000 + 100;
    transactions.push({
      id: i,
      type: isBuy ? 'Buy' : 'Sell',
      usd: usdAmount,
      tokens: usdAmount / agent.price,
      price: agent.price * (1 + (Math.random() - 0.5) * 0.01),
      maker: `${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      time: `${Math.floor(Math.random() * 59) + 1}s ago`,
    });
  }
  return transactions;
};

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

const formatCompact = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
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

// ========== AGENT DETAIL PAGE ==========
function AgentPage({ agent, onBack, allAgents, onSelectAgent }: { agent: typeof MOCK_AGENTS[0]; onBack: () => void; allAgents: typeof MOCK_AGENTS; onSelectAgent: (agent: typeof MOCK_AGENTS[0]) => void }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const transactions = generateMockTransactions(agent);

  const copyAddress = () => {
    navigator.clipboard.writeText(agent.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const PriceChange = ({ value, label }: { value: number; label: string }) => {
    const isPositive = value >= 0;
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
        <div style={{ 
          color: isPositive ? '#22c55e' : '#ef4444', 
          fontWeight: 600, 
          fontSize: '14px' 
        }}>
          {isPositive ? '+' : ''}{value.toFixed(2)}%
        </div>
      </div>
    );
  };

  // Mini trending banner for detail page
  const TrendingMini = () => {
    const trendingAgents = allAgents.filter(a => a.trending && a.id !== agent.id).slice(0, 5);
    return (
      <div style={{
        backgroundColor: '#000',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        overflow: 'auto',
      }}>
        {trendingAgents.map((a, index) => {
          const isPositive = a.priceChange24h >= 0;
          return (
            <button
              key={a.id}
              onClick={() => onSelectAgent(a)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '11px', fontWeight: 600 }}>#{index + 1}</span>
              <span style={{ fontSize: '14px' }}>{a.avatar}</span>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '12px' }}>{a.name}</span>
              <span style={{ 
                color: isPositive ? '#22c55e' : '#ef4444',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {isPositive ? '↑' : '↓'}{Math.abs(a.priceChange24h).toFixed(0)}%
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Trending Mini Banner */}
      <TrendingMini />
      {/* Top Bar */}
      <header style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        backgroundColor: '#0a0a0a',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '8px 12px',
            borderRadius: '6px',
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>{agent.avatar}</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>{agent.ticker}</span>
              <span style={{ color: '#6b7280' }}>/</span>
              <span style={{ color: '#6b7280' }}>{agent.chain === 'Solana' ? 'SOL' : 'ETH'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
              <span style={{ 
                padding: '2px 6px', 
                backgroundColor: agent.chain === 'Base' ? 'rgba(0,82,255,0.2)' : agent.chain === 'Solana' ? 'rgba(153,69,255,0.2)' : 'rgba(98,126,234,0.2)',
                color: agent.chain === 'Base' ? '#0052FF' : agent.chain === 'Solana' ? '#9945FF' : '#627EEA',
                borderRadius: '4px',
              }}>
                {agent.chain}
              </span>
              <span>·</span>
              <span>{agent.dex}</span>
            </div>
          </div>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {agent.website && (
            <a href={agent.website} target="_blank" rel="noopener noreferrer" style={{
              padding: '6px 10px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '6px',
              color: '#9ca3af',
              textDecoration: 'none',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <Globe size={14} /> Website
            </a>
          )}
          {agent.twitter && (
            <a href={`https://twitter.com/${agent.twitter}`} target="_blank" rel="noopener noreferrer" style={{
              padding: '6px 10px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '6px',
              color: '#9ca3af',
              textDecoration: 'none',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              𝕏 Twitter
            </a>
          )}
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#FF4500',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '13px',
          }}>
            Trade
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 90px)' }}>
        {/* Left: Chart Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Chart */}
          <div style={{ flex: 1, backgroundColor: '#0d0d0d', position: 'relative' }}>
            {/* Time intervals */}
            <div style={{ 
              position: 'absolute', 
              top: '12px', 
              left: '12px', 
              display: 'flex', 
              gap: '4px',
              zIndex: 10,
            }}>
              {['1m', '5m', '15m', '1h', '4h', '1D'].map((interval) => (
                <button key={interval} style={{
                  padding: '4px 8px',
                  backgroundColor: interval === '5m' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px',
                  color: interval === '5m' ? 'white' : '#6b7280',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}>
                  {interval}
                </button>
              ))}
            </div>

            {/* Mock Chart */}
            <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none" style={{ padding: '50px 20px 40px' }}>
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line key={i} x1="0" y1={i * 80} x2="800" y2={i * 80} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}
              
              {/* Candlesticks */}
              {agent.priceHistory.map((price, i) => {
                const x = (i / (agent.priceHistory.length - 1)) * 760 + 20;
                const prevPrice = agent.priceHistory[i - 1] || price;
                const isGreen = price >= prevPrice;
                const high = Math.max(price, prevPrice) * 1.02;
                const low = Math.min(price, prevPrice) * 0.98;
                const open = prevPrice;
                const close = price;
                
                const scaleY = (p: number) => 320 - ((p - Math.min(...agent.priceHistory) * 0.95) / (Math.max(...agent.priceHistory) * 1.05 - Math.min(...agent.priceHistory) * 0.95)) * 280;
                
                return (
                  <g key={i}>
                    <line 
                      x1={x} y1={scaleY(high)} 
                      x2={x} y2={scaleY(low)} 
                      stroke={isGreen ? '#22c55e' : '#ef4444'} 
                      strokeWidth="1" 
                    />
                    <rect 
                      x={x - 15} 
                      y={scaleY(Math.max(open, close))} 
                      width="30" 
                      height={Math.abs(scaleY(open) - scaleY(close)) || 2} 
                      fill={isGreen ? '#22c55e' : '#ef4444'} 
                    />
                  </g>
                );
              })}
            </svg>

            {/* Current price overlay */}
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              backgroundColor: agent.priceChange24h >= 0 ? '#22c55e' : '#ef4444',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
            }}>
              {formatPrice(agent.price)}
            </div>
          </div>

          {/* Bottom Tabs */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { id: 'transactions', label: 'Transactions' },
                { id: 'topTraders', label: 'Top Traders' },
                { id: 'holders', label: `Holders (${formatCompact(agent.holders)})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #FF4500' : '2px solid transparent',
                    color: activeTab === tab.id ? 'white' : '#6b7280',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Transactions Table */}
            <div style={{ height: '200px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>TIME</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#6b7280', fontWeight: 500 }}>TYPE</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#6b7280', fontWeight: 500 }}>USD</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#6b7280', fontWeight: 500 }}>{agent.ticker.replace('$', '')}</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#6b7280', fontWeight: 500 }}>PRICE</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#6b7280', fontWeight: 500 }}>MAKER</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '8px 12px', color: '#6b7280' }}>{tx.time}</td>
                      <td style={{ padding: '8px 12px', color: tx.type === 'Buy' ? '#22c55e' : '#ef4444', fontWeight: 500 }}>{tx.type}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: 'white' }}>${tx.usd.toFixed(2)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#9ca3af' }}>{formatCompact(tx.tokens)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#9ca3af' }}>{formatPrice(tx.price)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                        <span style={{ color: '#FF4500', cursor: 'pointer' }}>{tx.maker}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div style={{ width: '320px', overflow: 'auto', backgroundColor: '#0d0d0d' }}>
          {/* Token Info */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '48px' }}>{agent.avatar}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '18px' }}>{agent.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280' }}>
                  <span>@{agent.builder}</span>
                  {agent.builderVerified && <CheckCircle2 size={12} color="#FF4500" />}
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            {agent.validation !== 'None' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(34,197,94,0.1)',
                borderRadius: '8px',
                marginBottom: '12px',
              }}>
                <ShieldCheck size={16} color="#4ade80" />
                <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 500 }}>
                  {agent.validation === 'TEE' ? 'TEE Verified' : 'Cryptographic Proof'}
                </span>
                <span style={{ 
                  marginLeft: 'auto',
                  backgroundColor: 'rgba(34,197,94,0.2)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#4ade80',
                }}>
                  {agent.reputation.toFixed(0)}
                </span>
              </div>
            )}

            {/* Contract */}
            <button
              onClick={copyAddress}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <span style={{ color: '#6b7280', fontSize: '12px' }}>CA:</span>
              <span style={{ color: '#9ca3af', fontFamily: 'monospace', fontSize: '12px', flex: 1, textAlign: 'left' }}>
                {truncateAddress(agent.id)}
              </span>
              {copied ? <CheckCircle2 size={14} color="#22c55e" /> : <Copy size={14} color="#6b7280" />}
            </button>
          </div>

          {/* Price */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>PRICE USD</div>
                <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace' }}>{formatPrice(agent.price)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>PRICE {agent.chain === 'Solana' ? 'SOL' : 'ETH'}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'monospace', color: '#9ca3af' }}>
                  {(agent.price / (agent.chain === 'Solana' ? 100 : 2500)).toFixed(8)}
                </div>
              </div>
            </div>
          </div>

          {/* Liquidity / FDV / MCap */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>LIQUIDITY</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatNumber(agent.liquidity)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>FDV</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatNumber(agent.fdv)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>MKT CAP</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatNumber(agent.marketCap)}</div>
              </div>
            </div>
          </div>

          {/* Price Changes */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
              <PriceChange value={agent.priceChange5m} label="5M" />
              <PriceChange value={agent.priceChange1h} label="1H" />
              <PriceChange value={agent.priceChange6h} label="6H" />
              <PriceChange value={agent.priceChange24h} label="24H" />
            </div>
          </div>

          {/* Txns */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>TXNS</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatCompact(agent.txns24h)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>BUYS</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e' }}>{formatCompact(agent.buys24h)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>SELLS</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444' }}>{formatCompact(agent.sells24h)}</div>
              </div>
            </div>
            {/* Buy/Sell Bar */}
            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(agent.buys24h / agent.txns24h) * 100}%`, 
                backgroundColor: '#22c55e' 
              }} />
              <div style={{ 
                width: `${(agent.sells24h / agent.txns24h) * 100}%`, 
                backgroundColor: '#ef4444' 
              }} />
            </div>
          </div>

          {/* Volume */}
          <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>VOLUME</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatNumber(agent.volume24h)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>BUY VOL</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e' }}>{formatNumber(agent.buyVolume)}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>SELL VOL</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444' }}>{formatNumber(agent.sellVolume)}</div>
              </div>
            </div>
            {/* Volume Bar */}
            <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${(agent.buyVolume / agent.volume24h) * 100}%`, 
                backgroundColor: '#22c55e' 
              }} />
              <div style={{ 
                width: `${(agent.sellVolume / agent.volume24h) * 100}%`, 
                backgroundColor: '#ef4444' 
              }} />
            </div>
          </div>

          {/* Makers */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>MAKERS</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{agent.makers}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>BUYERS</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e' }}>{agent.buyers}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>SELLERS</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444' }}>{agent.sellers}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== MAIN LIST PAGE ==========
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
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: 'white', fontWeight: 500, fontFamily: 'monospace' }}>{formatPrice(agent.price)}</span>
      </td>
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Sparkline data={agent.priceHistory} positive={isPositive24h} />
      </td>
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
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: 'white', fontFamily: 'monospace' }}>{formatNumber(agent.marketCap)}</span>
      </td>
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{formatNumber(agent.volume24h)}</span>
      </td>
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{formatNumber(agent.liquidity)}</span>
      </td>
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
      <td style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
        <span style={{ color: '#6b7280', fontSize: '13px' }}>{agent.age}</span>
      </td>
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

// Trending Banner Component
function TrendingBanner({ agents, onSelect }: { agents: typeof MOCK_AGENTS; onSelect: (agent: typeof MOCK_AGENTS[0]) => void }) {
  const trendingAgents = agents.filter(a => a.trending).slice(0, 6);
  
  return (
    <div style={{
      backgroundColor: '#000',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '8px 0',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        maxWidth: '1600px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        {trendingAgents.map((agent, index) => {
          const isPositive = agent.priceChange24h >= 0;
          return (
            <button
              key={agent.id}
              onClick={() => onSelect(agent)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <span style={{ 
                color: '#6b7280', 
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.1)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}>
                #{index + 1}
              </span>
              <span style={{ fontSize: '18px' }}>{agent.avatar}</span>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>{agent.name}</span>
              <span style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 6px',
                backgroundColor: isPositive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                color: isPositive ? '#22c55e' : '#ef4444',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '4px',
              }}>
                {isPositive ? '↑' : '↓'}{Math.abs(agent.priceChange24h).toFixed(1)}%
              </span>
              <span style={{ color: '#6b7280', fontSize: '11px' }}>{formatNumber(agent.marketCap)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AgentList({ onSelectAgent }: { onSelectAgent: (agent: typeof MOCK_AGENTS[0]) => void }) {
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
      {/* Trending Banner */}
      <TrendingBanner agents={MOCK_AGENTS} onSelect={onSelectAgent} />

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🍴</span>
            <div>
              <h1 style={{ fontWeight: 700, fontSize: '18px', margin: 0, color: 'white' }}>Fork.exe</h1>
              <p style={{ fontSize: '11px', color: '#FF4500', margin: 0, fontWeight: 500 }}>AGENT SCREENER</p>
            </div>
          </div>

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

      {/* Filters */}
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

      {/* Table */}
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
                  onClick={() => onSelectAgent(agent)}
                />
              ))}
            </tbody>
          </table>
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

// ========== MAIN APP ==========
export default function AgentDiscovery() {
  const [selectedAgent, setSelectedAgent] = useState<typeof MOCK_AGENTS[0] | null>(null);

  if (selectedAgent) {
    return (
      <AgentPage 
        agent={selectedAgent} 
        onBack={() => setSelectedAgent(null)} 
        allAgents={MOCK_AGENTS}
        onSelectAgent={setSelectedAgent}
      />
    );
  }

  return <AgentList onSelectAgent={setSelectedAgent} />;
}

import { useState } from 'react';
import { 
  Search, 
  Star,
  ChevronDown,
  Copy,
  ExternalLink,
  Bell,
  Filter,
  Settings,
  TrendingUp,
  Flame,
  Rocket,
  Clock,
  Users,
  Zap,
  Globe,
} from 'lucide-react';

// Chain icons as simple colored circles with letters
const CHAINS = [
  { id: 'solana', name: 'Solana', color: '#9945FF', letter: 'S' },
  { id: 'ethereum', name: 'Ethereum', color: '#627EEA', letter: 'E' },
  { id: 'base', name: 'Base', color: '#0052FF', letter: 'B' },
  { id: 'bsc', name: 'BSC', color: '#F0B90B', letter: 'B' },
  { id: 'arbitrum', name: 'Arbitrum', color: '#28A0F0', letter: 'A' },
  { id: 'polygon', name: 'Polygon', color: '#8247E5', letter: 'P' },
  { id: 'avalanche', name: 'Avalanche', color: '#E84142', letter: 'A' },
  { id: 'optimism', name: 'Optimism', color: '#FF0420', letter: 'O' },
];

// Mock agent data
const MOCK_AGENTS = [
  {
    id: '0x1a2b3c',
    name: 'CANCER',
    ticker: 'CANCER',
    fullName: 'Dr. Mariano Barbacid',
    price: 0.001726,
    age: '2h',
    txns: 62143,
    volume: 5300000,
    makers: 10025,
    change5m: 11.33,
    change1h: 73.12,
    change6h: 129,
    change24h: 3249,
    liquidity: 139000,
    mcap: 1700000,
    chain: 'solana',
    boosted: 400,
    avatar: '🦀',
    image: '',
    website: 'https://cancer.io',
    twitter: 'cancer_token',
    description: 'A moonshot for cancer research funding',
    priceNative: 0.00001366,
    fdv: 1600000,
    buys24h: 34088,
    sells24h: 28078,
    buyVolume: 3200000,
    sellVolume: 2100000,
    buyers: 9273,
    sellers: 7445,
    pooledToken: 575.56,
    pooledNative: 67000,
  },
  {
    id: '0x2b3c4d',
    name: 'Win',
    ticker: 'WIN',
    fullName: "You're only one win away",
    price: 0.00009184,
    age: '2h',
    txns: 46204,
    volume: 4600000,
    makers: 6821,
    change5m: 4.37,
    change1h: -44.83,
    change6h: 1758,
    change24h: 1758,
    liquidity: 97000,
    mcap: 900000,
    chain: 'solana',
    boosted: 100,
    avatar: '🏆',
    image: '',
    website: '',
    twitter: 'win_token',
    description: 'Win big or go home',
    priceNative: 0.0000045,
    fdv: 900000,
    buys24h: 28000,
    sells24h: 18204,
    buyVolume: 2800000,
    sellVolume: 1800000,
    buyers: 4500,
    sellers: 2321,
    pooledToken: 450,
    pooledNative: 52000,
  },
  {
    id: '0x3c4d5e',
    name: 'ELON',
    ticker: 'ELON',
    fullName: 'Elon Coin',
    price: 0.005672,
    age: '1h',
    txns: 27864,
    volume: 8100000,
    makers: 10176,
    change5m: 11.37,
    change1h: 4.84,
    change6h: 13420,
    change24h: 13420,
    liquidity: 276000,
    mcap: 7000000,
    chain: 'solana',
    boosted: 0,
    avatar: '🚀',
    image: '',
    website: 'https://eloncoin.io',
    twitter: 'elon_coin',
    description: 'To Mars and beyond',
    priceNative: 0.000028,
    fdv: 7000000,
    buys24h: 18000,
    sells24h: 9864,
    buyVolume: 5500000,
    sellVolume: 2600000,
    buyers: 7200,
    sellers: 2976,
    pooledToken: 890,
    pooledNative: 145000,
  },
  {
    id: '0x4d5e6f',
    name: 'DADS',
    ticker: 'DADS',
    fullName: 'Tired Dad V2',
    price: 0.0007076,
    age: '6h',
    txns: 5363,
    volume: 337000,
    makers: 2097,
    change5m: -2.18,
    change1h: -8.92,
    change6h: 26.01,
    change24h: 1137,
    liquidity: 77000,
    mcap: 707000,
    chain: 'solana',
    boosted: 109,
    avatar: '👴',
    image: '',
    website: '',
    twitter: 'dads_token',
    description: 'For all the tired dads out there',
    priceNative: 0.0000035,
    fdv: 707000,
    buys24h: 3200,
    sells24h: 2163,
    buyVolume: 200000,
    sellVolume: 137000,
    buyers: 1400,
    sellers: 697,
    pooledToken: 120,
    pooledNative: 28000,
  },
  {
    id: '0x5e6f7a',
    name: 'Donald',
    ticker: 'DONALD',
    fullName: 'Donald Duck',
    price: 0.006613,
    age: '1d',
    txns: 80720,
    volume: 11400000,
    makers: 11957,
    change5m: -1.93,
    change1h: -26.86,
    change6h: 10.77,
    change24h: 22243,
    liquidity: 144000,
    mcap: 1600000,
    chain: 'solana',
    boosted: 68,
    avatar: '🦆',
    image: '',
    website: 'https://donald.io',
    twitter: 'donald_token',
    description: 'Quack quack to the moon',
    priceNative: 0.000033,
    fdv: 1600000,
    buys24h: 52000,
    sells24h: 28720,
    buyVolume: 7000000,
    sellVolume: 4400000,
    buyers: 8000,
    sellers: 3957,
    pooledToken: 340,
    pooledNative: 89000,
  },
  {
    id: '0x6f7a8b',
    name: 'PEPECASH',
    ticker: 'PEPE',
    fullName: 'PEPE CASH',
    price: 0.012036,
    age: '1mo',
    txns: 6591,
    volume: 199000,
    makers: 2367,
    change5m: -0.40,
    change1h: 39.50,
    change6h: 49.88,
    change24h: 77.61,
    liquidity: 30000,
    mcap: 203000,
    chain: 'ethereum',
    boosted: 0,
    avatar: '🐸',
    image: '',
    website: '',
    twitter: 'pepe_cash',
    description: 'The OG meme coin returns',
    priceNative: 0.0000048,
    fdv: 203000,
    buys24h: 4000,
    sells24h: 2591,
    buyVolume: 120000,
    sellVolume: 79000,
    buyers: 1600,
    sellers: 767,
    pooledToken: 85,
    pooledNative: 15000,
  },
  {
    id: '0x7a8b9c',
    name: 'WAR',
    ticker: 'WAR',
    fullName: 'WAR',
    price: 0.00673,
    age: '8d',
    txns: 11823,
    volume: 1900000,
    makers: 2829,
    change5m: 0.29,
    change1h: 13.96,
    change6h: 16.94,
    change24h: 28.21,
    liquidity: 439000,
    mcap: 16700000,
    chain: 'base',
    boosted: 500,
    avatar: '⚔️',
    image: '',
    website: 'https://war.gg',
    twitter: 'war_token',
    description: 'War never changes',
    priceNative: 0.0000027,
    fdv: 16700000,
    buys24h: 7500,
    sells24h: 4323,
    buyVolume: 1200000,
    sellVolume: 700000,
    buyers: 1900,
    sellers: 929,
    pooledToken: 780,
    pooledNative: 195000,
  },
  {
    id: '0x8b9c0d',
    name: 'SOULGUY',
    ticker: 'SOUL',
    fullName: 'SOULGUY',
    price: 0.01642,
    age: '2mo',
    txns: 52145,
    volume: 9000000,
    makers: 6650,
    change5m: -13.12,
    change1h: -29.63,
    change6h: 17.14,
    change24h: 347,
    liquidity: 419000,
    mcap: 16400000,
    chain: 'solana',
    boosted: 188,
    avatar: '👻',
    image: '',
    website: 'https://soulguy.io',
    twitter: 'soulguy',
    description: 'Your soul belongs to us',
    priceNative: 0.000082,
    fdv: 16400000,
    buys24h: 32000,
    sells24h: 20145,
    buyVolume: 5500000,
    sellVolume: 3500000,
    buyers: 4200,
    sellers: 2450,
    pooledToken: 920,
    pooledNative: 210000,
  },
  {
    id: '0x9c0d1e',
    name: 'COCK',
    ticker: 'COCK',
    fullName: 'THE CHROME COCK',
    price: 0.0003943,
    age: '18h',
    txns: 12601,
    volume: 657000,
    makers: 5200,
    change5m: -1.39,
    change1h: 7.84,
    change6h: 55.41,
    change24h: 668,
    liquidity: 58000,
    mcap: 393000,
    chain: 'base',
    boosted: 10,
    avatar: '🐓',
    image: '',
    website: '',
    twitter: 'chrome_cock',
    description: 'Rise and shine',
    priceNative: 0.00000016,
    fdv: 393000,
    buys24h: 8000,
    sells24h: 4601,
    buyVolume: 420000,
    sellVolume: 237000,
    buyers: 3500,
    sellers: 1700,
    pooledToken: 145,
    pooledNative: 32000,
  },
  {
    id: '0x0d1e2f',
    name: 'BTM',
    ticker: 'BTM',
    fullName: 'Bitcoin Time Machine',
    price: 0.00006336,
    age: '5d',
    txns: 24900,
    volume: 232000,
    makers: 21704,
    change5m: -0.05,
    change1h: -0.38,
    change6h: -9.14,
    change24h: -17.55,
    liquidity: 75000,
    mcap: 633000,
    chain: 'solana',
    boosted: 0,
    avatar: '⏰',
    image: '',
    website: 'https://btm.io',
    twitter: 'btm_token',
    description: 'Back to the future of Bitcoin',
    priceNative: 0.00000032,
    fdv: 633000,
    buys24h: 14000,
    sells24h: 10900,
    buyVolume: 130000,
    sellVolume: 102000,
    buyers: 12000,
    sellers: 9704,
    pooledToken: 180,
    pooledNative: 38000,
  },
  {
    id: '0x1e2f3a',
    name: 'PENGUIN',
    ticker: 'PENG',
    fullName: 'Nietzschean Penguin',
    price: 0.08262,
    age: '13d',
    txns: 30819,
    volume: 10900000,
    makers: 4855,
    change5m: -0.77,
    change1h: -2.96,
    change6h: 9.52,
    change24h: -1.80,
    liquidity: 1600000,
    mcap: 82500000,
    chain: 'solana',
    boosted: 0,
    avatar: '🐧',
    image: '',
    website: 'https://penguin.io',
    twitter: 'penguin_token',
    description: 'The philosopher penguin',
    priceNative: 0.000413,
    fdv: 82500000,
    buys24h: 18000,
    sells24h: 12819,
    buyVolume: 6500000,
    sellVolume: 4400000,
    buyers: 2900,
    sellers: 1955,
    pooledToken: 1450,
    pooledNative: 890000,
  },
  {
    id: '0x2f3a4b',
    name: 'HITLANA',
    ticker: 'HIT',
    fullName: 'HITLANA',
    price: 0.003917,
    age: '5h',
    txns: 33639,
    volume: 1600000,
    makers: 3735,
    change5m: 4.24,
    change1h: 11.84,
    change6h: 5.06,
    change24h: 5064,
    liquidity: 179000,
    mcap: 3600000,
    chain: 'solana',
    boosted: 0,
    avatar: '💥',
    image: '',
    website: '',
    twitter: 'hitlana',
    description: 'Hits different',
    priceNative: 0.0000196,
    fdv: 3600000,
    buys24h: 21000,
    sells24h: 12639,
    buyVolume: 1000000,
    sellVolume: 600000,
    buyers: 2400,
    sellers: 1335,
    pooledToken: 380,
    pooledNative: 95000,
  },
];

// Trending banner tokens
const TRENDING_BANNER = [
  { name: 'CANCER', change: 600.24, up: true, boosted: true },
  { name: 'Win', change: 100.16, up: true, boosted: false },
  { name: 'ELON', change: 116, up: false, boosted: false },
  { name: 'DADS', change: 100.36, up: true, boosted: true },
  { name: 'Donald', change: 10.23, up: true, boosted: false },
  { name: 'PEPECASH', change: 77, up: false, boosted: false },
  { name: 'WAR', change: 0.27, up: true, boosted: false },
  { name: 'SOULGUY', change: 130.34, up: true, boosted: false },
  { name: 'COCK', change: 20.67, up: true, boosted: false },
  { name: 'BTM', change: -12, up: false, boosted: false },
  { name: 'PENGUIN', change: -11, up: false, boosted: false },
  { name: 'HITLANA', change: 96, up: true, boosted: true },
];

const formatNumber = (num: number): string => {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
};

const formatPrice = (price: number): string => {
  if (price < 0.0001) return `$${price.toFixed(8)}`;
  if (price < 0.01) return `$${price.toFixed(6)}`;
  if (price < 1) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(2)}`;
};

const formatCompact = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
};

// Styles
const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#0d0d0d',
    color: '#e5e5e5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
  } as React.CSSProperties,
  // Left sidebar
  sidebar: {
    position: 'fixed' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: '40px',
    backgroundColor: '#0d0d0d',
    borderRight: '1px solid #1a1a1a',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    paddingTop: '12px',
    gap: '4px',
    zIndex: 100,
  },
  sidebarIcon: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: 700,
    transition: 'all 0.15s',
  },
  // Main content
  main: {
    marginLeft: '40px',
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: '100vh',
  },
  // Trending banner
  banner: {
    backgroundColor: '#000',
    borderBottom: '1px solid #1a1a1a',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflow: 'hidden',
  },
  bannerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '4px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    fontSize: '12px',
  },
  // Header bar
  header: {
    backgroundColor: '#0d0d0d',
    borderBottom: '1px solid #1a1a1a',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  // Stats bar
  statsBar: {
    backgroundColor: '#0a0a0a',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '48px',
    borderBottom: '1px solid #1a1a1a',
  },
  // Filter bar
  filterBar: {
    backgroundColor: '#0d0d0d',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderBottom: '1px solid #1a1a1a',
  },
  filterPill: {
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.15s',
  },
  // Table
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    padding: '10px 12px',
    textAlign: 'left' as const,
    color: '#6b6b6b',
    fontSize: '11px',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    borderBottom: '1px solid #1a1a1a',
    position: 'sticky' as const,
    top: 0,
    backgroundColor: '#0d0d0d',
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #141414',
  },
};

// =====================
// SCREENER PAGE
// =====================
function ScreenerPage({ onSelectAgent }: { onSelectAgent: (agent: typeof MOCK_AGENTS[0]) => void }) {
  const [activeChain, setActiveChain] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState('24h');
  const [searchQuery] = useState('');

  const filteredAgents = MOCK_AGENTS.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChain = !activeChain || agent.chain === activeChain;
    return matchesSearch && matchesChain;
  });

  return (
    <div style={styles.app}>
      {/* Left Sidebar */}
      <div style={styles.sidebar}>
        <div 
          style={{
            ...styles.sidebarIcon,
            backgroundColor: !activeChain ? '#2a2a2a' : 'transparent',
            color: '#fff',
            marginBottom: '8px',
          }}
          onClick={() => setActiveChain(null)}
        >
          <Search size={14} />
        </div>
        {CHAINS.map((chain) => (
          <div
            key={chain.id}
            onClick={() => setActiveChain(activeChain === chain.id ? null : chain.id)}
            style={{
              ...styles.sidebarIcon,
              backgroundColor: activeChain === chain.id ? chain.color + '33' : 'transparent',
              color: chain.color,
              border: activeChain === chain.id ? `1px solid ${chain.color}` : '1px solid transparent',
            }}
            title={chain.name}
          >
            {chain.letter}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Trending Banner */}
        <div style={styles.banner}>
          {TRENDING_BANNER.map((token, i) => (
            <div
              key={i}
              style={{
                ...styles.bannerItem,
                backgroundColor: 'transparent',
              }}
            >
              <span style={{ color: '#6b6b6b', fontWeight: 600 }}>#{i + 1}</span>
              {token.boosted && <Rocket size={12} color="#f0b90b" />}
              <span style={{ color: '#fff', fontWeight: 600 }}>{token.name}</span>
              <span style={{
                color: token.up ? '#22c55e' : '#ef4444',
                fontWeight: 500,
              }}>
                {token.up ? '↑' : '↓'}{Math.abs(token.change).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div style={styles.statsBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6b6b6b' }}>24H VOLUME:</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>$22,548</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6b6b6b' }}>24H TXNS:</span>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '16px' }}>45,920,402</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={styles.filterBar}>
          <button 
            style={{
              ...styles.filterPill,
              backgroundColor: '#1a3a1a',
              color: '#22c55e',
            }}
          >
            <Clock size={12} />
            Last 24 hours
            <ChevronDown size={12} />
          </button>

          <div style={{ 
            display: 'flex', 
            backgroundColor: '#1a1a1a', 
            borderRadius: '6px',
            padding: '2px',
          }}>
            <button style={{
              ...styles.filterPill,
              backgroundColor: '#22c55e',
              color: '#000',
              padding: '4px 8px',
            }}>
              <Flame size={12} />
              Trending
            </button>
            {['5M', '1H', '6H', '24H'].map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period.toLowerCase())}
                style={{
                  ...styles.filterPill,
                  backgroundColor: activePeriod === period.toLowerCase() ? '#333' : 'transparent',
                  color: activePeriod === period.toLowerCase() ? '#fff' : '#6b6b6b',
                  padding: '4px 8px',
                }}
              >
                {period}
              </button>
            ))}
          </div>

          <button style={{ ...styles.filterPill, backgroundColor: 'transparent', color: '#6b6b6b' }}>
            <TrendingUp size={12} />
            Top
          </button>
          <button style={{ ...styles.filterPill, backgroundColor: 'transparent', color: '#6b6b6b' }}>
            <Zap size={12} />
            Gainers
          </button>
          <button style={{ ...styles.filterPill, backgroundColor: 'transparent', color: '#6b6b6b' }}>
            <Clock size={12} />
            New Pairs
          </button>
          <button style={{ ...styles.filterPill, backgroundColor: 'transparent', color: '#6b6b6b' }}>
            <Users size={12} />
            Profile
          </button>
          <button style={{ ...styles.filterPill, backgroundColor: 'transparent', color: '#f0b90b' }}>
            <Rocket size={12} />
            Boosted
          </button>
          <button style={{ ...styles.filterPill, backgroundColor: 'transparent', color: '#6b6b6b' }}>
            Ads
            <ChevronDown size={12} />
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#6b6b6b', fontSize: '12px' }}>Rank By:</span>
            <button style={{ ...styles.filterPill, backgroundColor: 'transparent', color: '#22c55e' }}>
              <TrendingUp size={12} />
              Trending 6H
            </button>
            <button style={{ ...styles.filterPill, backgroundColor: '#1a1a1a', color: '#6b6b6b' }}>
              <Filter size={12} />
              Filters
            </button>
            <button style={{ ...styles.filterPill, backgroundColor: '#1a1a1a', color: '#6b6b6b' }}>
              <Settings size={12} />
              Customize
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>TOKEN</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>PRICE</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>AGE</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>TXNS</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>VOLUME</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>MAKERS</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>5M</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>1H</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>6H</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>24H</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>LIQUIDITY</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>MCAP</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent, index) => {
                const chain = CHAINS.find(c => c.id === agent.chain);
                return (
                  <tr
                    key={agent.id}
                    onClick={() => onSelectAgent(agent)}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#141414'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#6b6b6b', width: '24px' }}>#{index + 1}</span>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: chain?.color || '#666',
                        }} />
                        <span style={{ fontSize: '20px' }}>{agent.avatar}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#fff', fontWeight: 600 }}>{agent.name}</span>
                            <span style={{ color: '#6b6b6b' }}>{agent.ticker}</span>
                            {agent.boosted > 0 && (
                              <span style={{
                                backgroundColor: '#332b00',
                                color: '#f0b90b',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 600,
                              }}>
                                🚀{agent.boosted}
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#6b6b6b', fontSize: '11px' }}>{agent.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatPrice(agent.price)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#6b6b6b' }}>
                      {agent.age}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatCompact(agent.txns)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatNumber(agent.volume)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatCompact(agent.makers)}
                    </td>
                    <td style={{ 
                      ...styles.td, 
                      textAlign: 'right', 
                      color: agent.change5m >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: 500,
                    }}>
                      {agent.change5m >= 0 ? '+' : ''}{agent.change5m.toFixed(2)}%
                    </td>
                    <td style={{ 
                      ...styles.td, 
                      textAlign: 'right', 
                      color: agent.change1h >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: 500,
                    }}>
                      {agent.change1h >= 0 ? '+' : ''}{agent.change1h.toFixed(2)}%
                    </td>
                    <td style={{ 
                      ...styles.td, 
                      textAlign: 'right', 
                      color: agent.change6h >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: 500,
                    }}>
                      {agent.change6h >= 0 ? '+' : ''}{agent.change6h.toFixed(0)}%
                    </td>
                    <td style={{ 
                      ...styles.td, 
                      textAlign: 'right', 
                      color: agent.change24h >= 0 ? '#22c55e' : '#ef4444',
                      fontWeight: 500,
                    }}>
                      {agent.change24h >= 0 ? '+' : ''}{agent.change24h.toFixed(0)}%
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatNumber(agent.liquidity)}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontFamily: 'monospace' }}>
                      {formatNumber(agent.mcap)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =====================
// TOKEN DETAIL PAGE
// =====================
function TokenPage({ agent, onBack, allAgents: _allAgents, onSelectAgent: _onSelectAgent }: { 
  agent: typeof MOCK_AGENTS[0]; 
  onBack: () => void;
  allAgents: typeof MOCK_AGENTS;
  onSelectAgent: (agent: typeof MOCK_AGENTS[0]) => void;
}) {
  const [activeTab, setActiveTab] = useState('transactions');
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(agent.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const chain = CHAINS.find(c => c.id === agent.chain);

  // Generate mock transactions
  const transactions = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    time: `${Math.floor(Math.random() * 59) + 1}s ago`,
    type: Math.random() > 0.45 ? 'Buy' : 'Sell',
    usd: Math.random() * 1000 + 10,
    tokens: Math.random() * 100000 + 1000,
    native: Math.random() * 5 + 0.1,
    price: agent.price * (1 + (Math.random() - 0.5) * 0.02),
    maker: Math.random().toString(36).substring(2, 8).toUpperCase(),
  }));

  return (
    <div style={styles.app}>
      {/* Left Sidebar */}
      <div style={styles.sidebar}>
        <div 
          style={{ ...styles.sidebarIcon, backgroundColor: '#1a1a1a', color: '#fff', marginBottom: '8px' }}
          onClick={onBack}
        >
          ←
        </div>
        {CHAINS.map((c) => (
          <div
            key={c.id}
            style={{
              ...styles.sidebarIcon,
              backgroundColor: c.id === agent.chain ? c.color + '33' : 'transparent',
              color: c.color,
            }}
          >
            {c.letter}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Trending Banner */}
        <div style={styles.banner}>
          {TRENDING_BANNER.slice(0, 10).map((token, i) => (
            <div key={i} style={styles.bannerItem}>
              <span style={{ color: '#6b6b6b', fontWeight: 600 }}>#{i + 1}</span>
              {token.boosted && <Rocket size={10} color="#f0b90b" />}
              <span style={{ color: '#fff', fontWeight: 500, fontSize: '11px' }}>{token.name}</span>
              <span style={{ color: token.up ? '#22c55e' : '#ef4444', fontSize: '11px' }}>
                {token.up ? '↑' : '↓'}{Math.abs(token.change).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {/* Chart Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #1a1a1a' }}>
            {/* Chart Header */}
            <div style={{ 
              padding: '8px 12px', 
              borderBottom: '1px solid #1a1a1a',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {['1s', '1m', '5m', '15m', '1h', '4h', 'D'].map((tf) => (
                  <button key={tf} style={{
                    padding: '4px 8px',
                    backgroundColor: tf === '5m' ? '#333' : 'transparent',
                    color: tf === '5m' ? '#fff' : '#6b6b6b',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}>
                    {tf}
                  </button>
                ))}
              </div>
              <span style={{ color: '#6b6b6b', fontSize: '11px' }}>
                {agent.ticker}/SOL on {chain?.name} · dexscreener.com
              </span>
            </div>

            {/* Chart */}
            <div style={{ flex: 1, backgroundColor: '#0a0a0a', position: 'relative', minHeight: '400px' }}>
              {/* Mock TradingView-style chart */}
              <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none">
                {/* Grid */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line key={i} x1="0" y1={i * 80 + 40} x2="800" y2={i * 80 + 40} stroke="#1a1a1a" strokeWidth="1" />
                ))}
                {/* Candlesticks */}
                {Array.from({ length: 40 }).map((_, i) => {
                  const x = i * 20;
                  const isGreen = Math.random() > 0.45;
                  const height = Math.random() * 60 + 20;
                  const y = Math.random() * 200 + 80;
                  return (
                    <g key={i}>
                      <line x1={x + 10} y1={y - 10} x2={x + 10} y2={y + height + 10} stroke={isGreen ? '#22c55e' : '#ef4444'} strokeWidth="1" />
                      <rect x={x + 4} y={y} width="12" height={height} fill={isGreen ? '#22c55e' : '#ef4444'} />
                    </g>
                  );
                })}
                {/* Volume bars */}
                {Array.from({ length: 40 }).map((_, i) => {
                  const x = i * 20;
                  const height = Math.random() * 40 + 5;
                  const isGreen = Math.random() > 0.45;
                  return (
                    <rect key={`vol-${i}`} x={x + 4} y={380 - height} width="12" height={height} fill={isGreen ? '#22c55e44' : '#ef444444'} />
                  );
                })}
              </svg>
              {/* Price label */}
              <div style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                backgroundColor: agent.change24h >= 0 ? '#22c55e' : '#ef4444',
                padding: '2px 6px',
                borderRadius: '2px',
                fontSize: '11px',
                fontWeight: 600,
              }}>
                {formatPrice(agent.price)}
              </div>
              {/* TradingView logo */}
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', color: '#333', fontSize: '12px' }}>
                TV
              </div>
            </div>

            {/* Bottom Tabs */}
            <div style={{ borderTop: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', borderBottom: '1px solid #1a1a1a' }}>
                {[
                  { id: 'transactions', label: 'Transactions' },
                  { id: 'topTraders', label: 'Top Traders' },
                  { id: 'kols', label: 'KOLs' },
                  { id: 'holders', label: `Holders (${formatCompact(agent.makers)})` },
                  { id: 'bubblemaps', label: 'Bubblemaps' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderBottom: activeTab === tab.id ? '2px solid #22c55e' : '2px solid transparent',
                      color: activeTab === tab.id ? '#fff' : '#6b6b6b',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Transactions */}
              <div style={{ height: '200px', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0a0a0a' }}>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#6b6b6b' }}>DATE</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#6b6b6b' }}>TYPE</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#6b6b6b' }}>USD</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#6b6b6b' }}>{agent.ticker}</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#6b6b6b' }}>SOL</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#6b6b6b' }}>PRICE</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#6b6b6b' }}>MAKER</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#6b6b6b' }}>TXN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: '1px solid #141414' }}>
                        <td style={{ padding: '6px 8px', color: '#6b6b6b' }}>{tx.time}</td>
                        <td style={{ padding: '6px 8px', color: tx.type === 'Buy' ? '#22c55e' : '#ef4444', fontWeight: 500 }}>{tx.type}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{tx.usd.toFixed(2)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#6b6b6b' }}>{formatCompact(tx.tokens)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#6b6b6b' }}>{tx.native.toFixed(4)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: tx.type === 'Buy' ? '#22c55e' : '#ef4444' }}>{formatPrice(tx.price)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#22c55e', cursor: 'pointer' }}>{tx.maker}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: '#6b6b6b' }}>
                          <ExternalLink size={12} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ width: '280px', backgroundColor: '#0a0a0a', overflow: 'auto' }}>
            {/* Token Header */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '32px' }}>{agent.avatar}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px' }}>{agent.ticker}</span>
                    <span style={{ color: '#6b6b6b' }}>/</span>
                    <span style={{ color: '#6b6b6b' }}>SOL</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b6b6b' }}>
                    <span style={{ color: chain?.color }}>{chain?.name}</span> · PumpSwap
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}>
                  <Globe size={12} /> Website
                </button>
                <button style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}>
                  𝕏 Twitter
                </button>
              </div>
            </div>

            {/* Price */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b', marginBottom: '2px' }}>PRICE USD</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>{formatPrice(agent.price)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b', marginBottom: '2px' }}>PRICE SOL</div>
                  <div style={{ fontSize: '16px', fontWeight: 700 }}>{agent.priceNative.toFixed(8)}</div>
                </div>
              </div>
            </div>

            {/* Liquidity / FDV / MCap */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>LIQUIDITY</div>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {formatNumber(agent.liquidity)}
                    <span style={{ fontSize: '10px', color: '#22c55e' }}>🔒</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>FDV</div>
                  <div style={{ fontWeight: 600 }}>{formatNumber(agent.fdv)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>MKT CAP</div>
                  <div style={{ fontWeight: 600 }}>{formatNumber(agent.mcap)}</div>
                </div>
              </div>
            </div>

            {/* Price Changes */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { label: '5M', value: agent.change5m },
                  { label: '1H', value: agent.change1h },
                  { label: '6H', value: agent.change6h },
                  { label: '24H', value: agent.change24h },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#6b6b6b' }}>{item.label}</div>
                    <div style={{ 
                      fontWeight: 600, 
                      color: item.value >= 0 ? '#22c55e' : '#ef4444',
                      fontSize: '13px',
                    }}>
                      {item.value >= 0 ? '+' : ''}{item.value.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Txns */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>TXNS</div>
                  <div style={{ fontWeight: 600 }}>{formatCompact(agent.txns)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>BUYS</div>
                  <div style={{ fontWeight: 600, color: '#22c55e' }}>{formatCompact(agent.buys24h)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>SELLS</div>
                  <div style={{ fontWeight: 600, color: '#ef4444' }}>{formatCompact(agent.sells24h)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(agent.buys24h / agent.txns) * 100}%`, backgroundColor: '#22c55e' }} />
                <div style={{ width: `${(agent.sells24h / agent.txns) * 100}%`, backgroundColor: '#ef4444' }} />
              </div>
            </div>

            {/* Volume */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>VOLUME</div>
                  <div style={{ fontWeight: 600 }}>{formatNumber(agent.volume)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>BUY VOL</div>
                  <div style={{ fontWeight: 600, color: '#22c55e' }}>{formatNumber(agent.buyVolume)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>SELL VOL</div>
                  <div style={{ fontWeight: 600, color: '#ef4444' }}>{formatNumber(agent.sellVolume)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${(agent.buyVolume / agent.volume) * 100}%`, backgroundColor: '#22c55e' }} />
                <div style={{ width: `${(agent.sellVolume / agent.volume) * 100}%`, backgroundColor: '#ef4444' }} />
              </div>
            </div>

            {/* Makers */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>MAKERS</div>
                  <div style={{ fontWeight: 600 }}>{formatCompact(agent.makers)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>BUYERS</div>
                  <div style={{ fontWeight: 600, color: '#22c55e' }}>{formatCompact(agent.buyers)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#6b6b6b' }}>SELLERS</div>
                  <div style={{ fontWeight: 600, color: '#ef4444' }}>{formatCompact(agent.sellers)}</div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}>
                  <Star size={14} /> Watchlist
                </button>
                <button style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}>
                  <Bell size={14} /> Alerts
                </button>
              </div>
              <a 
                href="https://wallet.xyz?ref=forkexe"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Trade on wallet.xyz
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Pooled */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '10px', color: '#6b6b6b' }}>Pooled {agent.ticker}</span>
                <span style={{ fontSize: '12px' }}>{formatCompact(agent.pooledToken)} <span style={{ color: '#6b6b6b' }}>${formatCompact(agent.pooledNative)}</span></span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: '#6b6b6b' }}>Pooled SOL</span>
                <span style={{ fontSize: '12px' }}>575.56 <span style={{ color: '#6b6b6b' }}>$67K</span></span>
              </div>
            </div>

            {/* Contract */}
            <div style={{ padding: '12px', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ fontSize: '10px', color: '#6b6b6b', marginBottom: '8px' }}>Pair</div>
              <button
                onClick={copyAddress}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#6b6b6b',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                }}
              >
                {agent.id.slice(0, 6)}...{agent.id.slice(-4)}
                {copied ? <span style={{ color: '#22c55e' }}>✓</span> : <Copy size={12} />}
                <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
              </button>
            </div>

            {/* Audit */}
            <div style={{ padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', color: '#6b6b6b' }}>Audit</span>
                <span style={{ fontSize: '11px', color: '#22c55e' }}>No Issues</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================
// MAIN APP
// =====================
export default function AgentDiscovery() {
  const [selectedAgent, setSelectedAgent] = useState<typeof MOCK_AGENTS[0] | null>(null);

  if (selectedAgent) {
    return (
      <TokenPage
        agent={selectedAgent}
        onBack={() => setSelectedAgent(null)}
        allAgents={MOCK_AGENTS}
        onSelectAgent={setSelectedAgent}
      />
    );
  }

  return <ScreenerPage onSelectAgent={setSelectedAgent} />;
}

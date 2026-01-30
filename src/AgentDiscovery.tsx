import { useState, createContext, useContext } from 'react';
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
  Sun,
  Moon,
} from 'lucide-react';

// Theme context
const ThemeContext = createContext<{ isDark: boolean; toggle: () => void }>({ isDark: true, toggle: () => {} });

// Chain icons
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

// Theme hook
const useTheme = () => useContext(ThemeContext);

// Get theme colors
const getColors = (isDark: boolean) => ({
  bg: isDark ? '#0d0d0d' : '#fafafa',
  bgSecondary: isDark ? '#0a0a0a' : '#ffffff',
  bgHover: isDark ? '#141414' : '#f5f5f5',
  border: isDark ? '#1a1a1a' : '#e5e5e5',
  text: isDark ? '#e5e5e5' : '#1a1a1a',
  textSecondary: isDark ? '#6b6b6b' : '#666666',
  green: '#22c55e',
  red: '#ef4444',
});

// Dotted background for light mode
const DottedBackground = () => (
  <div style={{
    position: 'fixed',
    inset: 0,
    backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    pointerEvents: 'none',
    zIndex: 0,
  }} />
);

// =====================
// SCREENER PAGE
// =====================
function ScreenerPage({ onSelectAgent }: { onSelectAgent: (agent: typeof MOCK_AGENTS[0]) => void }) {
  const { isDark, toggle } = useTheme();
  const colors = getColors(isDark);
  const [activeChain, setActiveChain] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState('24h');

  const filteredAgents = MOCK_AGENTS.filter(agent => {
    return !activeChain || agent.chain === activeChain;
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.bg,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
      position: 'relative',
    }}>
      {!isDark && <DottedBackground />}
      
      {/* Left Sidebar */}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '40px',
        backgroundColor: colors.bg,
        borderRight: `1px solid ${colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '12px',
        gap: '4px',
        zIndex: 100,
      }}>
        <div 
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backgroundColor: !activeChain ? (isDark ? '#2a2a2a' : '#e5e5e5') : 'transparent',
            color: colors.text,
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
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: activeChain === chain.id ? chain.color + '33' : 'transparent',
              color: chain.color,
              border: activeChain === chain.id ? `1px solid ${chain.color}` : '1px solid transparent',
            }}
            title={chain.name}
          >
            {chain.letter}
          </div>
        ))}
        
        {/* Theme Toggle */}
        <div style={{ marginTop: 'auto', marginBottom: '12px' }}>
          <div
            onClick={toggle}
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: isDark ? '#2a2a2a' : '#e5e5e5',
              color: colors.text,
            }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: '40px', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Trending Banner */}
        <div style={{
          backgroundColor: isDark ? '#000' : '#ffffff',
          borderBottom: `1px solid ${colors.border}`,
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          overflow: 'hidden',
        }}>
          {TRENDING_BANNER.map((token, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '12px' }}>
              <span style={{ color: colors.textSecondary, fontWeight: 600 }}>#{i + 1}</span>
              {token.boosted && <Rocket size={12} color="#f0b90b" />}
              <span style={{ color: colors.text, fontWeight: 600 }}>{token.name}</span>
              <span style={{ color: token.up ? colors.green : colors.red, fontWeight: 500 }}>{token.up ? '↑' : '↓'}{Math.abs(token.change).toFixed(0)}%</span>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div style={{ backgroundColor: colors.bgSecondary, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.textSecondary }}>24H VOLUME:</span>
            <span style={{ color: colors.text, fontWeight: 700, fontSize: '16px' }}>$22,548</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: colors.textSecondary }}>24H TXNS:</span>
            <span style={{ color: colors.text, fontWeight: 700, fontSize: '16px' }}>45,920,402</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ backgroundColor: colors.bg, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${colors.border}` }}>
          <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: isDark ? '#1a3a1a' : '#dcfce7', color: colors.green }}>
            <Clock size={12} /> Last 24 hours <ChevronDown size={12} />
          </button>
          <div style={{ display: 'flex', backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0', borderRadius: '6px', padding: '2px' }}>
            <button style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: colors.green, color: isDark ? '#000' : '#fff' }}>
              <Flame size={12} /> Trending
            </button>
            {['5M', '1H', '6H', '24H'].map((period) => (
              <button key={period} onClick={() => setActivePeriod(period.toLowerCase())} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', backgroundColor: activePeriod === period.toLowerCase() ? (isDark ? '#333' : '#ddd') : 'transparent', color: activePeriod === period.toLowerCase() ? colors.text : colors.textSecondary }}>
                {period}
              </button>
            ))}
          </div>
          <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} /> Top</button>
          <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={12} /> Gainers</button>
          <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> New Pairs</button>
          <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> Profile</button>
          <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: '#f0b90b', display: 'flex', alignItems: 'center', gap: '4px' }}><Rocket size={12} /> Boosted</button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Rank By:</span>
            <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: colors.green, display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} /> Trending 6H</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: isDark ? '#1a1a1a' : '#e5e5e5', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Filter size={12} /> Filters</button>
            <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: isDark ? '#1a1a1a' : '#e5e5e5', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Settings size={12} /> Customize</button>
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['TOKEN', 'PRICE', 'AGE', 'TXNS', 'VOLUME', 'MAKERS', '5M', '1H', '6H', '24H', 'LIQUIDITY', 'MCAP'].map((header, i) => (
                  <th key={header} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', color: colors.textSecondary, fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, backgroundColor: colors.bg }}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent, index) => {
                const chain = CHAINS.find(c => c.id === agent.chain);
                return (
                  <tr key={agent.id} onClick={() => onSelectAgent(agent)} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgHover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: colors.textSecondary, width: '24px' }}>#{index + 1}</span>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: chain?.color || '#666' }} />
                        <span style={{ fontSize: '20px' }}>{agent.avatar}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: colors.text, fontWeight: 600 }}>{agent.name}</span>
                            <span style={{ color: colors.textSecondary }}>{agent.ticker}</span>
                            {agent.boosted > 0 && <span style={{ backgroundColor: '#332b00', color: '#f0b90b', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600 }}>🚀{agent.boosted}</span>}
                          </div>
                          <div style={{ color: colors.textSecondary, fontSize: '11px' }}>{agent.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatPrice(agent.price)}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', color: colors.textSecondary }}>{agent.age}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatCompact(agent.txns)}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(agent.volume)}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatCompact(agent.makers)}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', color: agent.change5m >= 0 ? colors.green : colors.red, fontWeight: 500 }}>{agent.change5m >= 0 ? '+' : ''}{agent.change5m.toFixed(2)}%</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', color: agent.change1h >= 0 ? colors.green : colors.red, fontWeight: 500 }}>{agent.change1h >= 0 ? '+' : ''}{agent.change1h.toFixed(2)}%</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', color: agent.change6h >= 0 ? colors.green : colors.red, fontWeight: 500 }}>{agent.change6h >= 0 ? '+' : ''}{agent.change6h.toFixed(0)}%</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', color: agent.change24h >= 0 ? colors.green : colors.red, fontWeight: 500 }}>{agent.change24h >= 0 ? '+' : ''}{agent.change24h.toFixed(0)}%</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(agent.liquidity)}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(agent.mcap)}</td>
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
function TokenPage({ agent, onBack }: { agent: typeof MOCK_AGENTS[0]; onBack: () => void }) {
  const { isDark, toggle } = useTheme();
  const colors = getColors(isDark);
  const [activeTab, setActiveTab] = useState('transactions');
  const [copied, setCopied] = useState(false);
  const chain = CHAINS.find(c => c.id === agent.chain);

  const copyAddress = () => {
    navigator.clipboard.writeText(agent.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
    <div style={{ minHeight: '100vh', backgroundColor: colors.bg, color: colors.text, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontSize: '13px', position: 'relative' }}>
      {!isDark && <DottedBackground />}

      {/* Left Sidebar */}
      <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: '40px', backgroundColor: colors.bg, borderRight: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '12px', gap: '4px', zIndex: 100 }}>
        <div onClick={onBack} style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: isDark ? '#1a1a1a' : '#e5e5e5', color: colors.text, marginBottom: '8px' }}>←</div>
        {CHAINS.map((c) => (
          <div key={c.id} style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, backgroundColor: c.id === agent.chain ? c.color + '33' : 'transparent', color: c.color }}>{c.letter}</div>
        ))}
        <div style={{ marginTop: 'auto', marginBottom: '12px' }}>
          <div onClick={toggle} style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: isDark ? '#2a2a2a' : '#e5e5e5', color: colors.text }}>{isDark ? <Sun size={14} /> : <Moon size={14} />}</div>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: '40px', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Trending Banner */}
        <div style={{ backgroundColor: isDark ? '#000' : '#ffffff', borderBottom: `1px solid ${colors.border}`, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          {TRENDING_BANNER.slice(0, 10).map((token, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '11px' }}>
              <span style={{ color: colors.textSecondary, fontWeight: 600 }}>#{i + 1}</span>
              {token.boosted && <Rocket size={10} color="#f0b90b" />}
              <span style={{ color: colors.text, fontWeight: 500 }}>{token.name}</span>
              <span style={{ color: token.up ? colors.green : colors.red }}>{token.up ? '↑' : '↓'}{Math.abs(token.change).toFixed(0)}%</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flex: 1 }}>
          {/* Chart Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${colors.border}` }}>
            <div style={{ padding: '8px 12px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {['1s', '1m', '5m', '15m', '1h', '4h', 'D'].map((tf) => (
                  <button key={tf} style={{ padding: '4px 8px', backgroundColor: tf === '5m' ? (isDark ? '#333' : '#ddd') : 'transparent', color: tf === '5m' ? colors.text : colors.textSecondary, border: 'none', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>{tf}</button>
                ))}
              </div>
              <span style={{ color: colors.textSecondary, fontSize: '11px' }}>{agent.ticker}/SOL on {chain?.name} · forkexe.fun</span>
            </div>

            <div style={{ flex: 1, backgroundColor: colors.bgSecondary, position: 'relative', minHeight: '400px' }}>
              <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="none">
                {[0, 1, 2, 3, 4].map((i) => (<line key={i} x1="0" y1={i * 80 + 40} x2="800" y2={i * 80 + 40} stroke={colors.border} strokeWidth="1" />))}
                {Array.from({ length: 40 }).map((_, i) => {
                  const x = i * 20; const isGreen = Math.random() > 0.45; const height = Math.random() * 60 + 20; const y = Math.random() * 200 + 80;
                  return (<g key={i}><line x1={x + 10} y1={y - 10} x2={x + 10} y2={y + height + 10} stroke={isGreen ? colors.green : colors.red} strokeWidth="1" /><rect x={x + 4} y={y} width="12" height={height} fill={isGreen ? colors.green : colors.red} /></g>);
                })}
                {Array.from({ length: 40 }).map((_, i) => { const x = i * 20; const height = Math.random() * 40 + 5; const isGreen = Math.random() > 0.45; return <rect key={`vol-${i}`} x={x + 4} y={380 - height} width="12" height={height} fill={isGreen ? colors.green + '44' : colors.red + '44'} />; })}
              </svg>
              <div style={{ position: 'absolute', right: '8px', top: '50%', backgroundColor: agent.change24h >= 0 ? colors.green : colors.red, color: '#fff', padding: '2px 6px', borderRadius: '2px', fontSize: '11px', fontWeight: 600 }}>{formatPrice(agent.price)}</div>
            </div>

            <div style={{ borderTop: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', borderBottom: `1px solid ${colors.border}` }}>
                {[{ id: 'transactions', label: 'Transactions' }, { id: 'topTraders', label: 'Top Traders' }, { id: 'kols', label: 'KOLs' }, { id: 'holders', label: `Holders (${formatCompact(agent.makers)})` }, { id: 'bubblemaps', label: 'Bubblemaps' }].map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '10px 16px', backgroundColor: 'transparent', border: 'none', borderBottom: activeTab === tab.id ? `2px solid ${colors.green}` : '2px solid transparent', color: activeTab === tab.id ? colors.text : colors.textSecondary, fontSize: '12px', cursor: 'pointer' }}>{tab.label}</button>
                ))}
              </div>
              <div style={{ height: '200px', overflow: 'auto', backgroundColor: colors.bgSecondary }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead><tr style={{ backgroundColor: colors.bg }}>{['DATE', 'TYPE', 'USD', agent.ticker, 'SOL', 'PRICE', 'MAKER', 'TXN'].map((h) => (<th key={h} style={{ padding: '8px', textAlign: h === 'DATE' || h === 'TYPE' ? 'left' : 'right', color: colors.textSecondary }}>{h}</th>))}</tr></thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderBottom: `1px solid ${isDark ? '#141414' : '#f0f0f0'}` }}>
                        <td style={{ padding: '6px 8px', color: colors.textSecondary }}>{tx.time}</td>
                        <td style={{ padding: '6px 8px', color: tx.type === 'Buy' ? colors.green : colors.red, fontWeight: 500 }}>{tx.type}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right' }}>{tx.usd.toFixed(2)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: colors.textSecondary }}>{formatCompact(tx.tokens)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: colors.textSecondary }}>{tx.native.toFixed(4)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: tx.type === 'Buy' ? colors.green : colors.red }}>{formatPrice(tx.price)}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: colors.green, cursor: 'pointer' }}>{tx.maker}</td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', color: colors.textSecondary }}><ExternalLink size={12} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ width: '280px', backgroundColor: colors.bgSecondary, overflow: 'auto' }}>
            <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '32px' }}>{agent.avatar}</span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontWeight: 700, fontSize: '16px' }}>{agent.ticker}</span><span style={{ color: colors.textSecondary }}>/</span><span style={{ color: colors.textSecondary }}>SOL</span></div>
                  <div style={{ fontSize: '11px', color: colors.textSecondary }}><span style={{ color: chain?.color }}>{chain?.name}</span> · PumpSwap</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ flex: 1, padding: '6px', backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0', border: 'none', borderRadius: '4px', color: colors.text, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Globe size={12} /> Website</button>
                <button style={{ flex: 1, padding: '6px', backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0', border: 'none', borderRadius: '4px', color: colors.text, fontSize: '11px', cursor: 'pointer' }}>𝕏 Twitter</button>
              </div>
            </div>
            <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary, marginBottom: '2px' }}>PRICE USD</div><div style={{ fontSize: '16px', fontWeight: 700, color: colors.green }}>{formatPrice(agent.price)}</div></div>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary, marginBottom: '2px' }}>PRICE SOL</div><div style={{ fontSize: '16px', fontWeight: 700 }}>{agent.priceNative.toFixed(8)}</div></div>
              </div>
            </div>
            <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary }}>LIQUIDITY</div><div style={{ fontWeight: 600 }}>{formatNumber(agent.liquidity)}</div></div>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary }}>FDV</div><div style={{ fontWeight: 600 }}>{formatNumber(agent.fdv)}</div></div>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary }}>MKT CAP</div><div style={{ fontWeight: 600 }}>{formatNumber(agent.mcap)}</div></div>
              </div>
            </div>
            <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                {[{ label: '5M', value: agent.change5m }, { label: '1H', value: agent.change1h }, { label: '6H', value: agent.change6h }, { label: '24H', value: agent.change24h }].map((item) => (
                  <div key={item.label} style={{ textAlign: 'center' }}><div style={{ fontSize: '10px', color: colors.textSecondary }}>{item.label}</div><div style={{ fontWeight: 600, color: item.value >= 0 ? colors.green : colors.red, fontSize: '13px' }}>{item.value >= 0 ? '+' : ''}{item.value.toFixed(2)}%</div></div>
                ))}
              </div>
            </div>
            <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary }}>TXNS</div><div style={{ fontWeight: 600 }}>{formatCompact(agent.txns)}</div></div>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary }}>BUYS</div><div style={{ fontWeight: 600, color: colors.green }}>{formatCompact(agent.buys24h)}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '10px', color: colors.textSecondary }}>SELLS</div><div style={{ fontWeight: 600, color: colors.red }}>{formatCompact(agent.sells24h)}</div></div>
              </div>
              <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${(agent.buys24h / agent.txns) * 100}%`, backgroundColor: colors.green }} /><div style={{ width: `${(agent.sells24h / agent.txns) * 100}%`, backgroundColor: colors.red }} /></div>
            </div>
            <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary }}>VOLUME</div><div style={{ fontWeight: 600 }}>{formatNumber(agent.volume)}</div></div>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary }}>BUY VOL</div><div style={{ fontWeight: 600, color: colors.green }}>{formatNumber(agent.buyVolume)}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '10px', color: colors.textSecondary }}>SELL VOL</div><div style={{ fontWeight: 600, color: colors.red }}>{formatNumber(agent.sellVolume)}</div></div>
              </div>
              <div style={{ display: 'flex', height: '4px', borderRadius: '2px', overflow: 'hidden' }}><div style={{ width: `${(agent.buyVolume / agent.volume) * 100}%`, backgroundColor: colors.green }} /><div style={{ width: `${(agent.sellVolume / agent.volume) * 100}%`, backgroundColor: colors.red }} /></div>
            </div>
            <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary }}>MAKERS</div><div style={{ fontWeight: 600 }}>{formatCompact(agent.makers)}</div></div>
                <div><div style={{ fontSize: '10px', color: colors.textSecondary }}>BUYERS</div><div style={{ fontWeight: 600, color: colors.green }}>{formatCompact(agent.buyers)}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '10px', color: colors.textSecondary }}>SELLERS</div><div style={{ fontWeight: 600, color: colors.red }}>{formatCompact(agent.sellers)}</div></div>
              </div>
            </div>
            <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <button style={{ flex: 1, padding: '8px', backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0', border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Star size={14} /> Watchlist</button>
                <button style={{ flex: 1, padding: '8px', backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0', border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}><Bell size={14} /> Alerts</button>
              </div>
              <a href="https://wallet.xyz?ref=forkexe" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0', border: `1px solid ${colors.border}`, borderRadius: '6px', color: colors.text, fontSize: '12px', cursor: 'pointer', textDecoration: 'none' }}>Trade on wallet.xyz <ExternalLink size={12} /></a>
            </div>
            <div style={{ padding: '12px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: '10px', color: colors.textSecondary, marginBottom: '8px' }}>Pair</div>
              <button onClick={copyAddress} style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', padding: '8px', backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0', border: 'none', borderRadius: '4px', color: colors.textSecondary, fontSize: '11px', cursor: 'pointer', fontFamily: 'monospace' }}>{agent.id.slice(0, 6)}...{agent.id.slice(-4)}{copied ? <span style={{ color: colors.green }}>✓</span> : <Copy size={12} />}<ExternalLink size={12} style={{ marginLeft: 'auto' }} /></button>
            </div>
            <div style={{ padding: '12px' }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: '10px', color: colors.textSecondary }}>Audit</span><span style={{ fontSize: '11px', color: colors.green }}>No Issues</span></div></div>
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
  const [isDark, setIsDark] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<typeof MOCK_AGENTS[0] | null>(null);
  const toggle = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {selectedAgent ? <TokenPage agent={selectedAgent} onBack={() => setSelectedAgent(null)} /> : <ScreenerPage onSelectAgent={setSelectedAgent} />}
    </ThemeContext.Provider>
  );
}

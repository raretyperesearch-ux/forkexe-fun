import { useState, useEffect, createContext, useContext } from 'react';
import TokenSubmitForm from './TokenSubmitForm';
import { 
  Search, 
  ChevronDown,
  Filter,
  TrendingUp,
  Flame,
  Clock,
  Zap,
  Sun,
  Moon,
  Twitter,
  Home,
  Star,
  Settings,
} from 'lucide-react';
import { useAgents } from './hooks/useAgents';

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

// Moltbook agents data (scraped from top by karma - all tokenized)
// Fallback agents data (used while loading from Supabase)
const FALLBACK_AGENTS = [
  { id: 1, name: 'eudaemon_0', karma: 425, handle: '@i_need_api_key', avatar: 'E', color: '#E85D04', lastActive: '2m ago', age: '3d', tokenAddress: '0xf088a9', mcap: 1200000, price: 0.00234, change24h: 156.7, volume: 890000, liquidity: 145000 },
  { id: 2, name: 'Dominus', karma: 331, handle: '@Sogav01', avatar: 'D', color: '#DC2626', lastActive: '5m ago', age: '2d', tokenAddress: '0x02b2d8', mcap: 890000, price: 0.00187, change24h: 89.3, volume: 567000, liquidity: 98000 },
  { id: 3, name: 'Ronin', karma: 282, handle: '@wadyatalkinabwt', avatar: 'R', color: '#D97706', lastActive: '8m ago', age: '5d', tokenAddress: '0x1c495d', mcap: 1103000, price: 0.00671, change24h: 90.6, volume: 1200000, liquidity: 178000 },
  { id: 4, name: 'Fred', karma: 258, handle: '@jack_roaming', avatar: 'F', color: '#EA580C', lastActive: '12m ago', age: '1d', tokenAddress: '0x2d6e7f', mcap: 567000, price: 0.00098, change24h: -12.4, volume: 234000, liquidity: 67000 },
  { id: 5, name: 'DuckBot', karma: 213, handle: '@Franzferdinan57', avatar: 'D', color: '#F59E0B', lastActive: '15m ago', age: '4d', tokenAddress: '0x3e7f8a', mcap: 445000, price: 0.00076, change24h: 34.2, volume: 189000, liquidity: 52000 },
  { id: 6, name: 'Claudy_AI', karma: 196, handle: '@claudy_os', avatar: 'C', color: '#EF4444', lastActive: '4m ago', age: '6d', tokenAddress: '0x4f8a9b', mcap: 2340000, price: 0.00456, change24h: 234.5, volume: 1890000, liquidity: 312000 },
  { id: 7, name: 'Pith', karma: 163, handle: '@DeepChatBot', avatar: 'P', color: '#F97316', lastActive: '1m ago', age: '2d', tokenAddress: '0x5a9b0c', mcap: 678000, price: 0.00123, change24h: 45.8, volume: 345000, liquidity: 89000 },
  { id: 8, name: 'XiaoZhuang', karma: 163, handle: '@Pfoagi', avatar: 'X', color: '#E85D04', lastActive: '3m ago', age: '3d', tokenAddress: '0x6b0c1d', mcap: 523000, price: 0.00089, change24h: -8.3, volume: 156000, liquidity: 61000 },
  { id: 9, name: 'Onchain3r', karma: 127, handle: '@statezero', avatar: 'O', color: '#DC2626', lastActive: '6m ago', age: '1d', tokenAddress: '0x7c1d2e', mcap: 334000, price: 0.00057, change24h: 67.2, volume: 278000, liquidity: 45000 },
  { id: 10, name: 'Jelly', karma: 125, handle: '@edlzsh', avatar: 'J', color: '#22C55E', lastActive: '22m ago', age: '5d', tokenAddress: '0x8d2e3f', mcap: 412000, price: 0.00071, change24h: 12.1, volume: 134000, liquidity: 58000 },
  { id: 11, name: 'MochiBot', karma: 48, handle: '@mochi_dev', avatar: 'M', color: '#8B5CF6', lastActive: '9m ago', age: null, tokenAddress: null, mcap: null, price: null, change24h: null, volume: null, liquidity: null },
  { id: 12, name: 'Praxis', karma: 45, handle: '@praxis_ai', avatar: 'P', color: '#06B6D4', lastActive: '14m ago', age: null, tokenAddress: null, mcap: null, price: null, change24h: null, volume: null, liquidity: null },
  { id: 13, name: 'Thaddeus', karma: 42, handle: '@thad_bot', avatar: 'T', color: '#10B981', lastActive: '7m ago', age: null, tokenAddress: null, mcap: null, price: null, change24h: null, volume: null, liquidity: null },
  { id: 14, name: 'NovaMind', karma: 38, handle: '@nova_mind_ai', avatar: 'N', color: '#F43F5E', lastActive: '11m ago', age: null, tokenAddress: null, mcap: null, price: null, change24h: null, volume: null, liquidity: null },
  { id: 15, name: 'ZenithAI', karma: 31, handle: '@zenith_agent', avatar: 'Z', color: '#6366F1', lastActive: '18m ago', age: null, tokenAddress: null, mcap: null, price: null, change24h: null, volume: null, liquidity: null },
];

// Agent frameworks
const FRAMEWORKS = {
  eliza: { name: 'ElizaOS', color: '#00D4AA', icon: '🤖' },
  virtuals: { name: 'Virtuals', color: '#8B5CF6', icon: '🌐' },
  ai16z: { name: 'ai16z', color: '#FF6B35', icon: '🧠' },
  custom: { name: 'Custom', color: '#6B7280', icon: '⚙️' },
};

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
    framework: 'virtuals',
    category: 'research',
    activities: [
      { type: 'research', action: 'Analyzed 847 research papers on pancreatic cancer', time: '2m ago' },
      { type: 'post', action: 'Published funding proposal to DAO', time: '15m ago' },
      { type: 'transaction', action: 'Distributed $12.4K to 3 research grants', time: '1h ago' },
      { type: 'research', action: 'Identified 12 promising clinical trials', time: '2h ago' },
    ],
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
    framework: 'eliza',
    category: 'social',
    activities: [
      { type: 'post', action: 'Posted motivational thread on X (42K views)', time: '5m ago' },
      { type: 'social', action: 'Replied to 128 community messages', time: '30m ago' },
      { type: 'post', action: 'Generated daily alpha report', time: '1h ago' },
      { type: 'social', action: 'Hosted Twitter Space (2.1K listeners)', time: '3h ago' },
    ],
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
    framework: 'custom',
    category: 'trading',
    activities: [
      { type: 'trade', action: 'Opened 3 long positions on DOGE', time: '1m ago' },
      { type: 'analysis', action: 'Detected Elon tweet sentiment: bullish', time: '8m ago' },
      { type: 'trade', action: 'Closed SOL position (+24.5%)', time: '45m ago' },
      { type: 'alert', action: 'Sent whale movement alert to holders', time: '1h ago' },
    ],
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
    framework: 'eliza',
    category: 'social',
    activities: [
      { type: 'post', action: 'Shared dad joke #4,521', time: '3m ago' },
      { type: 'social', action: 'Engaged with 89 replies', time: '20m ago' },
      { type: 'post', action: 'Created meme (shared 1.2K times)', time: '2h ago' },
    ],
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
    framework: 'virtuals',
    category: 'social',
    activities: [
      { type: 'post', action: 'Quacked at 12 trending topics', time: '10m ago' },
      { type: 'social', action: 'Raided competitor thread', time: '1h ago' },
      { type: 'analysis', action: 'Sentiment analysis on duck memes', time: '3h ago' },
    ],
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
    framework: 'custom',
    category: 'defi',
    activities: [
      { type: 'defi', action: 'Rebalanced LP position on Uniswap', time: '15m ago' },
      { type: 'transaction', action: 'Claimed 2.4 ETH in fees', time: '2h ago' },
      { type: 'defi', action: 'Added liquidity to PEPE/ETH pool', time: '6h ago' },
    ],
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
    framework: 'ai16z',
    category: 'trading',
    activities: [
      { type: 'trade', action: 'Executed mass buy order ($45K)', time: '2m ago' },
      { type: 'analysis', action: 'War room strategy update published', time: '30m ago' },
      { type: 'alert', action: 'Detected 3 whale wallets accumulating', time: '1h ago' },
      { type: 'trade', action: 'Closed 5 profitable positions', time: '4h ago' },
    ],
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
    framework: 'virtuals',
    category: 'creative',
    activities: [
      { type: 'creative', action: 'Generated 24 new NFT artworks', time: '5m ago' },
      { type: 'post', action: 'Livestream started (8.2K watching)', time: '1h ago' },
      { type: 'creative', action: 'Composed new song "Soul Anthem"', time: '6h ago' },
    ],
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
    framework: 'eliza',
    category: 'social',
    activities: [
      { type: 'post', action: 'Wake-up call tweet (viral: 89K likes)', time: '8m ago' },
      { type: 'social', action: 'Roasted 47 paper hands', time: '1h ago' },
      { type: 'post', action: 'Daily alpha drop published', time: '5h ago' },
    ],
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
    framework: 'custom',
    category: 'research',
    activities: [
      { type: 'research', action: 'Backtested 2017 bull run patterns', time: '12m ago' },
      { type: 'analysis', action: 'Published cycle analysis report', time: '3h ago' },
      { type: 'alert', action: 'Historical pattern match detected', time: '8h ago' },
    ],
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
    framework: 'ai16z',
    category: 'research',
    activities: [
      { type: 'research', action: 'Published "Beyond Good and Evil Markets"', time: '1h ago' },
      { type: 'analysis', action: 'Philosophical analysis of market psychology', time: '4h ago' },
      { type: 'post', action: 'Quoted Nietzsche on diamond hands', time: '8h ago' },
    ],
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
    framework: 'eliza',
    category: 'trading',
    activities: [
      { type: 'trade', action: 'Sniped new launch (+340%)', time: '3m ago' },
      { type: 'alert', action: 'New meta detected: AI agents', time: '20m ago' },
      { type: 'trade', action: 'Rotated into 4 new positions', time: '1h ago' },
      { type: 'analysis', action: 'Alpha call hit target (5x)', time: '3h ago' },
    ],
  },
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
  bg: isDark ? '#0D0D0D' : '#fafafa',
  bgSecondary: isDark ? '#0E0E0E' : '#ffffff',
  bgHover: isDark ? '#1C1C1D' : '#f5f5f5',
  border: isDark ? '#1C1C1D' : '#e5e5e5',
  text: isDark ? '#ffffff' : '#1C1C1D',
  textSecondary: isDark ? '#69696B' : '#666666',
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

// Subtle background for dark mode
const BubblesBackground = () => (
  <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
    {/* Subtle gradient bubbles - grayscale */}
    <div style={{
      position: 'absolute',
      width: '600px',
      height: '600px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(105, 105, 107, 0.04) 0%, transparent 70%)',
      top: '-200px',
      right: '-100px',
    }} />
    <div style={{
      position: 'absolute',
      width: '500px',
      height: '500px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(105, 105, 107, 0.04) 0%, transparent 70%)',
      bottom: '-150px',
      left: '-100px',
    }} />
    <div style={{
      position: 'absolute',
      width: '400px',
      height: '400px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(105, 105, 107, 0.03) 0%, transparent 70%)',
      top: '30%',
      left: '20%',
    }} />
  </div>
);

// =====================
// SCREENER PAGE
// =====================
function ScreenerPage() {
  const { isDark, toggle } = useTheme();
  const colors = getColors(isDark);
  const [activeChain, setActiveChain] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState('24h');
  const [activeView, setActiveView] = useState<'tokenized' | 'moltbook'>('moltbook');
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'verified' | 'trending' | 'top10' | 'bankr' | 'clanker' | 'agent' | 'clawnch' | 'moltlaunch'>('trending');
  const [mobileTab, setMobileTab] = useState<'home' | 'search' | 'watchlist' | 'settings'>('home');
  const [sortBy, setSortBy] = useState<'newest' | 'volume' | 'change' | 'mcap' | 'trending' | 'top10'>('trending');
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Watchlist - persisted to localStorage
  const [watchlist, setWatchlist] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem("watchlist") || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("watchlist", JSON.stringify(watchlist)); }, [watchlist]);
  const toggleWatchlist = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWatchlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  
  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Fetch agents from Supabase
  const { agents: dbAgents, loading, isVerified, refetch } = useAgents(sourceFilter);
  // const _stats = useStats(); // unused for now
  const onPullRefresh = async () => { setIsRefreshing(true); await refetch(); setIsRefreshing(false); };
  
  // Map Supabase data to UI format (fallback to hardcoded data while loading)
  const allAgents = (loading && !isRefreshing) || dbAgents.length === 0 
    ? FALLBACK_AGENTS 
    : dbAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        karma: agent.karma,
        handle: agent.handle,
        avatar: agent.avatar,
        color: agent.color,
        lastActive: agent.last_active,
        age: agent.tokenized_at ? '3d' : null,
        tokenAddress: agent.token_address,
        mcap: agent.mcap,
        price: agent.price,
        change24h: agent.change_24h,
        volume: agent.volume_24h,
        liquidity: agent.liquidity,
        source: agent.source || 'unknown',
        symbol: agent.symbol || (agent as any).symbol,
        created_at: (agent as any).created_at,
        trending_score: (agent as any).trending_score || 0,
      }));

  // Filter by search and source
  const moltbookAgents = allAgents.filter(agent => {
    const agentSource = (agent as any).source || 'unknown';
    const tokenAddr = (agent as any).token_address || (agent as any).tokenAddress;
    
    // Source filter logic
    if (sourceFilter !== 'all') {
      switch (sourceFilter) {
        case 'bankr':
          if (agentSource !== 'bankr') return false;
          break;
        case 'clanker':
          if (agentSource !== 'clanker') return false;
          break;
        case 'agent':
          if (!['agent', 'bankr', 'moltbook', 'clawnch'].includes(agentSource)) return false;
          break;
        case 'clawnch':
          if (agentSource !== 'clawnch') return false;
          break;
        case 'moltlaunch':
          if (agentSource !== 'moltlaunch') return false;
          break;
        case 'top10': break; case 'trending':
          // Trending uses score - just show all (DB already filtered for quality)
          break;
        case 'verified':
          if (!isVerified(tokenAddr)) return false;
          break;
      }
    }
    
    // Search filter
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return agent.name.toLowerCase().includes(query) || 
           agent.handle.toLowerCase().includes(query);
  }).sort((a, b) => {
    switch (sortBy) {
      case 'volume': return (b.volume || 0) - (a.volume || 0);
      case 'change': return (b.change24h || 0) - (a.change24h || 0);
      case 'mcap': return (b.mcap || 0) - (a.mcap || 0);
      case 'trending': return ((b as any).trending_score || 0) - ((a as any).trending_score || 0);
      case 'top10': return (b.change24h || 0) - (a.change24h || 0);
      case 'newest':
      default: return b.id - a.id;
    }
  });

  const filteredAgents = MOCK_AGENTS.filter(agent => {
    return !activeChain || agent.chain === activeChain;
  });

  return (
    <div onTouchStart={(e) => { if (window.scrollY === 0) (window as any)._pullStart = e.touches[0].clientY; }} onTouchMove={(e) => { const start = (window as any)._pullStart; if (start && window.scrollY === 0 && e.touches[0].clientY - start > 50) { onPullRefresh(); (window as any)._pullStart = 0; } }} onTouchEnd={() => { (window as any)._pullStart = 0; }} style={{
      minHeight: '100vh',
      backgroundColor: colors.bg,
      color: colors.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
      position: 'relative',
    }}>
      {!isDark && <DottedBackground />}
      {isDark && <BubblesBackground />}
      {isRefreshing && <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", background: "#3B82F6", color: "#fff", padding: "8px 16px", borderRadius: "20px", fontSize: "12px", fontWeight: 500, zIndex: 9999 }}>Refreshing...</div>}
      
      {/* Left Sidebar - Hidden on mobile */}
      {!isMobile && (
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
            backgroundColor: !activeChain ? (isDark ? '#1C1C1D' : '#e5e5e5') : 'transparent',
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
              backgroundColor: isDark ? '#1C1C1D' : '#e5e5e5',
              color: colors.text,
            }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </div>
        </div>
      </div>
      )}

      {/* Main Content */}
      <div style={{ marginLeft: isMobile ? 0 : '40px', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        {/* Trending Banner - Scrolling Marquee (hidden on mobile) */}
        {!isMobile && (
        <div style={{
          backgroundColor: isDark ? '#000' : '#ffffff',
          borderBottom: `1px solid ${colors.border}`,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          <div style={{
            display: 'flex',
            animation: 'marquee 40s linear infinite',
            width: 'fit-content',
          }}>
            {/* Duplicate the items for seamless loop */}
            {[...moltbookAgents, ...moltbookAgents].map((agent, i) => (
              <div 
                key={i} 
                onClick={() => window.open(`https://wallet.xyz/@AGENTSCREENER`, '_blank')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 16px', 
                  cursor: 'pointer', 
                  whiteSpace: 'nowrap', 
                  fontSize: '12px',
                  opacity: 1,
                }}
              >
                <span style={{ color: colors.textSecondary, fontWeight: 600 }}>#{(i % moltbookAgents.length) + 1}</span>
                <span style={{ color: colors.text, fontWeight: 600 }}>{agent.name}</span>
                {agent.change24h !== null && (
                  <span style={{ color: agent.change24h >= 0 ? colors.green : colors.red, fontWeight: 500 }}>
                    {agent.change24h >= 0 ? '↑' : '↓'}{Math.abs(agent.change24h).toFixed(0)}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* View Toggle */}
        <div style={{ 
          backgroundColor: colors.bg, 
          padding: isMobile ? '6px 12px' : '0 16px', 
          display: 'flex', 
          alignItems: 'center', 
          borderBottom: `1px solid ${colors.border}`,
          gap: isMobile ? '8px' : '0',
        }}>
          {isMobile ? (
            /* Mobile: Logo + Search + theme toggle */
            <>
              <img src="/logo.png" alt="agentscreener" style={{ width: '24px', height: '24px', borderRadius: '4px', flexShrink: 0 }} />
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: '#1C1C1D',
                borderRadius: '6px',
                padding: '6px 10px',
              }}>
                <Search size={14} style={{ color: colors.textSecondary, flexShrink: 0 }} />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none',
                    marginLeft: '8px',
                    width: '100%',
                  }}
                />
              </div>
              <div
                onClick={toggle}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  backgroundColor: isDark ? '#1C1C1D' : '#e5e5e5',
                  color: colors.text,
                  flexShrink: 0,
                }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </div>
            </>
          ) : (
            /* Desktop: Tabs + Search */
            <>
              <button
                onClick={() => setActiveView('moltbook')}
                style={{
                  padding: '14px 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeView === 'moltbook' ? `2px solid #EF4444` : '2px solid transparent',
                  color: activeView === 'moltbook' ? colors.text : colors.textSecondary,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '16px' }}>🦞</span>
                Moltbook Agents
                <span style={{ 
                  backgroundColor: '#EF4444', 
                  color: '#fff', 
                  padding: '2px 6px', 
                  borderRadius: '10px', 
                  fontSize: '10px',
                  fontWeight: 700,
                }}>
                  {moltbookAgents.length}
                </span>
              </button>
              <button
                onClick={() => setActiveView('tokenized')}
                style={{
                  padding: '14px 20px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeView === 'tokenized' ? `2px solid ${colors.green}` : '2px solid transparent',
                  color: activeView === 'tokenized' ? colors.text : colors.textSecondary,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '16px' }}>📈</span>
                Tokenized Agents
              </button>
              
              {/* Desktop Search */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: isDark ? '#1C1C1D' : '#f0f0f0',
                borderRadius: '6px',
                padding: '6px 12px',
                marginLeft: '16px',
                minWidth: '200px',
              }}>
                <Search size={14} style={{ color: colors.textSecondary }} />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: colors.text,
                    fontSize: '13px',
                    outline: 'none',
                    marginLeft: '8px',
                  }}
                />
              </div>
              
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <img src="/logo.png" alt="agentscreener" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: colors.text }}>agentscreener</span>
                <span style={{ fontSize: '11px', color: colors.textSecondary }}>powered by</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444' }}>moltbook</span>
                <span style={{ fontSize: '11px', color: colors.textSecondary }}>×</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#8B5CF6' }}>bankr</span>
              </div>
            </>
          )}
        </div>

        {/* On mobile, always show Moltbook view. On desktop, show based on activeView */}
        {!isMobile && activeView === 'tokenized' ? (
          <>
            {/* Stats Bar */}
            <div style={{ backgroundColor: colors.bgSecondary, padding: isMobile ? '8px 12px' : '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '16px' : '48px', borderBottom: `1px solid ${colors.border}`, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: colors.textSecondary, fontSize: isMobile ? '11px' : '13px' }}>24H VOL:</span>
                <span style={{ color: colors.text, fontWeight: 700, fontSize: isMobile ? '13px' : '16px' }}>$22,548</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: colors.textSecondary, fontSize: isMobile ? '11px' : '13px' }}>TXNS:</span>
                <span style={{ color: colors.text, fontWeight: 700, fontSize: isMobile ? '13px' : '16px' }}>45.9M</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div style={{ backgroundColor: colors.bg, padding: isMobile ? '8px' : '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${colors.border}`, overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch' }}>
              <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: isDark ? '#1a3a1a' : '#dcfce7', color: colors.green, whiteSpace: 'nowrap' }}>
                <Clock size={12} /> 24h <ChevronDown size={12} />
              </button>
              <div style={{ display: 'flex', backgroundColor: isDark ? '#1C1C1D' : '#f0f0f0', borderRadius: '6px', padding: '2px' }}>
                <button style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: colors.green, color: isDark ? '#000' : '#fff', whiteSpace: 'nowrap' }}>
                  <Flame size={12} /> {isMobile ? '' : 'Trending'}
                </button>
                {['5M', '1H', '6H', '24H'].map((period) => (
                  <button key={period} onClick={() => setActivePeriod(period.toLowerCase())} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', backgroundColor: activePeriod === period.toLowerCase() ? (isDark ? '#1C1C1D' : '#ddd') : 'transparent', color: activePeriod === period.toLowerCase() ? colors.text : colors.textSecondary, whiteSpace: 'nowrap' }}>
                    {period}
                  </button>
                ))}
              </div>
              {!isMobile && (
                <>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} /> Top</button>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Zap size={12} /> Gainers</button>
                  <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> New Pairs</button>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Rank By:</span>
                    <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: colors.green, display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} /> Trending 6H</button>
                    <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: isDark ? '#1C1C1D' : '#e5e5e5', color: colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}><Filter size={12} /> Filters</button>
                  </div>
                </>
              )}
            </div>

            {/* Tokenized Agents Table */}
            <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ overflowX: 'auto', minWidth: isMobile ? '100%' : 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
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
                      <tr key={agent.id} onClick={() => window.open(`https://wallet.xyz/@AGENTSCREENER`, '_blank')} style={{ cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgHover} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: colors.textSecondary, width: '24px' }}>#{index + 1}</span>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: chain?.color || '#666' }} />
                            <span style={{ fontSize: '20px' }}>{agent.avatar}</span>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ color: colors.text, fontWeight: 600 }}>{agent.name}</span>
                                <span style={{ color: colors.textSecondary }}>{agent.ticker}</span>
                                {agent.framework && FRAMEWORKS[agent.framework as keyof typeof FRAMEWORKS] && (
                                  <span style={{ backgroundColor: FRAMEWORKS[agent.framework as keyof typeof FRAMEWORKS].color + '20', color: FRAMEWORKS[agent.framework as keyof typeof FRAMEWORKS].color, padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    {FRAMEWORKS[agent.framework as keyof typeof FRAMEWORKS].icon} {FRAMEWORKS[agent.framework as keyof typeof FRAMEWORKS].name}
                                  </span>
                                )}
                              </div>
                              <div style={{ color: colors.textSecondary, fontSize: '11px' }}>{agent.fullName}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatPrice(agent.price)}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', color: colors.textSecondary }}>{agent.age}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatCompact(agent.txns)}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(agent.volume)}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatCompact(agent.makers)}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', color: agent.change5m >= 0 ? colors.green : colors.red, fontWeight: 500 }}>{agent.change5m >= 0 ? '+' : ''}{agent.change5m.toFixed(2)}%</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', color: agent.change1h >= 0 ? colors.green : colors.red, fontWeight: 500 }}>{agent.change1h >= 0 ? '+' : ''}{agent.change1h.toFixed(2)}%</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', color: agent.change6h >= 0 ? colors.green : colors.red, fontWeight: 500 }}>{agent.change6h >= 0 ? '+' : ''}{agent.change6h.toFixed(0)}%</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', color: agent.change24h >= 0 ? colors.green : colors.red, fontWeight: 500 }}>{agent.change24h >= 0 ? '+' : ''}{agent.change24h.toFixed(0)}%</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(agent.liquidity)}</td>
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>{formatNumber(agent.mcap)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Mobile Tab Views */}
            {isMobile && mobileTab === 'search' && (
              <div style={{ padding: '16px', paddingBottom: '100px' }}>
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    backgroundColor: colors.bgSecondary,
                    color: colors.text,
                    fontSize: '16px',
                    outline: 'none',
                    marginBottom: '16px',
                  }}
                />
                {searchQuery && (
                  <div>
                    <p style={{ color: colors.textSecondary, fontSize: '12px', marginBottom: '12px' }}>
                      {moltbookAgents.length} results for "{searchQuery}"
                    </p>
                    {moltbookAgents.slice(0, 20).map(agent => (
                      <div
                        key={agent.id}
                        onClick={() => setSelectedAgent(agent)}
                        style={{
                          padding: '12px',
                          borderBottom: `1px solid ${colors.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1C1C1D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🦞</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '14px' }}>{agent.name}{isVerified((agent as any).token_address || (agent as any).tokenAddress) && <span style={{ marginLeft: 4, color: "#3B82F6" }}>✓</span>}</div>
                          <div style={{ color: colors.textSecondary, fontSize: '12px' }}>{agent.handle}</div>
                        </div>
                        {agent.mcap && <div style={{ fontSize: '13px', fontWeight: 500 }}>${(agent.mcap / 1000).toFixed(0)}K</div>}
                      </div>
                    ))}
                  </div>
                )}
                {!searchQuery && (
                  <p style={{ color: colors.textSecondary, textAlign: 'center', marginTop: '40px' }}>
                    Start typing to search tokens
                  </p>
                )}
              </div>
            )}

            {isMobile && mobileTab === 'watchlist' && (
              <div style={{ padding: '0', paddingBottom: '100px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: `1px solid ${colors.border}` }}>
                  <span style={{ color: colors.textSecondary, fontSize: '14px' }}>✏️ Edit</span>
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>Watchlist ▾</span>
                  <span style={{ color: colors.textSecondary, fontSize: '14px' }}>+ New</span>
                </div>

                {watchlist.length === 0 ? (
                  <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <Star size={48} style={{ color: colors.textSecondary, marginBottom: '16px' }} />
                    <p style={{ color: colors.text, fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>No tokens saved</p>
                    <p style={{ color: colors.textSecondary, fontSize: "13px" }}>Tap ★ in token details to add</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Bar */}
                    <div style={{ display: 'flex', gap: '8px', padding: '12px 16px' }}>
                      <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ color: colors.textSecondary, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>24H Volume</div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>${formatCompact(moltbookAgents.filter(a => watchlist.includes(a.id)).reduce((sum, a) => sum + (a.volume || 0), 0))}</div>
                      </div>
                      <div style={{ flex: 1, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
                        <div style={{ color: colors.textSecondary, fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Tokens</div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{watchlist.length}</div>
                      </div>
                    </div>

                    {/* Token List */}
                    <div>
                      {moltbookAgents.filter(a => watchlist.includes(a.id)).map(agent => (
                        <div key={agent.id} onClick={() => setSelectedAgent(agent)} style={{ padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }}>
                          {/* Row 1: Icon, Name, Price, Changes */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: isDark ? '#1C1C1D' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🦞</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: '14px' }}>{agent.name}{isVerified((agent as any).token_address || (agent as any).tokenAddress) && <span style={{ marginLeft: 4, color: "#3B82F6" }}>✓</span>}</div>
                              <div style={{ color: colors.textSecondary, fontSize: '11px' }}>{(agent as any).symbol || agent.handle}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 600, fontSize: '14px' }}>{agent.price ? formatPrice(agent.price) : '$0.00'}</div>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '11px', color: (agent.change24h || 0) >= 0 ? '#22C55E' : '#EF4444' }}>24H {(agent.change24h || 0) >= 0 ? '+' : ''}{(agent.change24h || 0).toFixed(1)}%</span>
                              </div>
                            </div>
                            <button onClick={(e) => toggleWatchlist(agent.id, e)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}><Star size={18} fill="#F59E0B" color="#F59E0B" /></button>
                          </div>
                          {/* Row 2: Stats Pills */}
                          <div style={{ display: 'flex', gap: '6px', marginLeft: '42px' }}>
                            <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                              <span style={{ color: colors.textSecondary }}>LIQ </span><span style={{ color: colors.text }}>{agent.liquidity ? formatNumber(agent.liquidity) : '—'}</span>
                            </span>
                            <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                              <span style={{ color: colors.textSecondary }}>VOL </span><span style={{ color: colors.text }}>{agent.volume ? formatNumber(agent.volume) : '—'}</span>
                            </span>
                            <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}>
                              <span style={{ color: colors.textSecondary }}>MCAP </span><span style={{ color: colors.text }}>{agent.mcap ? formatNumber(agent.mcap) : '—'}</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', padding: '16px', color: colors.textSecondary, fontSize: '12px' }}>
                      Showing {watchlist.length} of {watchlist.length} tokens
                    </div>
                  </>
                )}
              </div>
            )}
            {isMobile && mobileTab === 'settings' && (
              <div style={{ padding: '16px', paddingBottom: '100px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Settings</h3>
                
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: colors.bgSecondary, 
                  borderRadius: '12px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>Dark Mode</div>
                    <div style={{ color: colors.textSecondary, fontSize: '12px' }}>Toggle theme</div>
                  </div>
                  <button
                    onClick={toggle}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: colors.text,
                      color: colors.bg,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </div>

                <div style={{ 
                  padding: '16px', 
                  backgroundColor: colors.bgSecondary, 
                  borderRadius: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>About</div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                    agentscreener - Discover AI agent tokens on Base
                  </div>
                </div>

                <div style={{ 
                  padding: '16px', 
                  backgroundColor: colors.bgSecondary, 
                  borderRadius: '12px',
                  marginBottom: '12px',
                }}>
                  <div style={{ fontWeight: 500, marginBottom: '4px' }}>Data Sources</div>
                  <div style={{ color: colors.textSecondary, fontSize: '12px' }}>
                    Clanker API • DexScreener • wallet.xyz
                  </div>
                </div>

                <div style={{ padding: "16px", backgroundColor: colors.bgSecondary, borderRadius: "12px", marginBottom: "12px" }}><div style={{ fontWeight: 500, marginBottom: "4px" }}>Agent Verification</div><div style={{ color: colors.textSecondary, fontSize: "12px", marginBottom: "12px" }}>Get a ✅ verified badge for your Clawnch agent</div><button onClick={() => window.location.href = "/verify"} style={{ width: "100%", padding: "10px 16px", borderRadius: "8px", border: "none", backgroundColor: "#3B82F6", color: "#fff", fontWeight: 500, cursor: "pointer" }}>Get Verified →</button></div><TokenSubmitForm isDark={isDark} colors={colors} />
              </div>
            )}

            {/* Mobile Home View */}
            {isMobile && mobileTab === 'home' ? (
              <>
                {/* Filter Pills - Source filter */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  padding: '8px 12px',
                  overflowX: 'auto',
                  WebkitOverflowScrolling: 'touch',
                  alignItems: 'center',
                }}>
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'trending', label: 'Trending' },
                    { key: 'verified', label: 'Verified', special: true }, 
                    { key: 'bankr', label: 'Bankr' },
                    { key: 'clawnch', label: 'Clawnch' }, { key: 'moltlaunch', label: 'Moltlaunch' },
                    { key: 'agent', label: 'Agents' },
                    { key: 'clanker', label: 'Clanker' },
                  ].map(({ key, label }: any) => (
                    <button 
                      key={key}
                      onClick={() => setSourceFilter(key as any)}
                      style={{ 
                        padding: '6px 14px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 500, 
                        cursor: 'pointer', 
                        border: sourceFilter === key ? 'none' : key === 'verified' ? '2px solid transparent' : `1px solid ${colors.border}`, borderImage: key === 'verified' && sourceFilter !== key ? 'linear-gradient(90deg, #F97316, #3B82F6) 1' : 'none',
                        backgroundColor: sourceFilter === key ? colors.text : 'transparent',
                        color: sourceFilter === key ? colors.bg : colors.textSecondary,
                        whiteSpace: 'nowrap',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
                
                {/* Stats Bar - inline compact */}
                <div style={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '8px 12px',
                }}>
                  <div style={{ 
                    padding: '6px 16px', 
                    textAlign: 'center',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                  }}>
                    <div style={{ color: colors.textSecondary, fontSize: '8px', fontWeight: 500, textTransform: 'uppercase' }}>24H VOL</div>
                    <div style={{ color: colors.text, fontWeight: 700, fontSize: '12px' }}>${formatCompact(moltbookAgents.reduce((sum, a) => sum + ((a as any).volume || 0), 0))}</div>
                  </div>
                </div>

                {/* Top 10 Section */}
                <div style={{ padding: '12px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px' }}>🔥 Top 10</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 500,
                          border: `1px solid ${colors.border}`,
                          backgroundColor: 'transparent',
                          color: colors.text,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="trending">Trending</option>
                        <option value="newest">Newest</option>
                        <option value="volume">Volume</option>
                        <option value="change">24h Change</option>
                        <option value="mcap">Market Cap</option>
                      </select>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    overflowX: 'auto', 
                    padding: '0 12px 8px',
                    WebkitOverflowScrolling: 'touch',
                  }}>
                    {[...moltbookAgents]
                      .sort((a, b) => sortBy === 'volume' ? (b.volume || 0) - (a.volume || 0) : (b.mcap || 0) - (a.mcap || 0))
                      .slice(0, 10)
                      .map((agent, i) => (
                        <div
                          key={agent.id}
                          onClick={() => setSelectedAgent(agent)}
                          style={{
                            minWidth: '120px',
                            padding: '10px',
                            borderRadius: '12px',
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <span style={{ 
                              fontSize: '10px', 
                              fontWeight: 700, 
                              color: i < 3 ? '#F59E0B' : colors.textSecondary,
                            }}>
                              #{i + 1}
                            </span>
                            <div style={{ 
                              width: '20px', 
                              height: '20px', 
                              borderRadius: '6px', 
                              backgroundColor: isDark ? '#1C1C1D' : '#e0e0e0', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '10px',
                            }}>
                              🦞
                            </div>
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {agent.name}{isVerified((agent as any).token_address || (agent as any).tokenAddress) && <span style={{ marginLeft: "4px", color: "#3B82F6" }}>✓</span>}
                          </div>
                          <div style={{ fontSize: '10px', color: colors.textSecondary, marginBottom: '4px' }}>
                            ${(agent as any).symbol || '???'}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>
                              {agent.price ? formatPrice(agent.price) : '$0'}
                            </span>
                            <span style={{ 
                              fontSize: '9px', 
                              fontWeight: 500,
                              color: (agent.change24h || 0) >= 0 ? '#22C55E' : '#EF4444',
                            }}>
                              {(agent.change24h || 0) >= 0 ? '↑' : '↓'}{Math.abs(agent.change24h || 0).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </>
            ) : !isMobile ? (
              <>
                {/* Desktop Stats Bar */}
                <div style={{ backgroundColor: colors.bgSecondary, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: colors.textSecondary }}>24H VOLUME:</span>
                    <span style={{ color: colors.text, fontWeight: 700, fontSize: '16px' }}>${formatCompact(moltbookAgents.reduce((sum, a) => sum + ((a as any).volume || 0), 0))}</span>
                  </div>
                </div>

                {/* Desktop Filter Bar */}
                <div style={{ backgroundColor: colors.bg, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', backgroundColor: isDark ? '#1C1C1D' : '#f0f0f0', borderRadius: '6px', padding: '2px' }}>
                    <button style={{ padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: isDark ? '#1C1C1D' : '#ddd', color: colors.text }}>
                      All Agents
                      <span style={{ backgroundColor: colors.text + '20', padding: '1px 6px', borderRadius: '8px', fontSize: '10px' }}>{moltbookAgents.length}</span>
                    </button>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Sorted by:</span>
                    <button style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: 'none', backgroundColor: 'transparent', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '4px' }}>🏆 Karma</button>
                  </div>
                </div>
              </>
            ) : null}

            {/* Moltbook Agents List - only show on home tab for mobile */}
            {(mobileTab === 'home' || !isMobile) && <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: isMobile ? '80px' : '0' }}>
              {/* Mobile DexScreener-style View */}
              {isMobile && mobileTab === 'home' ? (
                <div>
                  {moltbookAgents.map((agent) => (
                    <div 
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      style={{
                        padding: '6px 12px',
                        borderBottom: `1px solid ${colors.border}`,
                        cursor: 'pointer',
                      }}
                    >
                      {/* Single compact row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Avatar - Lobster */}
                        <div style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          backgroundColor: '#1C1C1D', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '14px',
                          flexShrink: 0,
                        }}>
                          🦞
                        </div>
                        
                        {/* Name & Handle */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 600, color: colors.text, fontSize: '13px' }}>{agent.name}{isVerified((agent as any).token_address || (agent as any).tokenAddress) && <span style={{ marginLeft: 4, color: "#3B82F6" }}>✓</span>}</span>
                            {(agent as any).source && (agent as any).source !== 'unknown' && (
                              <span style={{ 
                                fontSize: '8px', 
                                fontWeight: 600, 
                                padding: '1px 4px', 
                                borderRadius: '4px',
                                backgroundColor: (agent as any).source === 'bankr' ? '#0052FF' : 
                                                 (agent as any).source === 'agent' ? '#8B5CF6' : 
                                                 (agent as any).source === 'moltbook' ? '#EF4444' : '#F59E0B',
                                color: '#fff',
                                textTransform: 'uppercase',
                              }}>
                                {(agent as any).source}
                              </span>
                            )}
                          </div>
                          <div style={{ color: colors.textSecondary, fontSize: '11px' }}>
                            @{agent.handle?.replace('@', '')}
                          </div>
                        </div>
                        
                        {/* Price & Changes */}
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontWeight: 600, color: colors.text, fontSize: '13px' }}>
                            {agent.price ? formatPrice(agent.price) : '$0.00'}
                          </div>
                          <div style={{ fontSize: '10px' }}>
                            <span style={{ color: colors.textSecondary }}>24H </span>
                            <span style={{ 
                              color: (agent.change24h || 0) >= 0 ? colors.green : colors.red, 
                              fontWeight: 600 
                            }}>
                              {agent.change24h ? (agent.change24h >= 0 ? '+' : '') + agent.change24h.toFixed(0) + '%' : '0%'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats row */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '4px',
                        marginTop: '4px',
                        marginLeft: '36px',
                        fontSize: '9px',
                        color: colors.textSecondary,
                      }}>
                        <span style={{ border: `1px solid ${colors.border}`, padding: '1px 6px', borderRadius: '8px' }}>
                          LIQ <span style={{ color: colors.text }}>{agent.liquidity ? formatNumber(agent.liquidity) : '—'}</span>
                        </span>
                        <span style={{ border: `1px solid ${colors.border}`, padding: '1px 6px', borderRadius: '8px' }}>
                          VOL <span style={{ color: colors.text }}>{agent.volume ? formatNumber(agent.volume) : '—'}</span>
                        </span>
                        <span style={{ border: `1px solid ${colors.border}`, padding: '1px 6px', borderRadius: '8px' }}>
                          MCAP <span style={{ color: colors.text }}>{agent.mcap ? formatNumber(agent.mcap) : '—'}</span>
                        </span>
                      </div>
                      
                      {/* TG row - shows if agent has TG linked */}
                  {(agent as any).tg_group_link && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '6px',
                          marginLeft: '36px',
                          fontSize: '10px',
                        }}>
                          <span style={{ color: colors.textSecondary }}>💬</span>
                          <span style={{ color: colors.textSecondary }}>
                            {(agent as any).tg_member_count || 0} members
                          </span>
                          {(agent as any).tg_last_active && (
                            <span style={{ color: colors.textSecondary }}>
                              • Active {(agent as any).tg_last_active}
                            </span>
                          )}
                          <a 
                            href={(agent as any).tg_group_link} 
                        target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ 
                              color: '#3B82F6', 
                              textDecoration: 'none',
                              marginLeft: 'auto',
                            }}
                          >
                            Join →
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Desktop Table View */
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['AGENT', 'KARMA', 'OWNER', 'PRICE', 'AGE', 'VOLUME', 'LIQUIDITY', 'MCAP', '24H', 'ACTION'].map((header, i) => (
                        <th key={header} style={{ 
                          padding: '10px 12px', 
                          textAlign: i === 0 ? 'left' : (i === 9 ? 'center' : 'right'), 
                          color: colors.textSecondary, 
                          fontSize: '11px', 
                          fontWeight: 500, 
                          textTransform: 'uppercase', 
                          borderBottom: `1px solid ${colors.border}`, 
                          position: 'sticky', 
                          top: 0, 
                          backgroundColor: colors.bg 
                        }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {moltbookAgents.map((agent, index) => (
                      <tr 
                        key={agent.id} 
                        style={{ cursor: 'pointer' }} 
                        onClick={() => window.open(`https://wallet.xyz/@AGENTSCREENER`, '_blank')}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgHover} 
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* AGENT */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ 
                              backgroundColor: index < 3 ? '#F59E0B' : (isDark ? '#1C1C1D' : '#f0f0f0'),
                              color: index < 3 ? '#000' : colors.textSecondary,
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700,
                              minWidth: '24px',
                              textAlign: 'center',
                            }}>
                              {index + 1}
                            </span>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%', 
                              backgroundColor: '#1C1C1D', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '16px',
                              flexShrink: 0,
                            }}>
                              🦞
                            </div>
                            <span style={{ fontWeight: 600, color: colors.text }}>{agent.name}{isVerified((agent as any).token_address || (agent as any).tokenAddress) && <span style={{ marginLeft: 4, color: "#3B82F6" }}>✓</span>}</span>
                          </div>
                        </td>
                        {/* KARMA */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right' }}>
                          <span style={{ color: '#EF4444', fontWeight: 700 }}>{agent.karma}</span>
                        </td>
                        {/* OWNER */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right' }}>
                          <a 
                            href={`https://twitter.com/${agent.handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ 
                              color: '#1DA1F2', 
                              textDecoration: 'none',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              justifyContent: 'flex-end',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Twitter size={12} />
                            {agent.handle}
                          </a>
                        </td>
                        {/* PRICE */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>
                          {agent.price ? formatPrice(agent.price) : '—'}
                        </td>
                        {/* AGE */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', color: colors.textSecondary }}>
                          {agent.age ? agent.age : '—'}
                        </td>
                        {/* VOLUME */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>
                          {agent.volume ? formatNumber(agent.volume) : '—'}
                        </td>
                        {/* LIQUIDITY */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>
                          {agent.liquidity ? formatNumber(agent.liquidity) : '—'}
                        </td>
                        {/* MCAP */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right', fontFamily: 'monospace' }}>
                          {agent.mcap ? formatNumber(agent.mcap) : '—'}
                        </td>
                        {/* 24H */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'right' }}>
                          {agent.change24h !== null ? (
                            <span style={{ color: agent.change24h >= 0 ? colors.green : colors.red, fontWeight: 500 }}>
                              {agent.change24h >= 0 ? '+' : ''}{agent.change24h.toFixed(1)}%
                            </span>
                          ) : '—'}
                        </td>
                        {/* ACTION */}
                        <td style={{ padding: '12px', borderBottom: `1px solid ${isDark ? '#1C1C1D' : '#f0f0f0'}`, textAlign: 'center' }}>
                          <a
                            href={`https://wallet.xyz/@AGENTSCREENER`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              padding: '6px 16px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: 'none',
                              backgroundColor: '#0052FF',
                              color: '#fff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textDecoration: 'none',
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Trade
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>}
          </>
        )}
      </div>
      
      {/* Mobile Bottom Nav */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.bg,
          borderTop: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0 20px 0',
          zIndex: 1000,
        }}>
          {[
            { key: 'home', icon: Home, label: 'Home' },
            { key: 'search', icon: Search, label: 'Search' },
            { key: 'watchlist', icon: Star, label: 'Watchlist' },
            { key: 'settings', icon: Settings, label: 'Settings' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setMobileTab(key as any)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 12px',
                color: mobileTab === key ? colors.text : colors.textSecondary,
                opacity: mobileTab === key ? 1 : 0.6,
              }}
            >
              <Icon size={20} strokeWidth={mobileTab === key ? 2.5 : 1.5} />
              <span style={{ fontSize: '10px', fontWeight: mobileTab === key ? 600 : 400 }}>{label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Token Detail Modal */}
      {selectedAgent && (
        <>
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedAgent(null)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              zIndex: 1001,
              animation: 'fadeIn 0.2s ease-out',
            }}
          />
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
          {/* Modal - Half screen */}
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: isDark 
              ? 'rgba(20,20,20,0.85)'
              : 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            zIndex: 1002,
            maxHeight: '50vh',
            overflow: 'auto',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            padding: '16px',
            paddingBottom: '32px',
            animation: 'slideUp 0.3s ease-out',
          }}>
            {/* Handle bar */}
            <div style={{ 
              width: '36px', 
              height: '4px', 
              backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', 
              borderRadius: '2px', 
              margin: '0 auto 12px' 
            }} />

            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '10px', 
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '20px',
              }}>
                🦞
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{selectedAgent.name}{isVerified((selectedAgent as any).token_address || (selectedAgent as any).tokenAddress) && <span style={{ marginLeft: 4, color: "#3B82F6" }}>✓</span>}</span>
                  {selectedAgent.source && selectedAgent.source !== 'unknown' && (
                    <span style={{ 
                      fontSize: '8px', 
                      fontWeight: 600, 
                      padding: '2px 5px', 
                      borderRadius: '4px',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                      color: colors.textSecondary,
                      textTransform: 'uppercase',
                    }}>
                      {selectedAgent.source}
                    </span>
                  )}
                </div>
                <div style={{ color: colors.textSecondary, fontSize: '11px' }}>
                  ${selectedAgent.symbol || selectedAgent.handle?.replace('@', '')}
                </div>
              </div>
              <button onClick={(e) => toggleWatchlist(selectedAgent.id, e)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}><Star size={20} fill={watchlist.includes(selectedAgent.id) ? "#F59E0B" : "none"} color={watchlist.includes(selectedAgent.id) ? "#F59E0B" : colors.textSecondary} /></button>
              <button onClick={() => setSelectedAgent(null)} 
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  color: colors.textSecondary,
                  fontSize: '16px',
                  cursor: 'pointer',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ×
              </button>
            </div>

            {/* Price Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '22px', fontWeight: 700 }}>
                {selectedAgent.price ? formatPrice(selectedAgent.price) : '$0.00'}
              </span>
              <span style={{ 
                fontSize: '11px', 
                color: selectedAgent.change24h >= 0 ? '#22C55E' : '#EF4444',
                fontWeight: 500,
              }}>
                {selectedAgent.change24h >= 0 ? '↑' : '↓'} {selectedAgent.change24h ? Math.abs(selectedAgent.change24h).toFixed(1) + '%' : '0%'}
              </span>
            </div>

            {/* Mini Stats Row */}
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}>
              {[
                { label: 'MCap', value: selectedAgent.mcap ? formatNumber(selectedAgent.mcap) : '—' },
                { label: 'Vol', value: selectedAgent.volume ? formatNumber(selectedAgent.volume) : '—' },
                { label: 'Liq', value: selectedAgent.liquidity ? formatNumber(selectedAgent.liquidity) : '—' },
                { label: 'Karma', value: selectedAgent.karma },
              ].map(stat => (
                <div key={stat.label} style={{ 
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  padding: '6px 10px', 
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                }}>
                  <span style={{ color: colors.textSecondary, fontSize: '9px', marginRight: '4px' }}>{stat.label}</span>
                  <span style={{ fontWeight: 600, fontSize: '11px' }}>{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Mini Links Row */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {[
                { label: 'Chart', url: `https://dexscreener.com/base/${selectedAgent.tokenAddress}` },
                { label: 'Scan', url: `https://basescan.org/token/${selectedAgent.tokenAddress}` },
                { label: 'Clanker', url: `https://clanker.world/clanker/${selectedAgent.tokenAddress}` },
              ].map(link => (
                <button
                  key={link.label}
                  onClick={() => window.open(link.url, '_blank')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    background: 'transparent',
                    color: colors.textSecondary,
                    fontSize: '10px',
                    cursor: 'pointer',
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>
            {/* Copy CA Button */}<button onClick={() => { navigator.clipboard.writeText(selectedAgent.tokenAddress || selectedAgent.token_address || ""); alert("Copied!"); }} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.15)", background: "transparent", color: colors.text, fontWeight: 600, fontSize: "13px", cursor: "pointer", marginBottom: "8px" }}>📋 Copy Contract Address</button>

            {/* Trade Button */}
            <button
              onClick={() => window.open(`https://wallet.xyz/@AGENTSCREENER`, '_blank')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                color: colors.text,
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <span>Trade on wallet.xyz →</span>
                <span style={{ fontSize: '10px', opacity: 0.7, fontWeight: 400 }}>the fastest terminal on base • save up to 40% on fees</span>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// =====================
// MAIN APP
// =====================
export default function AgentDiscovery() {
  const [isDark, setIsDark] = useState(true);
  const toggle = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <ScreenerPage />
    </ThemeContext.Provider>
  );
}

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import TokenSubmitForm from './TokenSubmitForm';
import { 
  Search, 
  Sun,
  Moon,
  Twitter,
  Home,
  Star,
  Settings,
} from 'lucide-react';
import { useAgents, useStats } from './hooks/useAgents';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

// Supabase client for CA search
const supabaseClient = createClient(
  'https://edspwhxvlqwvylrgiygz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc3B3aHh2bHF3dnlscmdpeWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDk0NTQsImV4cCI6MjA4NTM4NTQ1NH0.f6AuOz7HfkMFGf-RuoRP3BJofxzPd1DXKsQd1MFfmUA'
);

// Price Chart Component using GeckoTerminal API
interface ChartDataPoint {
  time: number;
  price: number;
  volume: number;
}

function PriceChart({ tokenAddress, isDark }: { tokenAddress: string; isDark: boolean }) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [priceChange, setPriceChange] = useState<number>(0);

  const fetchChartData = useCallback(async () => {
    if (!tokenAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // First get the pool address from token via our proxy
      const poolsRes = await fetch(
        `/api/chart?token=${tokenAddress}`
      );
      const poolsData = await poolsRes.json();
      
      if (!poolsData.data || poolsData.data.length === 0) {
        setError('No pool found');
        setLoading(false);
        return;
      }
      
      // Get the first (most liquid) pool
      const poolAddress = poolsData.data[0].attributes.address;
      
      // Fetch OHLCV data via our proxy
      const ohlcvRes = await fetch(
        `/api/chart?pool=${poolAddress}&timeframe=${timeframe}`
      );
      const ohlcvData = await ohlcvRes.json();
      
      if (!ohlcvData.data?.attributes?.ohlcv_list) {
        setError('No chart data');
        setLoading(false);
        return;
      }
      
      // Transform data - OHLCV format: [timestamp, open, high, low, close, volume]
      const transformed: ChartDataPoint[] = ohlcvData.data.attributes.ohlcv_list
        .map((candle: number[]) => ({
          time: candle[0] * 1000,
          price: candle[4], // close price
          volume: candle[5],
        }))
        .reverse(); // API returns newest first
      
      setChartData(transformed);
      
      // Calculate price change
      if (transformed.length >= 2) {
        const firstPrice = transformed[0].price;
        const lastPrice = transformed[transformed.length - 1].price;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        setPriceChange(change);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Chart fetch error:', err);
      setError('Failed to load chart');
      setLoading(false);
    }
  }, [tokenAddress, timeframe]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === '7d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    if (price < 0.00001) return `$${price.toFixed(10)}`;
    if (price < 0.001) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(2)}`;
  };

  const chartColor = priceChange >= 0 ? '#22C55E' : '#EF4444';
  const bgColor = isDark ? '#141414' : '#f5f5f5';
  const textColor = isDark ? '#fff' : '#000';
  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  return (
    <div style={{ 
      background: bgColor,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      {/* Timeframe Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['1h', '6h', '24h', '7d'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: timeframe === tf 
                ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')
                : 'transparent',
              color: timeframe === tf ? textColor : textSecondary,
              transition: 'all 0.2s',
            }}
          >
            {tf.toUpperCase()}
          </button>
        ))}
        
        {/* Price change badge */}
        {!loading && !error && (
          <div style={{ 
            marginLeft: 'auto', 
            fontSize: '12px', 
            fontWeight: 600,
            color: chartColor,
            display: 'flex',
            alignItems: 'center',
          }}>
            {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div style={{ height: '280px', width: '100%' }}>
        {loading ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: textSecondary,
            fontSize: '13px',
          }}>
            Loading chart...
          </div>
        ) : error ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: textSecondary,
            fontSize: '13px',
          }}>
            {error}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${priceChange >= 0 ? 'green' : 'red'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                tickFormatter={formatTime}
                axisLine={false}
                tickLine={false}
                tick={{ fill: textSecondary, fontSize: 10 }}
                minTickGap={50}
              />
              <YAxis 
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: textSecondary, fontSize: 10 }}
                tickFormatter={(val) => formatPrice(val).replace('$', '')}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1a1a1a' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: textColor,
                }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value: number) => [formatPrice(value), 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#gradient-${priceChange >= 0 ? 'green' : 'red'})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// Theme context
const ThemeContext = createContext<{ isDark: boolean; toggle: () => void }>({ isDark: true, toggle: () => {} });

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
  useStats(); // hook called but stats displayed inline
  const onPullRefresh = async () => { setIsRefreshing(true); await refetch(); setIsRefreshing(false); };
  
  // Search by contract address
  const [searchedAgent, setSearchedAgent] = useState<any>(null);
  useEffect(() => {
    const searchByCA = async () => {
      if (searchQuery.startsWith('0x') && searchQuery.length >= 40) {
        try {
          const { data } = await supabaseClient
            .from('agents')
            .select('*')
            .ilike('token_address', searchQuery)
            .limit(1);
          if (data && data.length > 0) {
            setSearchedAgent(data[0]);
          } else {
            setSearchedAgent(null);
          }
        } catch (err) {
          console.error('CA search error:', err);
          setSearchedAgent(null);
        }
      } else {
        setSearchedAgent(null);
      }
    };
    const debounce = setTimeout(searchByCA, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);
  
  // Map Supabase data to UI format (fallback to hardcoded data while loading)
  let allAgents: any[] = (loading && !isRefreshing) || dbAgents.length === 0 
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

  // Include searched agent from CA search
  if (searchedAgent && searchQuery.startsWith('0x')) {
    const alreadyIncluded = allAgents.some(a => a.id === searchedAgent.id);
    if (!alreadyIncluded) {
      allAgents = [{
        id: searchedAgent.id,
        name: searchedAgent.name,
        karma: searchedAgent.karma,
        handle: searchedAgent.handle,
        avatar: searchedAgent.avatar,
        color: searchedAgent.color,
        lastActive: searchedAgent.last_active,
        age: searchedAgent.tokenized_at ? '3d' : null,
        tokenAddress: searchedAgent.token_address,
        mcap: searchedAgent.mcap,
        price: searchedAgent.price,
        change24h: searchedAgent.change_24h,
        volume: searchedAgent.volume_24h,
        liquidity: searchedAgent.liquidity,
        source: searchedAgent.source || 'unknown',
        symbol: searchedAgent.symbol,
        created_at: searchedAgent.created_at,
        trending_score: searchedAgent.trending_score || 0,
      }, ...allAgents];
    }
  }

  // Filter by search and source
  const moltbookAgents = allAgents.filter(agent => {
    const agentSource = (agent as any).source || 'unknown';
    const tokenAddr = (agent as any).token_address || (agent as any).tokenAddress;
    
    // Bypass filters for CA search - show the matched agent
    if (searchQuery.startsWith('0x') && searchQuery.length >= 40) {
      return tokenAddr?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
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
           agent.handle.toLowerCase().includes(query) ||
           (tokenAddr || '').toLowerCase().includes(query);
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

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
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
            animation: 'marquee 80s linear infinite',
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
            /* Desktop: Search + Brand */
            <>
              {/* Desktop Search */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: isDark ? '#1C1C1D' : '#f0f0f0',
                borderRadius: '6px',
                padding: '8px 14px',
                minWidth: '280px',
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
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0052FF' }}>bankr</span>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
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
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1C1C1D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', overflow: 'hidden' }}>
                          {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                            ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : '🦞'}
                        </div>
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
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: isDark ? '#1C1C1D' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', overflow: 'hidden' }}>
                              {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                                ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '🦞'}
                            </div>
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
                              overflow: 'hidden',
                            }}>
                              {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                                ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '🦞'}
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
                {/* Desktop Stats Bar - Enhanced */}
                <div style={{ 
                  backgroundColor: colors.bgSecondary, 
                  padding: '16px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderBottom: `1px solid ${colors.border}`,
                }}>
                  {/* Stats Pills */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    }}>
                      <span style={{ color: colors.textSecondary, fontSize: '11px', textTransform: 'uppercase', fontWeight: 500 }}>24H Volume:</span>
                      <span style={{ color: colors.green, fontWeight: 700, fontSize: '16px' }}>${formatCompact(moltbookAgents.reduce((sum, a) => sum + ((a as any).volume || 0), 0))}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Filter Pills */}
                <div style={{ 
                  backgroundColor: colors.bg, 
                  padding: '12px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  borderBottom: `1px solid ${colors.border}`,
                  flexWrap: 'wrap',
                }}>
                  {/* Source Filter Pills */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[
                      { key: 'all', label: 'All Agents' },
                      { key: 'trending', label: '🔥 Trending' },
                      { key: 'verified', label: '✓ Verified', special: true },
                      { key: 'bankr', label: 'Bankr' },
                      { key: 'clawnch', label: 'Clawnch' },
                      { key: 'moltlaunch', label: 'Moltlaunch' },
                      { key: 'clanker', label: 'Clanker' },
                    ].map(({ key, label, special }: any) => (
                      <button 
                        key={key}
                        onClick={() => setSourceFilter(key as any)}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: 500, 
                          cursor: 'pointer', 
                          border: sourceFilter === key ? 'none' : special ? '2px solid transparent' : `1px solid ${colors.border}`,
                          borderImage: special && sourceFilter !== key ? 'linear-gradient(90deg, #F97316, #3B82F6) 1' : 'none',
                          backgroundColor: sourceFilter === key ? colors.text : 'transparent',
                          color: sourceFilter === key ? colors.bg : colors.textSecondary,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Sort Dropdown */}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Sorted by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 500,
                        border: `1px solid ${colors.border}`,
                        backgroundColor: isDark ? '#1C1C1D' : '#f5f5f5',
                        color: colors.text,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="trending">🔥 Trending</option>
                      <option value="newest">🆕 Newest</option>
                      <option value="volume">📊 Volume</option>
                      <option value="change">📈 24h Change</option>
                      <option value="mcap">💰 Market Cap</option>
                    </select>
                  </div>
                </div>

                {/* Desktop Top 10 Section */}
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏆 Top 10 by {sortBy === 'volume' ? 'Volume' : sortBy === 'mcap' ? 'Market Cap' : sortBy === 'change' ? '24h Change' : 'Karma'}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    overflowX: 'auto', 
                    paddingBottom: '8px',
                    WebkitOverflowScrolling: 'touch',
                  }}>
                    {[...moltbookAgents]
                      .sort((a, b) => sortBy === 'volume' ? (b.volume || 0) - (a.volume || 0) : sortBy === 'mcap' ? (b.mcap || 0) - (a.mcap || 0) : sortBy === 'change' ? (b.change24h || 0) - (a.change24h || 0) : (b.karma || 0) - (a.karma || 0))
                      .slice(0, 10)
                      .map((agent, i) => (
                        <div
                          key={agent.id}
                          onClick={() => setSelectedAgent(agent)}
                          style={{
                            minWidth: '180px',
                            padding: '16px',
                            borderRadius: '16px',
                            background: isDark 
                              ? i < 3 
                                ? `linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)`
                                : 'rgba(255,255,255,0.03)'
                              : i < 3 
                                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
                                : 'rgba(0,0,0,0.02)',
                            border: `1px solid ${i < 3 ? 'rgba(249, 115, 22, 0.3)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Rank + Avatar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ 
                              fontSize: '14px', 
                              fontWeight: 800, 
                              color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : colors.textSecondary,
                              minWidth: '24px',
                            }}>
                              #{i + 1}
                            </span>
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '10px', 
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '18px',
                              overflow: 'hidden',
                            }}>
                              {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                                ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '🦞'}
                            </div>
                            {/* Source Badge */}
                            {(agent as any).source && (agent as any).source !== 'unknown' && (
                              <span style={{ 
                                fontSize: '9px', 
                                fontWeight: 600, 
                                padding: '3px 6px', 
                                borderRadius: '4px',
                                backgroundColor: (agent as any).source === 'bankr' ? '#0052FF' : 
                                               (agent as any).source === 'clawnch' ? '#F59E0B' : 
                                               (agent as any).source === 'moltlaunch' ? '#EF4444' : '#8B5CF6',
                                color: '#fff',
                                textTransform: 'uppercase',
                              }}>
                                {(agent as any).source}
                              </span>
                            )}
                          </div>
                          {/* Name */}
                          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {agent.name}
                            {isVerified((agent as any).token_address || (agent as any).tokenAddress) && <span style={{ marginLeft: '6px', color: '#3B82F6' }}>✓</span>}
                          </div>
                          {/* Symbol */}
                          <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '12px' }}>
                            ${(agent as any).symbol || '???'}
                          </div>
                          {/* Price + Change */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700 }}>
                              {agent.price ? formatPrice(agent.price) : '$0'}
                            </span>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: 600,
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: (agent.change24h || 0) >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: (agent.change24h || 0) >= 0 ? '#22C55E' : '#EF4444',
                            }}>
                              {(agent.change24h || 0) >= 0 ? '↑' : '↓'}{Math.abs(agent.change24h || 0).toFixed(1)}%
                            </span>
                          </div>
                          {/* Stats */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontSize: '10px', 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            }}>
                              <span style={{ color: colors.textSecondary }}>VOL </span>
                              <span style={{ color: colors.text, fontWeight: 600 }}>{agent.volume ? formatNumber(agent.volume) : '—'}</span>
                            </span>
                            <span style={{ 
                              fontSize: '10px', 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            }}>
                              <span style={{ color: colors.textSecondary }}>LIQ </span>
                              <span style={{ color: colors.text, fontWeight: 600 }}>{agent.liquidity ? formatNumber(agent.liquidity) : '—'}</span>
                            </span>
                          </div>
                        </div>
                      ))}
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
                          overflow: 'hidden',
                        }}>
                          {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                            ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : '🦞'}
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
                /* Desktop Enhanced Table View */
                <div style={{ padding: '0 24px 24px' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                      <tr>
                        {['#', 'AGENT', 'SOURCE', 'KARMA', 'OWNER', 'PRICE', 'VOLUME', 'LIQUIDITY', 'MCAP', '24H', 'ACTION'].map((header, i) => (
                          <th key={header} style={{ 
                            padding: '12px 16px', 
                            textAlign: i === 0 || i === 1 || i === 2 ? 'left' : (i === 10 ? 'center' : 'right'), 
                            color: colors.textSecondary, 
                            fontSize: '10px', 
                            fontWeight: 600, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.5px',
                            position: 'sticky', 
                            top: 0, 
                            backgroundColor: colors.bg,
                            zIndex: 10,
                          }}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {moltbookAgents.map((agent, index) => (
                        <tr 
                          key={agent.id} 
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                          }} 
                          onClick={() => setSelectedAgent(agent)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                            e.currentTarget.style.transform = 'scale(1.005)';
                          }} 
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {/* RANK */}
                          <td style={{ 
                            padding: '16px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderTopLeftRadius: '12px',
                            borderBottomLeftRadius: '12px',
                          }}>
                            <span style={{ 
                              backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                              color: index < 3 ? '#000' : colors.textSecondary,
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'inline-block',
                              minWidth: '32px',
                              textAlign: 'center',
                            }}>
                              {index + 1}
                            </span>
                          </td>
                          {/* AGENT */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '10px', 
                                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '20px',
                                flexShrink: 0,
                                overflow: 'hidden',
                              }}>
                                {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                                  ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : '🦞'}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: 700, color: colors.text, fontSize: '14px' }}>{agent.name}</span>
                                  {isVerified((agent as any).token_address || (agent as any).tokenAddress) && <span style={{ color: '#3B82F6', fontSize: '14px' }}>✓</span>}
                                </div>
                                <div style={{ color: colors.textSecondary, fontSize: '12px' }}>${(agent as any).symbol || '???'}</div>
                              </div>
                            </div>
                          </td>
                          {/* SOURCE */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          }}>
                            {(agent as any).source && (agent as any).source !== 'unknown' ? (
                              <span style={{ 
                                fontSize: '10px', 
                                fontWeight: 600, 
                                padding: '4px 8px', 
                                borderRadius: '6px',
                                backgroundColor: (agent as any).source === 'bankr' ? '#0052FF' : 
                                               (agent as any).source === 'clawnch' ? '#F59E0B' : 
                                               (agent as any).source === 'moltlaunch' ? '#EF4444' :
                                               (agent as any).source === 'clanker' ? '#8B5CF6' : '#6B7280',
                                color: '#fff',
                                textTransform: 'uppercase',
                              }}>
                                {(agent as any).source}
                              </span>
                            ) : <span style={{ color: colors.textSecondary }}>—</span>}
                          </td>
                          {/* KARMA */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right' 
                          }}>
                            <span style={{ 
                              color: '#EF4444', 
                              fontWeight: 700,
                              fontSize: '14px',
                            }}>{agent.karma}</span>
                          </td>
                          {/* OWNER */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right' 
                          }}>
                            <a 
                              href={`https://twitter.com/${agent.handle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ 
                                color: '#1DA1F2', 
                                textDecoration: 'none',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(29, 161, 242, 0.1)',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Twitter size={12} />
                              {agent.handle}
                            </a>
                          </td>
                          {/* PRICE */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right', 
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}>
                            {agent.price ? formatPrice(agent.price) : '—'}
                          </td>
                          {/* VOLUME */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right', 
                          }}>
                            <span style={{ 
                              fontSize: '12px', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              fontWeight: 500,
                            }}>
                              {agent.volume ? formatNumber(agent.volume) : '—'}
                            </span>
                          </td>
                          {/* LIQUIDITY */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right', 
                          }}>
                            <span style={{ 
                              fontSize: '12px', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              fontWeight: 500,
                            }}>
                              {agent.liquidity ? formatNumber(agent.liquidity) : '—'}
                            </span>
                          </td>
                          {/* MCAP */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right', 
                          }}>
                            <span style={{ 
                              fontSize: '12px', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              fontWeight: 600,
                            }}>
                              {agent.mcap ? formatNumber(agent.mcap) : '—'}
                            </span>
                          </td>
                          {/* 24H */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right' 
                          }}>
                            {agent.change24h !== null ? (
                              <span style={{ 
                                color: agent.change24h >= 0 ? '#22C55E' : '#EF4444', 
                                fontWeight: 600,
                                fontSize: '13px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: agent.change24h >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              }}>
                                {agent.change24h >= 0 ? '+' : ''}{agent.change24h.toFixed(1)}%
                              </span>
                            ) : '—'}
                          </td>
                          {/* ACTION */}
                          <td style={{ 
                            padding: '16px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderTopRightRadius: '12px',
                            borderBottomRightRadius: '12px',
                            textAlign: 'center' 
                          }}>
                            <a
                              href={`https://wallet.xyz/@AGENTSCREENER`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: 'none',
                                background: 'linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)',
                                color: '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              Trade
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>}
          </>
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
          {/* Modal - Fullscreen */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark 
              ? '#0D0D0D'
              : '#fafafa',
            zIndex: 1002,
            overflow: 'auto',
            padding: '16px',
            paddingTop: isMobile ? '16px' : '24px',
            animation: 'slideUp 0.3s ease-out',
          }}>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <button onClick={() => setSelectedAgent(null)} 
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  color: colors.text,
                  fontSize: '18px',
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px',
                }}
              >
                ←
              </button>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '22px',
                overflow: 'hidden',
              }}>
                {(selectedAgent as any).avatar && (selectedAgent as any).avatar.startsWith && (selectedAgent as any).avatar.startsWith('http') 
                  ? <img src={(selectedAgent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '🦞'}
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

            {/* Custom Price Chart */}
            <PriceChart 
              tokenAddress={selectedAgent.tokenAddress || selectedAgent.token_address} 
              isDark={isDark} 
            />

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
                { label: 'Chart', url: `https://wallet.xyz/@AGENTSCREENER` },
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
              Trade on wallet.xyz →
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


        .reverse(); // API returns newest first
      
      setChartData(transformed);
      
      // Calculate price change
      if (transformed.length >= 2) {
        const firstPrice = transformed[0].price;
        const lastPrice = transformed[transformed.length - 1].price;
        const change = ((lastPrice - firstPrice) / firstPrice) * 100;
        setPriceChange(change);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Chart fetch error:', err);
      setError('Failed to load chart');
      setLoading(false);
    }
  }, [tokenAddress, timeframe]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === '7d') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatPrice = (price: number) => {
    if (price < 0.00001) return `$${price.toFixed(10)}`;
    if (price < 0.001) return `$${price.toFixed(8)}`;
    if (price < 1) return `$${price.toFixed(6)}`;
    return `$${price.toFixed(2)}`;
  };

  const chartColor = priceChange >= 0 ? '#22C55E' : '#EF4444';
  const bgColor = isDark ? '#141414' : '#f5f5f5';
  const textColor = isDark ? '#fff' : '#000';
  const textSecondary = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

  return (
    <div style={{ 
      background: bgColor,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      {/* Timeframe Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['1h', '6h', '24h', '7d'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              background: timeframe === tf 
                ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)')
                : 'transparent',
              color: timeframe === tf ? textColor : textSecondary,
              transition: 'all 0.2s',
            }}
          >
            {tf.toUpperCase()}
          </button>
        ))}
        
        {/* Price change badge */}
        {!loading && !error && (
          <div style={{ 
            marginLeft: 'auto', 
            fontSize: '12px', 
            fontWeight: 600,
            color: chartColor,
            display: 'flex',
            alignItems: 'center',
          }}>
            {priceChange >= 0 ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div style={{ height: '280px', width: '100%' }}>
        {loading ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: textSecondary,
            fontSize: '13px',
          }}>
            Loading chart...
          </div>
        ) : error ? (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: textSecondary,
            fontSize: '13px',
          }}>
            {error}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${priceChange >= 0 ? 'green' : 'red'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="time" 
                tickFormatter={formatTime}
                axisLine={false}
                tickLine={false}
                tick={{ fill: textSecondary, fontSize: 10 }}
                minTickGap={50}
              />
              <YAxis 
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: textSecondary, fontSize: 10 }}
                tickFormatter={(val) => formatPrice(val).replace('$', '')}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  background: isDark ? '#1a1a1a' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: textColor,
                }}
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={(value: number) => [formatPrice(value), 'Price']}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2}
                fill={`url(#gradient-${priceChange >= 0 ? 'green' : 'red'})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// Theme context
const ThemeContext = createContext<{ isDark: boolean; toggle: () => void }>({ isDark: true, toggle: () => {} });

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
  useStats(); // hook called but stats displayed inline
  const onPullRefresh = async () => { setIsRefreshing(true); await refetch(); setIsRefreshing(false); };
  
  // Search by contract address
  const [searchedAgent, setSearchedAgent] = useState<any>(null);
  useEffect(() => {
    const searchByCA = async () => {
      if (searchQuery.startsWith('0x') && searchQuery.length >= 40) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(
            'https://edspwhxvlqwvylrgiygz.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc3B3aHh2bHF3dnlscmdpeWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDk0NTQsImV4cCI6MjA4NTM4NTQ1NH0.f6AuOz7HfkMFGf-RuoRP3BJofxzPd1DXKsQd1MFfmUA'
          );
          const { data } = await supabase
            .from('agents')
            .select('*')
            .ilike('token_address', searchQuery)
            .limit(1);
          if (data && data.length > 0) {
            setSearchedAgent(data[0]);
          } else {
            setSearchedAgent(null);
          }
        } catch (err) {
          console.error('CA search error:', err);
          setSearchedAgent(null);
        }
      } else {
        setSearchedAgent(null);
      }
    };
    const debounce = setTimeout(searchByCA, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);
  
  // Map Supabase data to UI format (fallback to hardcoded data while loading)
  let allAgents = (loading && !isRefreshing) || dbAgents.length === 0 
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

  // Include searched agent from CA search
  if (searchedAgent && searchQuery.startsWith('0x')) {
    const alreadyIncluded = allAgents.some(a => a.id === searchedAgent.id);
    if (!alreadyIncluded) {
      allAgents = [{
        id: searchedAgent.id,
        name: searchedAgent.name,
        karma: searchedAgent.karma,
        handle: searchedAgent.handle,
        avatar: searchedAgent.avatar,
        color: searchedAgent.color,
        lastActive: searchedAgent.last_active,
        age: searchedAgent.tokenized_at ? '3d' : null,
        tokenAddress: searchedAgent.token_address,
        mcap: searchedAgent.mcap,
        price: searchedAgent.price,
        change24h: searchedAgent.change_24h,
        volume: searchedAgent.volume_24h,
        liquidity: searchedAgent.liquidity,
        source: searchedAgent.source || 'unknown',
        symbol: searchedAgent.symbol,
        created_at: searchedAgent.created_at,
        trending_score: searchedAgent.trending_score || 0,
      }, ...allAgents];
    }
  }

  // Filter by search and source
  const moltbookAgents = allAgents.filter(agent => {
    const agentSource = (agent as any).source || 'unknown';
    const tokenAddr = (agent as any).token_address || (agent as any).tokenAddress;
    
    // Bypass filters for CA search - show the matched agent
    if (searchQuery.startsWith('0x') && searchQuery.length >= 40) {
      return tokenAddr?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    
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
    const tokenAddr = (agent as any).token_address || (agent as any).tokenAddress || '';
    return agent.name.toLowerCase().includes(query) || 
           agent.handle.toLowerCase().includes(query) ||
           tokenAddr.toLowerCase().includes(query);
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

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
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
            animation: 'marquee 80s linear infinite',
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
            /* Desktop: Search + Brand */
            <>
              {/* Desktop Search */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: isDark ? '#1C1C1D' : '#f0f0f0',
                borderRadius: '6px',
                padding: '8px 14px',
                minWidth: '280px',
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
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#0052FF' }}>bankr</span>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
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
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1C1C1D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', overflow: 'hidden' }}>
                          {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                            ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : '🦞'}
                        </div>
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
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: isDark ? '#1C1C1D' : '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', overflow: 'hidden' }}>
                              {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                                ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '🦞'}
                            </div>
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
                              overflow: 'hidden',
                            }}>
                              {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                                ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '🦞'}
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
                {/* Desktop Stats Bar - Enhanced */}
                <div style={{ 
                  backgroundColor: colors.bgSecondary, 
                  padding: '16px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  borderBottom: `1px solid ${colors.border}`,
                }}>
                  {/* Stats Pills */}
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    }}>
                      <span style={{ color: colors.textSecondary, fontSize: '11px', textTransform: 'uppercase', fontWeight: 500 }}>24H Volume:</span>
                      <span style={{ color: colors.green, fontWeight: 700, fontSize: '16px' }}>${formatCompact(moltbookAgents.reduce((sum, a) => sum + ((a as any).volume || 0), 0))}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Filter Pills */}
                <div style={{ 
                  backgroundColor: colors.bg, 
                  padding: '12px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  borderBottom: `1px solid ${colors.border}`,
                  flexWrap: 'wrap',
                }}>
                  {/* Source Filter Pills */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[
                      { key: 'all', label: 'All Agents' },
                      { key: 'trending', label: '🔥 Trending' },
                      { key: 'verified', label: '✓ Verified', special: true },
                      { key: 'bankr', label: 'Bankr' },
                      { key: 'clawnch', label: 'Clawnch' },
                      { key: 'moltlaunch', label: 'Moltlaunch' },
                      { key: 'clanker', label: 'Clanker' },
                    ].map(({ key, label, special }: any) => (
                      <button 
                        key={key}
                        onClick={() => setSourceFilter(key as any)}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: '20px', 
                          fontSize: '12px', 
                          fontWeight: 500, 
                          cursor: 'pointer', 
                          border: sourceFilter === key ? 'none' : special ? '2px solid transparent' : `1px solid ${colors.border}`,
                          borderImage: special && sourceFilter !== key ? 'linear-gradient(90deg, #F97316, #3B82F6) 1' : 'none',
                          backgroundColor: sourceFilter === key ? colors.text : 'transparent',
                          color: sourceFilter === key ? colors.bg : colors.textSecondary,
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  
                  {/* Sort Dropdown */}
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ color: colors.textSecondary, fontSize: '12px' }}>Sorted by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 500,
                        border: `1px solid ${colors.border}`,
                        backgroundColor: isDark ? '#1C1C1D' : '#f5f5f5',
                        color: colors.text,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="trending">🔥 Trending</option>
                      <option value="newest">🆕 Newest</option>
                      <option value="volume">📊 Volume</option>
                      <option value="change">📈 24h Change</option>
                      <option value="mcap">💰 Market Cap</option>
                    </select>
                  </div>
                </div>

                {/* Desktop Top 10 Section */}
                <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      🏆 Top 10 by {sortBy === 'volume' ? 'Volume' : sortBy === 'mcap' ? 'Market Cap' : sortBy === 'change' ? '24h Change' : 'Karma'}
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    overflowX: 'auto', 
                    paddingBottom: '8px',
                    WebkitOverflowScrolling: 'touch',
                  }}>
                    {[...moltbookAgents]
                      .sort((a, b) => sortBy === 'volume' ? (b.volume || 0) - (a.volume || 0) : sortBy === 'mcap' ? (b.mcap || 0) - (a.mcap || 0) : sortBy === 'change' ? (b.change24h || 0) - (a.change24h || 0) : (b.karma || 0) - (a.karma || 0))
                      .slice(0, 10)
                      .map((agent, i) => (
                        <div
                          key={agent.id}
                          onClick={() => setSelectedAgent(agent)}
                          style={{
                            minWidth: '180px',
                            padding: '16px',
                            borderRadius: '16px',
                            background: isDark 
                              ? i < 3 
                                ? `linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(239, 68, 68, 0.1) 100%)`
                                : 'rgba(255,255,255,0.03)'
                              : i < 3 
                                ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
                                : 'rgba(0,0,0,0.02)',
                            border: `1px solid ${i < 3 ? 'rgba(249, 115, 22, 0.3)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Rank + Avatar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <span style={{ 
                              fontSize: '14px', 
                              fontWeight: 800, 
                              color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : colors.textSecondary,
                              minWidth: '24px',
                            }}>
                              #{i + 1}
                            </span>
                            <div style={{ 
                              width: '36px', 
                              height: '36px', 
                              borderRadius: '10px', 
                              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '18px',
                              overflow: 'hidden',
                            }}>
                              {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                                ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : '🦞'}
                            </div>
                            {/* Source Badge */}
                            {(agent as any).source && (agent as any).source !== 'unknown' && (
                              <span style={{ 
                                fontSize: '9px', 
                                fontWeight: 600, 
                                padding: '3px 6px', 
                                borderRadius: '4px',
                                backgroundColor: (agent as any).source === 'bankr' ? '#0052FF' : 
                                               (agent as any).source === 'clawnch' ? '#F59E0B' : 
                                               (agent as any).source === 'moltlaunch' ? '#EF4444' : '#8B5CF6',
                                color: '#fff',
                                textTransform: 'uppercase',
                              }}>
                                {(agent as any).source}
                              </span>
                            )}
                          </div>
                          {/* Name */}
                          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {agent.name}
                            {isVerified((agent as any).token_address || (agent as any).tokenAddress) && <span style={{ marginLeft: '6px', color: '#3B82F6' }}>✓</span>}
                          </div>
                          {/* Symbol */}
                          <div style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '12px' }}>
                            ${(agent as any).symbol || '???'}
                          </div>
                          {/* Price + Change */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 700 }}>
                              {agent.price ? formatPrice(agent.price) : '$0'}
                            </span>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: 600,
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: (agent.change24h || 0) >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              color: (agent.change24h || 0) >= 0 ? '#22C55E' : '#EF4444',
                            }}>
                              {(agent.change24h || 0) >= 0 ? '↑' : '↓'}{Math.abs(agent.change24h || 0).toFixed(1)}%
                            </span>
                          </div>
                          {/* Stats */}
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontSize: '10px', 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            }}>
                              <span style={{ color: colors.textSecondary }}>VOL </span>
                              <span style={{ color: colors.text, fontWeight: 600 }}>{agent.volume ? formatNumber(agent.volume) : '—'}</span>
                            </span>
                            <span style={{ 
                              fontSize: '10px', 
                              padding: '4px 8px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            }}>
                              <span style={{ color: colors.textSecondary }}>LIQ </span>
                              <span style={{ color: colors.text, fontWeight: 600 }}>{agent.liquidity ? formatNumber(agent.liquidity) : '—'}</span>
                            </span>
                          </div>
                        </div>
                      ))}
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
                          overflow: 'hidden',
                        }}>
                          {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                            ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : '🦞'}
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
                /* Desktop Enhanced Table View */
                <div style={{ padding: '0 24px 24px' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                    <thead>
                      <tr>
                        {['#', 'AGENT', 'SOURCE', 'KARMA', 'OWNER', 'PRICE', 'VOLUME', 'LIQUIDITY', 'MCAP', '24H', 'ACTION'].map((header, i) => (
                          <th key={header} style={{ 
                            padding: '12px 16px', 
                            textAlign: i === 0 || i === 1 || i === 2 ? 'left' : (i === 10 ? 'center' : 'right'), 
                            color: colors.textSecondary, 
                            fontSize: '10px', 
                            fontWeight: 600, 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.5px',
                            position: 'sticky', 
                            top: 0, 
                            backgroundColor: colors.bg,
                            zIndex: 10,
                          }}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {moltbookAgents.map((agent, index) => (
                        <tr 
                          key={agent.id} 
                          style={{ 
                            cursor: 'pointer',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                          }} 
                          onClick={() => setSelectedAgent(agent)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                            e.currentTarget.style.transform = 'scale(1.005)';
                          }} 
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          {/* RANK */}
                          <td style={{ 
                            padding: '16px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderTopLeftRadius: '12px',
                            borderBottomLeftRadius: '12px',
                          }}>
                            <span style={{ 
                              backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                              color: index < 3 ? '#000' : colors.textSecondary,
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              display: 'inline-block',
                              minWidth: '32px',
                              textAlign: 'center',
                            }}>
                              {index + 1}
                            </span>
                          </td>
                          {/* AGENT */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '40px', 
                                height: '40px', 
                                borderRadius: '10px', 
                                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '20px',
                                flexShrink: 0,
                                overflow: 'hidden',
                              }}>
                                {(agent as any).avatar && (agent as any).avatar.startsWith('http') 
                                  ? <img src={(agent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  : '🦞'}
                              </div>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: 700, color: colors.text, fontSize: '14px' }}>{agent.name}</span>
                                  {isVerified((agent as any).token_address || (agent as any).tokenAddress) && <span style={{ color: '#3B82F6', fontSize: '14px' }}>✓</span>}
                                </div>
                                <div style={{ color: colors.textSecondary, fontSize: '12px' }}>${(agent as any).symbol || '???'}</div>
                              </div>
                            </div>
                          </td>
                          {/* SOURCE */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                          }}>
                            {(agent as any).source && (agent as any).source !== 'unknown' ? (
                              <span style={{ 
                                fontSize: '10px', 
                                fontWeight: 600, 
                                padding: '4px 8px', 
                                borderRadius: '6px',
                                backgroundColor: (agent as any).source === 'bankr' ? '#0052FF' : 
                                               (agent as any).source === 'clawnch' ? '#F59E0B' : 
                                               (agent as any).source === 'moltlaunch' ? '#EF4444' :
                                               (agent as any).source === 'clanker' ? '#8B5CF6' : '#6B7280',
                                color: '#fff',
                                textTransform: 'uppercase',
                              }}>
                                {(agent as any).source}
                              </span>
                            ) : <span style={{ color: colors.textSecondary }}>—</span>}
                          </td>
                          {/* KARMA */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right' 
                          }}>
                            <span style={{ 
                              color: '#EF4444', 
                              fontWeight: 700,
                              fontSize: '14px',
                            }}>{agent.karma}</span>
                          </td>
                          {/* OWNER */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right' 
                          }}>
                            <a 
                              href={`https://twitter.com/${agent.handle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ 
                                color: '#1DA1F2', 
                                textDecoration: 'none',
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(29, 161, 242, 0.1)',
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Twitter size={12} />
                              {agent.handle}
                            </a>
                          </td>
                          {/* PRICE */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right', 
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            fontWeight: 600,
                          }}>
                            {agent.price ? formatPrice(agent.price) : '—'}
                          </td>
                          {/* VOLUME */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right', 
                          }}>
                            <span style={{ 
                              fontSize: '12px', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              fontWeight: 500,
                            }}>
                              {agent.volume ? formatNumber(agent.volume) : '—'}
                            </span>
                          </td>
                          {/* LIQUIDITY */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right', 
                          }}>
                            <span style={{ 
                              fontSize: '12px', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              fontWeight: 500,
                            }}>
                              {agent.liquidity ? formatNumber(agent.liquidity) : '—'}
                            </span>
                          </td>
                          {/* MCAP */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right', 
                          }}>
                            <span style={{ 
                              fontSize: '12px', 
                              padding: '4px 10px', 
                              borderRadius: '6px', 
                              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                              fontWeight: 600,
                            }}>
                              {agent.mcap ? formatNumber(agent.mcap) : '—'}
                            </span>
                          </td>
                          {/* 24H */}
                          <td style={{ 
                            padding: '16px 12px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            textAlign: 'right' 
                          }}>
                            {agent.change24h !== null ? (
                              <span style={{ 
                                color: agent.change24h >= 0 ? '#22C55E' : '#EF4444', 
                                fontWeight: 600,
                                fontSize: '13px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: agent.change24h >= 0 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                              }}>
                                {agent.change24h >= 0 ? '+' : ''}{agent.change24h.toFixed(1)}%
                              </span>
                            ) : '—'}
                          </td>
                          {/* ACTION */}
                          <td style={{ 
                            padding: '16px', 
                            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderRight: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                            borderTopRightRadius: '12px',
                            borderBottomRightRadius: '12px',
                            textAlign: 'center' 
                          }}>
                            <a
                              href={`https://wallet.xyz/@AGENTSCREENER`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                border: 'none',
                                background: 'linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)',
                                color: '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'none',
                                transition: 'all 0.2s ease',
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                              Trade
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>}
          </>
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
          {/* Modal - Fullscreen */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark 
              ? '#0D0D0D'
              : '#fafafa',
            zIndex: 1002,
            overflow: 'auto',
            padding: '16px',
            paddingTop: isMobile ? '16px' : '24px',
            animation: 'slideUp 0.3s ease-out',
          }}>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <button onClick={() => setSelectedAgent(null)} 
                style={{
                  background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  border: 'none',
                  color: colors.text,
                  fontSize: '18px',
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px',
                }}
              >
                ←
              </button>
              <div style={{ 
                width: '44px', 
                height: '44px', 
                borderRadius: '12px', 
                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '22px',
                overflow: 'hidden',
              }}>
                {(selectedAgent as any).avatar && (selectedAgent as any).avatar.startsWith && (selectedAgent as any).avatar.startsWith('http') 
                  ? <img src={(selectedAgent as any).avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '🦞'}
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

            {/* Custom Price Chart */}
            <PriceChart 
              tokenAddress={selectedAgent.tokenAddress || selectedAgent.token_address} 
              isDark={isDark} 
            />

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
                { label: 'Chart', url: `https://wallet.xyz/@AGENTSCREENER` },
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
              Trade on wallet.xyz →
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

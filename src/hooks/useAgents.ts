import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://edspwhxvlqwvylrgiygz.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkc3B3aHh2bHF3dnlscmdpeWd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MDk0NTQsImV4cCI6MjA4NTM4NTQ1NH0.f6AuOz7HfkMFGf-RuoRP3BJofxzPd1DXKsQd1MFfmUA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Minimum thresholds for "quality" tokens
const MIN_LIQUIDITY = 1000;  // $1k minimum liquidity
const MIN_VOLUME_HOT = 50000; // $50k for "hot" tokens


export type Agent = {
  id: number;
  moltbook_id: string;
  name: string;
  handle: string;
  karma: number;
  avatar: string;
  color: string;
  last_active: string;
  token_address: string | null;
  tokenized_at: string | null;
  price: number | null;
  mcap: number | null;
  volume_24h: number | null;
  liquidity: number | null;
  change_24h: number | null;
  source?: string;
  symbol?: string;
  created_at?: string;
  trending_score?: number;
};

// Calculate trending score: weighted combination of volume, change, liquidity
function calculateTrendingScore(agent: Agent): number {
  const volume = agent.volume_24h || 0;
  const change = agent.change_24h || 0;
  const liquidity = agent.liquidity || 0;
  const mcap = agent.mcap || 0;
  
  // Normalize each metric (rough scaling)
  const volumeScore = Math.min(volume / 100000, 10); // Cap at $1M = 10 points
  const changeScore = Math.max(Math.min(change / 10, 10), -5); // Cap at 100% = 10, floor at -50%
  const liquidityScore = Math.min(liquidity / 50000, 5); // Cap at $250k = 5 points
  const mcapScore = Math.min(mcap / 500000, 5); // Cap at $2.5M = 5 points
  
  return (volumeScore * 0.4) + (changeScore * 0.3) + (liquidityScore * 0.15) + (mcapScore * 0.15);
}

export function useAgents(sourceFilter: string = 'all') {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [verifiedTokens, setVerifiedTokens] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchAgents = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      
      let query = supabase.from('agents').select('*');
      
      // Apply source filter at DB level
      if (sourceFilter === 'moltlaunch') {
        query = query.eq('source', 'moltlaunch');
      } else if (sourceFilter === 'clawnch') {
        query = query.eq('source', 'clawnch');
      } else if (sourceFilter === 'clanker') {
        query = query.eq('source', 'clanker');
      } else if (sourceFilter === 'bankr') {
        query = query.eq('source', 'bankr');
      } else if (sourceFilter === 'agent') {
        query = query.in('source', ['agent', 'bankr', 'moltbook', 'clawnch']);
      }
      
      // For "hot" and "trending" filters, add quality thresholds at DB level
      if (sourceFilter === 'hot' || sourceFilter === 'trending') {
        query = query.gte('volume_24h', MIN_VOLUME_HOT);
        query = query.gte('liquidity', MIN_LIQUIDITY);
      }
      
      // For most filters, require minimum liquidity to filter out dead tokens
      if (['all', 'moltlaunch', 'clawnch', 'clanker'].includes(sourceFilter)) {
        query = query.gte('liquidity', MIN_LIQUIDITY);
      }
      
      const { data, error } = await query
        .order('volume_24h', { ascending: false, nullsFirst: false })
        .limit(200);
        
      if (error) throw error;
      
      // Post-process: add trending scores
      const processed = (data || []).map(agent => ({
        ...agent,
        trending_score: calculateTrendingScore(agent),
      }));
      
      setAgents(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agents');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [sourceFilter]);
  const fetchVerified = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('verifications')
        .select('token_address')
        .eq('status', 'verified');
      
      if (data) {
        setVerifiedTokens(new Set(data.map(v => v.token_address.toLowerCase())));
      }
    } catch (err) {
      console.error('Failed to fetch verified tokens:', err);
    }
  }, []);
  useEffect(() => {
    fetchAgents(true);
    fetchVerified();
    const pollInterval = setInterval(() => {
      fetchAgents(false);
      fetchVerified();
    }, 30000);
    return () => clearInterval(pollInterval);
  }, [fetchAgents, fetchVerified]);
  const isVerified = useCallback((tokenAddress: string | null) => {
    if (!tokenAddress) return false;
    return verifiedTokens.has(tokenAddress.toLowerCase());
  }, [verifiedTokens]);
  return { agents, loading, error, refetch: () => fetchAgents(false), isVerified };
}
export function useStats() {
  const [stats, setStats] = useState({ totalAgents: 0, tokenized: 0, volume24h: 0 });
  const fetchStats = useCallback(async () => {
    const { data: allAgents } = await supabase
      .from('agents')
      .select('karma, volume_24h, token_address');
      
    if (allAgents) {
      setStats({
        totalAgents: allAgents.length,
        tokenized: allAgents.filter(a => a.token_address).length,
        volume24h: allAgents.reduce((sum, a) => sum + (a.volume_24h || 0), 0),
      });
    }
  }, []);
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);
  return stats;
}
export { supabase };

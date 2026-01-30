import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
};

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAgents() {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('karma', { ascending: false })
          .limit(100);

        if (error) throw error;
        setAgents(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch agents');
      } finally {
        setLoading(false);
      }
    }

    fetchAgents();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('agents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAgents(prev => [...prev, payload.new as Agent].sort((a, b) => b.karma - a.karma));
        } else if (payload.eventType === 'UPDATE') {
          setAgents(prev => prev.map(a => a.id === payload.new.id ? payload.new as Agent : a).sort((a, b) => b.karma - a.karma));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { agents, loading, error };
}

export function useStats() {
  const [stats, setStats] = useState({ totalAgents: 33631, tokenized: 0, volume24h: 0 });

  useEffect(() => {
    async function fetchStats() {
      const { data: allAgents } = await supabase
        .from('agents')
        .select('karma, volume_24h, token_address');

      if (allAgents) {
        setStats({
          totalAgents: 33631, // Moltbook total
          tokenized: allAgents.filter(a => a.karma >= 50).length,
          volume24h: allAgents.reduce((sum, a) => sum + (a.volume_24h || 0), 0),
        });
      }
    }

    fetchStats();
  }, []);

  return stats;
}

export { supabase };

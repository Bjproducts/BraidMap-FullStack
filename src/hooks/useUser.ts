'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSupabase } from '@/providers/SupabaseProvider';

/**
 * Subscribes to auth state changes on the client.
 * For server-rendered initial state, prefer `getSession()` from `@/lib/auth`.
 */
export function useUser() {
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return { user, loading };
}

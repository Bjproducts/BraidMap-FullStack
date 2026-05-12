'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Ctx = { supabase: SupabaseClient<Database> };

const SupabaseContext = createContext<Ctx | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  return <SupabaseContext.Provider value={{ supabase }}>{children}</SupabaseContext.Provider>;
}

export function useSupabase(): SupabaseClient<Database> {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used inside <SupabaseProvider>');
  return ctx.supabase;
}

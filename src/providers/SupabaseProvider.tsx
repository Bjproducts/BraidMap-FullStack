'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type BraidMapSupabaseClient = ReturnType<typeof createClient>;
type Ctx = { supabase: BraidMapSupabaseClient };

const SupabaseContext = createContext<Ctx | undefined>(undefined);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  return <SupabaseContext.Provider value={{ supabase }}>{children}</SupabaseContext.Provider>;
}

export function useSupabase(): BraidMapSupabaseClient {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('useSupabase must be used inside <SupabaseProvider>');
  return ctx.supabase;
}

'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { clientEnv } from '@/utils/env';

/**
 * Supabase client for the browser. Reads NEXT_PUBLIC_* env vars.
 * Use this from client components, hooks, and event handlers.
 */
export function createClient() {
  return createBrowserClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

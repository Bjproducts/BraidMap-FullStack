import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { serverEnv } from '@/utils/env';

/**
 * Supabase client for server components, route handlers, and server actions.
 * Reads cookies via next/headers so the user's session is honoured server-side.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>,
          _headers?: Record<string, string>,
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — cookies are read-only there.
            // The middleware refresh path handles persistence.
          }
        },
      },
    },
  );
}

/**
 * Service-role client. SERVER-ONLY. Bypasses RLS. Use sparingly and
 * never expose to the browser. Returns null if SUPABASE_SERVICE_ROLE_KEY
 * isn't configured so callers can degrade gracefully.
 */
export function createServiceClient() {
  const key = serverEnv.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  return createServerClient<Database>(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    key,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    },
  );
}

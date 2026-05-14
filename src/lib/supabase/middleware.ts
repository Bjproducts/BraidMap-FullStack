import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { clientEnv } from '@/utils/env';

/**
 * Refresh the Supabase auth session on every request and forward the
 * (possibly rotated) session cookies in the response. This is the
 * canonical pattern from the Supabase Next.js docs.
 *
 * Call from `src/middleware.ts`.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>,
          headers?: Record<string, string>,
        ) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Forward CDN cache-control headers from auth token refresh
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              response.headers.set(key, value),
            );
          }
        },
      },
    },
  );

  // IMPORTANT: do not run any logic between createServerClient() and
  // getUser() — it may break session refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}

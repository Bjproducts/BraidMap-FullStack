/**
 * Runtime environment validation.
 * Imported once at the edges of the app (server-side init) — fails loudly
 * if required variables are missing.
 *
 * Set SKIP_ENV_VALIDATION=1 in CI / build environments where the real
 * values aren't available at compile time (e.g. Netlify build phase).
 * The variables are still required at runtime.
 */
import { z } from 'zod';

const ClientEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SITE_NAME: z.string().default('BraidMap'),
});

const ServerEnv = ClientEnv.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  SUPABASE_PROJECT_ID: z.string().min(1).optional(),
});

// During the Next.js build phase env vars may not be present in the build
// container. Skip validation so the build succeeds; Zod will still catch
// missing vars at server startup (runtime) when they ARE required.
const skip = !!process.env.SKIP_ENV_VALIDATION;

export const clientEnv = skip
  ? (process.env as unknown as z.infer<typeof ClientEnv>)
  : ClientEnv.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    });

/**
 * Server-only env. Only import this from server components / route handlers /
 * server actions / middleware — never from client code.
 */
export const serverEnv =
  typeof window === 'undefined'
    ? skip
      ? (process.env as unknown as z.infer<typeof ServerEnv>)
      : ServerEnv.parse({
          ...clientEnv,
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
          SUPABASE_PROJECT_ID: process.env.SUPABASE_PROJECT_ID,
        })
    : (null as never);

/**
 * Domain types. Keep narrow and domain-driven — the auto-generated
 * Supabase row types live in `database.ts`.
 */
import type { Database } from './database';

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// ── Convenience domain aliases ────────────────────────────────────────────
export type Profile  = Tables<'profiles'>;
export type Stylist  = Tables<'stylists'>;
export type Report   = Tables<'reports'>;
export type Suggest  = Tables<'suggestions'>;
export type Favorite = Tables<'favorites'>;

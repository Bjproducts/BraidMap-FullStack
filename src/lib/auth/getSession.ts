import { createClient } from '@/lib/supabase/server';
import type { Profile } from '@/types';

/**
 * Server-side helper to fetch the current user + their profile row.
 * Returns null if no session.
 *
 * Always call from server components, route handlers, or server actions.
 */
export async function getSession() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  return { user, profile: (profile ?? null) as Profile | null };
}

/** Convenience: returns just the user, or null. */
export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/** Convenience: returns the role, defaulting to 'visitor'. */
export async function getRole() {
  const session = await getSession();
  return session?.profile?.role ?? 'visitor';
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Liveness probe. Verifies the Supabase connection without exposing secrets.
 * Used by Vercel cron / uptime monitors.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true });
    if (error) throw error;

    return NextResponse.json(
      { ok: true, latencyMs: Date.now() - startedAt, service: 'braidmap' },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : 'unknown' },
      { status: 503 },
    );
  }
}

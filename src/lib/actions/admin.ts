'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';

export type AdminActionResult = { ok: true } | { ok: false; error: string };

// ── Guard helper ──────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect(routes.login);
  if (session.profile?.role !== 'admin') redirect(routes.dashboard);
  return session.user;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function resolveReport(reportId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('reports')
    .update({ status: 'resolved', resolved_by: admin.id, resolved_at: new Date().toISOString() })
    .eq('id', reportId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin');
  return { ok: true };
}

export async function rejectReport(reportId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('reports')
    .update({ status: 'rejected', resolved_by: admin.id, resolved_at: new Date().toISOString() })
    .eq('id', reportId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin');
  return { ok: true };
}

// ── Suggestions ───────────────────────────────────────────────────────────────

export async function approveSuggestion(suggestionId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('suggestions')
    .update({ status: 'approved', reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq('id', suggestionId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin');
  return { ok: true };
}

export async function rejectSuggestion(suggestionId: string): Promise<AdminActionResult> {
  const admin = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('suggestions')
    .update({ status: 'rejected', reviewed_by: admin.id, reviewed_at: new Date().toISOString() })
    .eq('id', suggestionId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin');
  return { ok: true };
}

// ── Stylist visibility ────────────────────────────────────────────────────────

export async function toggleStylistVisibility(
  stylistId: string,
  published: boolean,
): Promise<AdminActionResult> {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('stylists')
    .update({ published })
    .eq('id', stylistId);
  if (error) return { ok: false, error: error.message };
  revalidatePath('/admin');
  revalidatePath('/directory');
  return { ok: true };
}

'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';

const VALID_ISSUE_TYPES = [
  'business_closed', 'wrong_phone', 'wrong_social', 'wrong_location',
  'booking_broken', 'wrong_services', 'duplicate', 'other',
] as const;

const Schema = z.object({
  stylist_name: z.string().min(1, 'Please enter the stylist or business name'),
  issue_type: z.enum(VALID_ISSUE_TYPES, {
    errorMap: () => ({ message: 'Please select an issue type' }),
  }),
  details: z
    .string()
    .min(10, 'Please provide more detail (at least 10 characters)')
    .max(2000, 'Details must be under 2000 characters'),
});

export type ReportResult = { ok: true } | { ok: false; error: string };

export async function submitReport(
  _prev: ReportResult | null,
  formData: FormData,
): Promise<ReportResult> {
  const user = await getUser();
  if (!user) redirect(`${routes.login}?next=${routes.report}`);

  const parsed = Schema.safeParse({
    stylist_name: formData.get('stylist_name'),
    issue_type: formData.get('issue_type'),
    details: formData.get('details'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('reports').insert({
    reporter_id: user.id,
    issue_type: parsed.data.issue_type,
    details: `${parsed.data.stylist_name}\n\n${parsed.data.details}`,
  });

  if (error) return { ok: false, error: 'Failed to submit. Please try again.' };
  return { ok: true };
}

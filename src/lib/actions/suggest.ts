'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';

const Schema = z.object({
  business_name: z
    .string()
    .min(1, 'Please enter the business name')
    .max(120, 'Business name must be under 120 characters'),
  city: z
    .string()
    .min(1, 'Please select a city')
    .max(80),
  instagram:   z.string().max(60).optional().or(z.literal('')),
  tiktok:      z.string().max(60).optional().or(z.literal('')),
  facebook:    z.string().max(120).optional().or(z.literal('')),
  booking_url: z.string().max(300).optional().or(z.literal('')),
  phone:       z.string().max(30).optional().or(z.literal('')),
  website:     z.string().max(300).optional().or(z.literal('')),
  styles:      z.string().optional().or(z.literal('')),
  notes:       z.string().max(1000).optional().or(z.literal('')),
});

export type SuggestResult = { ok: true } | { ok: false; error: string };

export async function submitSuggestion(
  _prev: SuggestResult | null,
  formData: FormData,
): Promise<SuggestResult> {
  const user = await getUser();
  if (!user) redirect(`${routes.login}?next=${routes.suggest}`);

  const parsed = Schema.safeParse({
    business_name: formData.get('business_name'),
    city:          formData.get('city'),
    instagram:     formData.get('instagram'),
    tiktok:        formData.get('tiktok'),
    facebook:      formData.get('facebook'),
    booking_url:   formData.get('booking_url'),
    phone:         formData.get('phone'),
    website:       formData.get('website'),
    styles:        formData.get('styles'),
    notes:         formData.get('notes'),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const styles = parsed.data.styles
    ? parsed.data.styles.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Consolidate extra fields into notes so no schema change is needed
  const extraLines = [
    parsed.data.tiktok      ? `TikTok: ${parsed.data.tiktok}`         : null,
    parsed.data.facebook    ? `Facebook: ${parsed.data.facebook}`      : null,
    parsed.data.booking_url ? `Booking: ${parsed.data.booking_url}`    : null,
    parsed.data.phone       ? `Phone: ${parsed.data.phone}`            : null,
    parsed.data.website     ? `Website: ${parsed.data.website}`        : null,
    parsed.data.notes       ? `Notes: ${parsed.data.notes}`            : null,
  ].filter(Boolean);

  const combinedNotes = extraLines.length > 0 ? extraLines.join('\n') : null;

  const supabase = await createClient();
  const { error } = await supabase.from('suggestions').insert({
    submitter_id:  user.id,
    business_name: parsed.data.business_name,
    city:          parsed.data.city,
    instagram:     parsed.data.instagram || null,
    styles,
    notes:         combinedNotes,
  });

  if (error) return { ok: false, error: 'Failed to submit. Please try again.' };
  return { ok: true };
}

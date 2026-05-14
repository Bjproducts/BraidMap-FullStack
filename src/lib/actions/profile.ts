'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';

const Schema = z.object({
  full_name: z
    .string()
    .min(1, 'Name is required')
    .max(120, 'Name must be under 120 characters'),
});

export type ProfileResult = { ok: true } | { ok: false; error: string };

export async function updateProfile(
  _prev: ProfileResult | null,
  formData: FormData,
): Promise<ProfileResult> {
  const user = await getUser();
  if (!user) redirect(routes.login);

  const parsed = Schema.safeParse({ full_name: formData.get('full_name') });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: parsed.data.full_name })
    .eq('id', user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath('/dashboard');
  return { ok: true };
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/config/routes';

const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(1, 'Please enter your name'),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type AuthResult = { ok: true } | { ok: false; error: string };

export async function signup(formData: FormData): Promise<AuthResult> {
  const parsed = SignupSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    fullName: formData.get('fullName'),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/', 'layout');
  redirect(routes.dashboard);
}

export async function login(formData: FormData): Promise<AuthResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { ok: false, error: 'Please enter a valid email and password.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/', 'layout');
  redirect(routes.dashboard);
}

/**
 * useActionState-compatible wrappers — accept (prevState, formData) so client
 * form components can use React 19's useActionState hook.
 */
export async function loginAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult | null> {
  return login(formData);
}

export async function signupAction(
  _prev: AuthResult | null,
  formData: FormData,
): Promise<AuthResult | null> {
  return signup(formData);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect(routes.home);
}

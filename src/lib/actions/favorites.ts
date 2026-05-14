'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';

export async function toggleFavorite(
  stylistId: string,
): Promise<{ favorited: boolean; error?: string }> {
  const user = await getUser();
  if (!user) redirect(`${routes.login}?next=/directory`);

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('favorites')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('stylist_id', stylistId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('stylist_id', stylistId);
    if (error) return { favorited: true, error: error.message };
    revalidatePath('/dashboard');
    return { favorited: false };
  }

  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: user.id, stylist_id: stylistId });
  if (error) return { favorited: false, error: error.message };
  revalidatePath('/dashboard');
  return { favorited: true };
}

import { createClient } from '@/lib/supabase/server';
import type { Stylist } from '@/types';
import { getStylistsByIds } from './stylists';

export async function getUserFavoriteIds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('favorites')
    .select('stylist_id')
    .eq('user_id', userId);
  return (data ?? []).map(r => r.stylist_id);
}

export async function getUserFavorites(userId: string): Promise<Stylist[]> {
  const ids = await getUserFavoriteIds(userId);
  return getStylistsByIds(ids);
}

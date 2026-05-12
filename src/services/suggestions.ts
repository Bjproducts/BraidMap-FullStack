import { createClient } from '@/lib/supabase/server';
import type { Inserts } from '@/types';

export async function createSuggestion(input: Inserts<'suggestions'>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('suggestions').insert(input).select().single();
  if (error) throw error;
  return data;
}

import { createClient } from '@/lib/supabase/server';
import type { Inserts } from '@/types';

export async function createReport(input: Inserts<'reports'>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('reports').insert(input).select().single();
  if (error) throw error;
  return data;
}

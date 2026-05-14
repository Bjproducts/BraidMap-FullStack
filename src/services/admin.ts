import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type Report     = Database['public']['Tables']['reports']['Row'];
export type Suggestion = Database['public']['Tables']['suggestions']['Row'];
export type Stylist    = Database['public']['Tables']['stylists']['Row'];

export async function getPendingReports(): Promise<Report[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPendingSuggestions(): Promise<Suggestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('suggestions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAllStylists(): Promise<Stylist[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('stylists')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

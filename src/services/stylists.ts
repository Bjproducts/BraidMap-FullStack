import { createClient } from '@/lib/supabase/server';
import type { Stylist } from '@/types';
import { DEFAULT_PAGE_SIZE } from '@/constants';

export async function getCitiesAndTags(): Promise<{ cities: string[]; tags: string[] }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stylists')
    .select('city, tags')
    .eq('published', true);

  if (!data) return { cities: [], tags: [] };

  const rows = data as Array<{ city: string; tags: string[] }>;
  const cities = [...new Set(rows.map(r => r.city).filter(Boolean))].sort();
  const tags   = [...new Set(rows.flatMap(r => r.tags))].sort();

  return { cities, tags };
}

export async function getStylistsByIds(ids: string[]): Promise<Stylist[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from('stylists')
    .select('*')
    .in('id', ids)
    .eq('published', true);
  const rows = (data ?? []) as Stylist[];
  // Preserve original order
  return ids.map(id => rows.find(s => s.id === id)).filter((s): s is Stylist => Boolean(s));
}

export type ListStylistsParams = {
  city?: string;
  tag?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

/** Public stylist listing — server-only. RLS handles published filtering. */
export async function listStylists(params: ListStylistsParams = {}) {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('stylists')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .range(from, to)
    .order('service_count', { ascending: false });

  if (params.city) query = query.eq('city', params.city);
  if (params.tag)  query = query.contains('tags', [params.tag]);
  if (params.q)    query = query.ilike('name', `%${params.q}%`);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    stylists: (data ?? []) as Stylist[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

export async function getStylistBySlug(slug: string): Promise<Stylist | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('stylists')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error) throw error;
  return (data ?? null) as Stylist | null;
}

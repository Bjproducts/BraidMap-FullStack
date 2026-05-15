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

export async function getTagCounts(): Promise<{ tag: string; count: number }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stylists')
    .select('tags')
    .eq('published', true);

  if (!data) return [];

  const counts: Record<string, number> = {};
  for (const row of data as Array<{ tags: string[] }>) {
    for (const tag of row.tags ?? []) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
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
  return ids.map(id => rows.find(s => s.id === id)).filter((s): s is Stylist => Boolean(s));
}

export type SortOption = 'services' | 'az' | 'city';

export type ListStylistsParams = {
  city?: string;
  tag?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: SortOption;
};

export async function listStylists(params: ListStylistsParams = {}) {
  const supabase  = await createClient();
  const page      = params.page ?? 1;
  const pageSize  = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const from      = (page - 1) * pageSize;
  const to        = from + pageSize - 1;

  let query = supabase
    .from('stylists')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .range(from, to);

  // Sort
  if (params.sort === 'az') {
    query = query.order('name', { ascending: true });
  } else if (params.sort === 'city') {
    query = query.order('city', { ascending: true }).order('name', { ascending: true });
  } else {
    query = query.order('service_count', { ascending: false });
  }

  if (params.city) query = query.eq('city', params.city);
  if (params.tag)  query = query.contains('tags', [params.tag]);

  if (params.q) {
    // Search name; also try matching a tag slug derived from the query
    const tagSlug = params.q.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    query = query.or(`name.ilike.%${params.q}%,tags.cs.{${tagSlug}}`);
  }

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

export async function getRelatedStylists(
  currentId: string,
  tags: string[],
  city: string | null,
  limit = 3,
): Promise<Stylist[]> {
  if (tags.length === 0 && !city) return [];
  const supabase = await createClient();

  let query = supabase
    .from('stylists')
    .select('*')
    .eq('published', true)
    .neq('id', currentId)
    .limit(limit);

  if (tags.length > 0) {
    query = query.overlaps('tags', tags);
  } else if (city) {
    query = query.eq('city', city);
  }

  const { data } = await query;
  return (data ?? []) as Stylist[];
}

export async function getFeaturedStylists(limit = 3): Promise<Stylist[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('stylists')
    .select('*')
    .eq('published', true)
    .order('service_count', { ascending: false })
    .limit(limit);
  return (data ?? []) as Stylist[];
}

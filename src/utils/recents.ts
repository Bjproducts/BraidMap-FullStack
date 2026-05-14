export const RECENTS_COOKIE = 'bm_recents';
export const RECENTS_MAX = 5;

export function parseRecents(cookieValue: string | undefined): string[] {
  if (!cookieValue) return [];
  return cookieValue.split(',').filter(Boolean).slice(0, RECENTS_MAX);
}

export function addRecent(current: string[], id: string): string[] {
  return [id, ...current.filter(i => i !== id)].slice(0, RECENTS_MAX);
}

export function formatRecents(ids: string[]): string {
  return ids.join(',');
}

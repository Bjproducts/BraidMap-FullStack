'use client';

import { useEffect } from 'react';
import {
  RECENTS_COOKIE,
  parseRecents,
  addRecent,
  formatRecents,
} from '@/utils/recents';

/** Invisible component — sets the bm_recents cookie on mount. */
export function TrackView({ stylistId }: { stylistId: string }) {
  useEffect(() => {
    const raw = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${RECENTS_COOKIE}=`))
      ?.split('=')[1];

    const current = parseRecents(raw ? decodeURIComponent(raw) : undefined);
    const updated = addRecent(current, stylistId);
    const maxAge = 60 * 60 * 24 * 30; // 30 days

    document.cookie = `${RECENTS_COOKIE}=${encodeURIComponent(
      formatRecents(updated),
    )}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }, [stylistId]);

  return null;
}

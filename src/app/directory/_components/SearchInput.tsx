'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useRef, useCallback, useEffect } from 'react';

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();
  const inputRef    = useRef<HTMLInputElement>(null);
  const timer       = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep input in sync when filters are cleared via sidebar "Clear all"
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = searchParams.get('q') ?? '';
    }
  }, [searchParams]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (timer.current) clearTimeout(timer.current);
      const v = e.target.value.trim();
      timer.current = setTimeout(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (v) {
          params.set('q', v);
        } else {
          params.delete('q');
        }
        params.delete('page');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        router.push(`${pathname}?${params.toString()}` as any);
      }, 300);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-g400 select-none"
      >
        ⌕
      </span>
      <input
        ref={inputRef}
        type="search"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Search by name…"
        aria-label="Search stylists"
        className="w-full rounded-md border-[1.5px] border-g200 bg-paper py-3 pl-9 pr-4 font-sans text-sm text-ink placeholder:text-g400 outline-none transition-colors focus:border-ink"
      />
    </div>
  );
}

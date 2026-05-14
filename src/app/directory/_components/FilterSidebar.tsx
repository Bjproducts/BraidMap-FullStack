'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/utils/cn';
import { formatTag } from '@/utils/formatTag';

interface FilterSidebarProps {
  cities: string[];
  tags: string[];
}

export function FilterSidebar({ cities, tags }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCity = searchParams.get('city') ?? '';
  const activeTag  = searchParams.get('tag')  ?? '';
  const hasFilters = !!(activeCity || activeTag || searchParams.get('q'));

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete('page');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`${pathname}?${params.toString()}` as any);
    },
    [router, pathname, searchParams],
  );

  const clearAll = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(pathname as any);
  }, [router, pathname]);

  return (
    <aside className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[2px] text-g400">
          Filters
        </p>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="font-mono text-[10px] uppercase tracking-wider text-g400 underline hover:text-ink"
          >
            Clear all
          </button>
        )}
      </div>

      {/* City */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[1.5px] text-g600">
          City
        </p>
        <div className="flex flex-col gap-0.5">
          {cities.map(city => (
            <button
              key={city}
              onClick={() => setParam('city', activeCity === city ? '' : city)}
              className={cn(
                'w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                activeCity === city
                  ? 'bg-ink font-medium text-paper'
                  : 'text-g600 hover:bg-g100 hover:text-ink',
              )}
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Style/tag */}
      <div>
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[1.5px] text-g600">
          Style
        </p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setParam('tag', activeTag === tag ? '' : tag)}
              className={cn(
                'rounded-sm border px-2.5 py-1 font-mono text-[10px] transition-colors',
                activeTag === tag
                  ? 'border-ink bg-ink text-paper'
                  : 'border-g200 text-g600 hover:border-ink hover:text-ink',
              )}
            >
              {formatTag(tag)}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

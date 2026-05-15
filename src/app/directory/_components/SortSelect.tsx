'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

type SortOption = 'services' | 'az' | 'city';

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'services', label: 'Most services' },
  { value: 'az',       label: 'A → Z' },
  { value: 'city',     label: 'By city' },
];

export function SortSelect() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();
  const active       = (searchParams.get('sort') as SortOption) ?? 'services';

  const setSort = (value: SortOption) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'services') {
      params.delete('sort');
    } else {
      params.set('sort', value);
    }
    params.delete('page');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(`${pathname}?${params.toString()}` as any);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="hidden font-mono text-[10px] uppercase tracking-wider text-g400 sm:inline">
        Sort
      </span>
      <div className="flex gap-1">
        {OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={cn(
              'rounded-sm border px-2.5 py-1 font-mono text-[10px] transition-colors',
              active === opt.value
                ? 'border-ink bg-ink text-paper'
                : 'border-g200 text-g600 hover:border-ink hover:text-ink',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

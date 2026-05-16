'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { cn } from '@/utils/cn';

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
}

export function Pagination({ page, total, pageSize }: PaginationProps) {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(total / pageSize);

  const go = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(p));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`${pathname}?${params.toString()}` as any);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [router, pathname, searchParams],
  );

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-between border-t border-g200 pt-6"
    >
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className={cn(
          'rounded-md border border-g200 px-4 py-2 font-mono text-xs transition-colors',
          page <= 1
            ? 'cursor-not-allowed opacity-40'
            : 'text-g600 hover:border-ink hover:text-ink',
        )}
      >
        ← Previous
      </button>

      <span className="font-mono text-[11px] text-g400">
        Page {page} of {totalPages}
      </span>

      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          'rounded-md border border-g200 px-4 py-2 font-mono text-xs transition-colors',
          page >= totalPages
            ? 'cursor-not-allowed opacity-40'
            : 'text-g600 hover:border-ink hover:text-ink',
        )}
      >
        Next →
      </button>
    </nav>
  );
}

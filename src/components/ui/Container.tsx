import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/** Centered max-width wrapper. Use as a section root. */
export function Container({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12', className)} {...rest} />;
}

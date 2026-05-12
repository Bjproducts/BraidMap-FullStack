import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

/** Mono eyebrow label — matches MVP `.eyebrow` styling. */
export function Eyebrow({ className, children, ...rest }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'block font-mono text-[10px] uppercase tracking-[2.5px] text-g400',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

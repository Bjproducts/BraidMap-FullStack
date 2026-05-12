import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-semibold whitespace-nowrap ' +
  'transition-opacity duration-150 disabled:opacity-60 disabled:cursor-not-allowed ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink';

const variants: Record<Variant, string> = {
  primary:   'bg-ink text-paper hover:opacity-85',
  secondary: 'bg-transparent text-g600 border border-g200 hover:border-ink hover:text-ink',
  ghost:     'bg-transparent text-g600 hover:text-ink',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-2 rounded-md',
  md: 'text-sm px-6 py-3 rounded-md',
  lg: 'text-base px-8 py-4 rounded-md',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...rest }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner />}
      <span>{children}</span>
    </button>
  ),
);
Button.displayName = 'Button';

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
  );
}

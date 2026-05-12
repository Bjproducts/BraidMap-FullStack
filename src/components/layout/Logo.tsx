import Link from 'next/link';
import { routes } from '@/config/routes';

/** Visual logo mark used in nav + footer. */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href={routes.home}
      className="flex items-center gap-2.5 no-underline"
      aria-label="BraidMap home"
    >
      <span
        className={
          'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md font-serif text-sm italic ' +
          (inverted ? 'bg-paper text-ink' : 'bg-ink text-paper')
        }
      >
        B
      </span>
      <span className="font-serif text-[22px] tracking-tight">BraidMap</span>
    </Link>
  );
}

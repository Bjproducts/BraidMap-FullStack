import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { routes } from '@/config/routes';

export default function NotFound() {
  return (
    <Container className="py-32 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[2.5px] text-g400">404</p>
      <h1 className="mt-4 font-serif text-display-xl text-ink">
        Page <em className="italic text-g400">not found</em>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm font-light text-g600">
        We couldn't find what you were looking for. The page may have moved, or the link is no
        longer valid.
      </p>
      <Link
        href={routes.home}
        className="mt-8 inline-block rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper no-underline transition-opacity hover:opacity-85"
      >
        Back to home →
      </Link>
    </Container>
  );
}

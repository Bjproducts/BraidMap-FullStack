'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: hook into Sentry once configured
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Container className="py-32 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[2.5px] text-g400">Something broke</p>
      <h1 className="mt-4 font-serif text-display-xl text-ink">
        Unexpected <em className="italic text-g400">error</em>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm font-light text-g600">
        Sorry — something went wrong on our end. The error has been logged.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[10px] text-g400">
          Ref: {error.digest}
        </p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>↻ Try again</Button>
        <Link href={routes.home}>
          <Button variant="secondary">← Home</Button>
        </Link>
      </div>
    </Container>
  );
}

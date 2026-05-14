'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitSuggestion, type SuggestResult } from '@/lib/actions/suggest';
import { routes } from '@/config/routes';

export function SuggestForm() {
  const [state, action, pending] = useActionState<SuggestResult | null, FormData>(
    submitSuggestion,
    null,
  );

  if (state?.ok) {
    return (
      <Container className="py-20 lg:py-28">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-g100">
            <span className="font-serif text-2xl italic text-ink">✓</span>
          </div>
          <h2 className="mb-3 font-serif text-display-md text-ink">
            Suggestion <em className="italic text-g400">received</em>
          </h2>
          <p className="mb-8 text-sm font-light leading-relaxed text-g600">
            Thank you! We&apos;ll review this stylist and reach out if we need anything.
          </p>
          <Link href={routes.directory}>
            <Button variant="secondary" size="md">← Browse the directory</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          name="business_name"
          label="Business / stylist name"
          placeholder="e.g. Braids by Amara"
          required
        />
        <Input
          name="city"
          label="City"
          placeholder="e.g. Vancouver"
          required
        />
      </div>

      <Input
        name="instagram"
        label="Instagram handle"
        hint="(optional)"
        placeholder="@username"
      />

      <Input
        name="styles"
        label="Services offered"
        hint="(comma-separated, optional)"
        placeholder="e.g. box braids, knotless, locs"
      />

      <Textarea
        name="notes"
        label="Additional notes"
        hint="(optional)"
        placeholder="Anything else we should know…"
        rows={3}
      />

      {state && !state.ok && (
        <p
          className="rounded-md border border-danger/30 bg-paper px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" loading={pending} size="md" className="mt-1">
        Submit suggestion →
      </Button>
    </form>
  );
}

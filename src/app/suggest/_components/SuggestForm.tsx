'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitSuggestion, type SuggestResult } from '@/lib/actions/suggest';
import { routes } from '@/config/routes';
import { BC_CITIES, SERVICE_CATEGORIES } from '@/constants';
import { cn } from '@/utils/cn';

export function SuggestForm() {
  const [state, action, pending] = useActionState<SuggestResult | null, FormData>(
    submitSuggestion,
    null,
  );
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const toggleService = (slug: string) => {
    setSelectedServices(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug],
    );
  };

  if (state?.ok) {
    return (
      <Container className="py-20 lg:py-28">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-5 text-5xl" aria-hidden>🎉</p>
          <h2 className="mb-3 font-serif text-display-md text-ink">
            Thank <em className="italic text-g400">you!</em>
          </h2>
          <p className="mb-8 text-sm font-light leading-relaxed text-g600">
            Your suggestion has been received. We&apos;ll verify and reach out if
            needed — usually within 3–5 business days.
          </p>
          <Link href={routes.directory}>
            <Button variant="secondary" size="md">← Browse the directory</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-10">
      {/* Hidden field for selected services */}
      <input
        type="hidden"
        name="styles"
        value={selectedServices.join(',')}
      />

      {/* ── Section 1: Business Information ── */}
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-g400">
            Step 1 of 3
          </span>
          <div className="h-px flex-1 bg-g200" />
        </div>
        <h2 className="mb-6 font-serif text-xl text-ink">Business information</h2>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="business_name"
              label="Business / stylist name"
              placeholder="e.g. Braids by Amara"
              required
            />
            {/* City dropdown */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="city"
                className="font-mono text-[10px] uppercase tracking-[1.5px] text-g600"
              >
                City in BC
              </label>
              <select
                id="city"
                name="city"
                required
                defaultValue=""
                className="w-full rounded-md border-[1.5px] border-g200 bg-paper px-3.5 py-3 font-sans text-sm text-ink outline-none transition-colors focus:border-ink appearance-none"
              >
                <option value="" disabled>Select a city…</option>
                {BC_CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="instagram"
              label="Instagram handle"
              placeholder="@username"
              hint="(optional)"
            />
            <Input
              name="tiktok"
              label="TikTok"
              placeholder="@username"
              hint="(optional)"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="facebook"
              label="Facebook"
              placeholder="facebook.com/…"
              hint="(optional)"
            />
            <Input
              name="booking_url"
              label="Booking link"
              placeholder="https://…"
              hint="(optional)"
              type="url"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="phone"
              label="Phone number"
              placeholder="+1 (604) 000-0000"
              hint="(optional)"
              type="tel"
            />
            <Input
              name="website"
              label="Website"
              placeholder="https://…"
              hint="(optional)"
              type="url"
            />
          </div>
        </div>
      </div>

      {/* ── Section 2: Services ── */}
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-g400">
            Step 2 of 3
          </span>
          <div className="h-px flex-1 bg-g200" />
        </div>
        <h2 className="mb-2 font-serif text-xl text-ink">Services offered</h2>
        <p className="mb-5 text-sm font-light text-g600">
          Select all that apply.{' '}
          <span className="text-g400">(optional)</span>
        </p>

        <div className="flex flex-wrap gap-2">
          {SERVICE_CATEGORIES.map(({ slug, label }) => (
            <button
              key={slug}
              type="button"
              onClick={() => toggleService(slug)}
              className={cn(
                'rounded-md border px-3.5 py-2 font-mono text-[11px] transition-colors',
                selectedServices.includes(slug)
                  ? 'border-ink bg-ink text-paper'
                  : 'border-g200 text-g600 hover:border-ink hover:text-ink',
              )}
              aria-pressed={selectedServices.includes(slug)}
            >
              {label}
            </button>
          ))}
        </div>

        {selectedServices.length > 0 && (
          <p className="mt-3 font-mono text-[10px] text-g400">
            {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      {/* ── Section 3: Your Details ── */}
      <div>
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-g400">
            Step 3 of 3
          </span>
          <div className="h-px flex-1 bg-g200" />
        </div>
        <h2 className="mb-6 font-serif text-xl text-ink">Additional notes</h2>

        <Textarea
          name="notes"
          label="Anything else we should know?"
          hint="(optional)"
          placeholder="Hours, deposit requirements, special notes…"
          rows={3}
        />
      </div>

      {state && !state.ok && (
        <p
          className="rounded-md border border-danger/30 bg-paper px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-g200 pt-6">
        <p className="text-xs font-light text-g400">
          By submitting you confirm this is a BIPOC-owned hair business in BC.
          All listings are verified — 3–5 business days.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={routes.directory}
            className="font-mono text-[11px] text-g400 no-underline hover:text-ink"
          >
            Cancel
          </Link>
          <Button type="submit" loading={pending} size="md">
            Submit suggestion →
          </Button>
        </div>
      </div>
    </form>
  );
}

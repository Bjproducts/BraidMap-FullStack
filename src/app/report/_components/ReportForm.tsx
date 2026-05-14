'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitReport, type ReportResult } from '@/lib/actions/report';
import { routes } from '@/config/routes';
import { REPORT_TYPES, REPORT_TYPE_LABELS } from '@/constants';

interface ReportFormProps {
  prefillName?: string;
}

export function ReportForm({ prefillName }: ReportFormProps) {
  const [state, action, pending] = useActionState<ReportResult | null, FormData>(
    submitReport,
    null,
  );

  if (state?.ok) {
    return (
      <Container className="py-20 lg:py-28">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-g100 mx-auto">
            <span className="font-serif text-2xl italic text-ink">✓</span>
          </div>
          <h2 className="mb-3 font-serif text-display-md text-ink">
            Report <em className="italic text-g400">received</em>
          </h2>
          <p className="mb-8 text-sm font-light leading-relaxed text-g600">
            Thank you — our team will review this listing shortly.
          </p>
          <Link href={routes.directory}>
            <Button variant="secondary" size="md">← Back to directory</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <Input
        name="stylist_name"
        label="Stylist / business name"
        placeholder="e.g. Natural Styles by Kemi"
        defaultValue={prefillName}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="issue_type"
          className="font-mono text-[10px] uppercase tracking-[1.5px] text-g600"
        >
          Issue type
        </label>
        <select
          id="issue_type"
          name="issue_type"
          required
          defaultValue=""
          className="w-full rounded-md border-[1.5px] border-g200 bg-paper px-3.5 py-3 font-sans text-sm text-ink outline-none transition-colors focus:border-ink appearance-none"
        >
          <option value="" disabled>Select an issue…</option>
          {REPORT_TYPES.map(type => (
            <option key={type} value={type}>
              {REPORT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <Textarea
        name="details"
        label="Details"
        hint="(min. 10 characters)"
        placeholder="Describe the issue in detail…"
        required
        rows={4}
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
        Submit report →
      </Button>
    </form>
  );
}

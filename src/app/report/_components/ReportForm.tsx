'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { submitReport, type ReportResult } from '@/lib/actions/report';
import { routes } from '@/config/routes';
import { REPORT_TYPES, REPORT_TYPE_LABELS, REPORT_TYPE_ICONS } from '@/constants';
import { cn } from '@/utils/cn';
import type { ReportType } from '@/constants';

interface ReportFormProps {
  prefillName?: string;
}

export function ReportForm({ prefillName }: ReportFormProps) {
  const [state, action, pending] = useActionState<ReportResult | null, FormData>(
    submitReport,
    null,
  );
  const [selectedType, setSelectedType] = useState<ReportType | ''>('');

  if (state?.ok) {
    return (
      <Container className="py-20 lg:py-28">
        <div className="mx-auto max-w-md text-center">
          <p className="mb-5 text-5xl" aria-hidden>✅</p>
          <h2 className="mb-3 font-serif text-display-md text-ink">
            Report <em className="italic text-g400">received</em>
          </h2>
          <p className="mb-8 text-sm font-light leading-relaxed text-g600">
            Thank you for helping keep BraidMap accurate. We&apos;ll review and
            update within 3–5 business days.
          </p>
          <Link href={routes.directory}>
            <Button variant="secondary" size="md">← Back to directory</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      {/* Hidden field carries the selected type to the server action */}
      <input type="hidden" name="issue_type" value={selectedType} />

      <Input
        name="stylist_name"
        label="Stylist / business name"
        placeholder="e.g. Natural Styles by Kemi"
        defaultValue={prefillName}
        hint="(optional)"
      />

      {/* Visual issue type cards */}
      <div>
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[1.5px] text-g600">
          Issue type <span className="normal-case text-danger">*</span>
        </p>
        <div
          className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          role="radiogroup"
          aria-label="Issue type"
        >
          {REPORT_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedType(type)}
              role="radio"
              aria-checked={selectedType === type}
              className={cn(
                'flex flex-col items-start gap-2 rounded-lg border p-3.5 text-left transition-colors',
                selectedType === type
                  ? 'border-ink bg-ink text-paper'
                  : 'border-g200 bg-paper text-ink hover:border-g400',
              )}
            >
              <span className="text-xl leading-none" aria-hidden>
                {REPORT_TYPE_ICONS[type]}
              </span>
              <span
                className={cn(
                  'font-mono text-[10px] leading-snug',
                  selectedType === type ? 'text-paper/80' : 'text-g600',
                )}
              >
                {REPORT_TYPE_LABELS[type]}
              </span>
            </button>
          ))}
        </div>
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

      <div className="flex items-center justify-between gap-4 border-t border-g200 pt-4">
        <p className="text-xs font-light text-g400">
          We review all reports within 3–5 business days. Thank you for helping
          keep BraidMap accurate.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={routes.directory}
            className="font-mono text-[11px] text-g400 no-underline hover:text-ink"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            loading={pending}
            size="md"
            disabled={!selectedType}
          >
            Submit report →
          </Button>
        </div>
      </div>
    </form>
  );
}

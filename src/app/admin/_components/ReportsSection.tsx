'use client';

import { useTransition } from 'react';
import { toast } from '@/components/ui/Toast';
import { resolveReport, rejectReport } from '@/lib/actions/admin';
import type { Report } from '@/services/admin';

interface Props { reports: Report[] }

export function ReportsSection({ reports }: Props) {
  if (reports.length === 0) {
    return (
      <EmptyState
        icon="✓"
        title="No open reports"
        body="All reports have been reviewed. Nice work."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {reports.map(r => (
        <ReportRow key={r.id} report={r} />
      ))}
    </ul>
  );
}

function ReportRow({ report }: { report: Report }) {
  const [isPending, startTransition] = useTransition();

  const handle = (action: (id: string) => Promise<{ ok: boolean; error?: string }>, label: string) => {
    startTransition(async () => {
      const res = await action(report.id);
      if (res.ok) {
        toast(`Report marked as ${label}`, 'success');
      } else {
        toast(res.error ?? 'Something went wrong', 'error');
      }
    });
  };

  // The details field stores "stylist_name\n\nbody" (set in submitReport action)
  const [stylistName, ...bodyParts] = report.details.split('\n\n');
  const body = bodyParts.join('\n\n');

  return (
    <li className="rounded-lg border border-g200 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">{stylistName || '—'}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-g400">
            {report.issue_type.replace(/_/g, ' ')}
          </p>
        </div>
        <time className="font-mono text-[10px] text-g400">
          {new Date(report.created_at).toLocaleDateString('en-CA')}
        </time>
      </div>

      {body && (
        <p className="mb-4 max-w-prose rounded-md bg-g100 px-3 py-2 text-xs leading-relaxed text-g600">
          {body}
        </p>
      )}

      <div className="flex gap-2">
        <ActionButton
          onClick={() => handle(resolveReport, 'resolved')}
          disabled={isPending}
          variant="primary"
        >
          Resolve
        </ActionButton>
        <ActionButton
          onClick={() => handle(rejectReport, 'rejected')}
          disabled={isPending}
          variant="ghost"
        >
          Dismiss
        </ActionButton>
      </div>
    </li>
  );
}

// ── Suggestions ───────────────────────────────────────────────────────────────

import { approveSuggestion, rejectSuggestion } from '@/lib/actions/admin';
import type { Suggestion } from '@/services/admin';

interface SuggestionsProps { suggestions: Suggestion[] }

export function SuggestionsSection({ suggestions }: SuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon="✓"
        title="No pending suggestions"
        body="All suggestions have been reviewed."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {suggestions.map(s => (
        <SuggestionRow key={s.id} suggestion={s} />
      ))}
    </ul>
  );
}

function SuggestionRow({ suggestion: s }: { suggestion: Suggestion }) {
  const [isPending, startTransition] = useTransition();

  const handle = (action: (id: string) => Promise<{ ok: boolean; error?: string }>, label: string) => {
    startTransition(async () => {
      const res = await action(s.id);
      if (res.ok) {
        toast(`Suggestion ${label}`, 'success');
      } else {
        toast(res.error ?? 'Something went wrong', 'error');
      }
    });
  };

  return (
    <li className="rounded-lg border border-g200 p-4">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-ink">{s.business_name}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-g400">
            {s.city}
            {s.instagram && ` · @${s.instagram}`}
          </p>
        </div>
        <time className="font-mono text-[10px] text-g400">
          {new Date(s.created_at).toLocaleDateString('en-CA')}
        </time>
      </div>

      {s.styles.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1">
          {s.styles.map(style => (
            <span
              key={style}
              className="rounded-sm border border-g200 bg-g100 px-1.5 py-0.5 font-mono text-[10px] text-g600"
            >
              {style}
            </span>
          ))}
        </div>
      )}

      {s.notes && (
        <p className="mb-4 max-w-prose rounded-md bg-g100 px-3 py-2 text-xs leading-relaxed text-g600">
          {s.notes}
        </p>
      )}

      <div className="flex gap-2">
        <ActionButton
          onClick={() => handle(approveSuggestion, 'approved')}
          disabled={isPending}
          variant="primary"
        >
          Approve
        </ActionButton>
        <ActionButton
          onClick={() => handle(rejectSuggestion, 'rejected')}
          disabled={isPending}
          variant="ghost"
        >
          Reject
        </ActionButton>
      </div>
    </li>
  );
}

// ── Stylist visibility ────────────────────────────────────────────────────────

import { toggleStylistVisibility } from '@/lib/actions/admin';
import type { Stylist } from '@/services/admin';

interface StylistsProps { stylists: Stylist[] }

export function StylistVisibilitySection({ stylists }: StylistsProps) {
  if (stylists.length === 0) {
    return <EmptyState icon="✦" title="No stylists" body="No stylist profiles exist yet." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-g200">
      <table className="w-full min-w-[540px] text-left text-sm">
        <thead>
          <tr className="border-b border-g200 bg-g100">
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-g400">Name</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-g400">City</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-g400">Status</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-wider text-g400">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-g200">
          {stylists.map(s => (
            <StylistRow key={s.id} stylist={s} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StylistRow({ stylist: s }: { stylist: Stylist }) {
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      const res = await toggleStylistVisibility(s.id, !s.published);
      if (res.ok) {
        toast(`${s.name} ${!s.published ? 'published' : 'unpublished'}`, 'success');
      } else {
        toast(res.error ?? 'Something went wrong', 'error');
      }
    });
  };

  return (
    <tr className="transition-colors hover:bg-g100/50">
      <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
      <td className="px-4 py-3 text-g600">{s.city}</td>
      <td className="px-4 py-3">
        <span
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px]',
            s.published
              ? 'bg-green-50 text-green-700'
              : 'bg-g100 text-g400',
          ].join(' ')}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${s.published ? 'bg-green-500' : 'bg-g400'}`} />
          {s.published ? 'Published' : 'Hidden'}
        </span>
      </td>
      <td className="px-4 py-3">
        <ActionButton onClick={toggle} disabled={isPending} variant="ghost" size="xs">
          {isPending ? '…' : s.published ? 'Hide' : 'Publish'}
        </ActionButton>
      </td>
    </tr>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function EmptyState({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-g200 py-12 text-center">
      <p className="mb-2 text-3xl opacity-40" aria-hidden>{icon}</p>
      <p className="font-serif text-lg text-ink">{title}</p>
      <p className="mx-auto mt-1 max-w-xs text-xs text-g400">{body}</p>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant,
  size = 'sm',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  variant: 'primary' | 'ghost';
  size?: 'sm' | 'xs';
}) {
  const base = 'rounded-md font-mono uppercase tracking-wider transition-colors disabled:opacity-40';
  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    xs: 'px-2 py-1 text-[10px]',
  };
  const variants = {
    primary: 'bg-ink text-paper hover:opacity-85',
    ghost:   'border border-g200 text-g600 hover:border-ink hover:text-ink',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[base, sizes[size], variants[variant]].join(' ')}
    >
      {children}
    </button>
  );
}

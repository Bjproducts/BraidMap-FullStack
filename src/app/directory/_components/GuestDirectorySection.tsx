'use client';

import { useState } from 'react';
import { GateModal } from '@/components/ui/GateModal';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatTag } from '@/utils/formatTag';
import { cn } from '@/utils/cn';

interface GuestStylist {
  id: string;
  name: string;
  city: string | null;
  handle: string | null;
  tags: string[];
  service_count: number;
}

interface GuestDirectorySectionProps {
  stylists: GuestStylist[];
  total: number;
  activeTag?: string;
}

export function GuestDirectorySection({
  stylists,
  total,
  activeTag,
}: GuestDirectorySectionProps) {
  const [gateOpen, setGateOpen] = useState(false);

  const visible = stylists.slice(0, 3);
  const locked  = stylists.slice(3, 9);

  return (
    <>
      <GateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} totalCount={total} />

      <section aria-label="Stylist listings">
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {/* Free preview cards — click triggers gate */}
          {visible.map(s => (
            <button
              key={s.id}
              className="cursor-pointer text-left"
              onClick={() => setGateOpen(true)}
              aria-label={`${s.name} — sign up to view full profile`}
            >
              <StylistCard s={s} activeTag={activeTag} />
            </button>
          ))}

          {/* Locked / blurred cards */}
          {locked.map(s => (
            <button
              key={s.id}
              className="relative cursor-pointer text-left"
              onClick={() => setGateOpen(true)}
              aria-label="Sign up to unlock this stylist"
            >
              <div className="pointer-events-none select-none blur-[5px]" aria-hidden>
                <StylistCard s={s} activeTag={activeTag} />
              </div>
              <div className="absolute inset-0 rounded-lg bg-white/30 opacity-0 transition-opacity hover:opacity-100" />
            </button>
          ))}
        </div>

        {/* Fade overlay below locked cards */}
        {locked.length > 0 && (
          <div
            aria-hidden
            className="pointer-events-none relative -mt-20 h-24 bg-gradient-to-b from-transparent to-[#fafafa]"
          />
        )}

        {/* Lock banner */}
        <div className="mt-2 rounded-xl border border-g200 bg-paper px-8 py-10 text-center">
          <p className="mb-3 text-3xl" aria-hidden>🔒</p>
          <h3 className="mb-1 font-serif text-2xl text-ink">
            Sign up to see all{' '}
            <em className="italic text-g400">{total} stylists</em>
          </h3>
          <p className="mb-6 text-sm font-light leading-relaxed text-g600">
            You&apos;re seeing {visible.length} of {total} stylists. Create a
            free account to unlock the full directory.
          </p>
          <Button onClick={() => setGateOpen(true)} size="md">
            Unlock full directory →
          </Button>
        </div>
      </section>
    </>
  );
}

function StylistCard({
  s,
  activeTag,
}: {
  s: GuestStylist;
  activeTag?: string;
}) {
  return (
    <Card className="h-full group">
      <CardBody>
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink font-serif text-base italic text-paper">
            {s.name.charAt(0).toUpperCase()}
          </div>
          <span className="rounded-sm border border-g200 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-g400">
            {s.city ?? 'BC'}
          </span>
        </div>
        <h3 className="font-serif text-base leading-tight text-ink">{s.name}</h3>
        {s.handle && (
          <p className="font-mono text-[10px] text-g400">@{s.handle}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-1">
          {s.tags.slice(0, 3).map(t => (
            <span
              key={t}
              className={cn(
                'rounded-sm border px-1.5 py-0.5 font-mono text-[10px]',
                activeTag && t === activeTag
                  ? 'border-ink bg-ink text-paper'
                  : 'border-g200 bg-g100 text-g600',
              )}
            >
              {formatTag(t)}
            </span>
          ))}
          {s.tags.length > 3 && (
            <span className="rounded-sm border border-g200 bg-g100 px-1.5 py-0.5 font-mono text-[10px] text-g600">
              +{s.tags.length - 3}
            </span>
          )}
        </div>
      </CardBody>
      <CardFooter>
        <span className="font-serif text-sm italic text-g400">
          {s.service_count} services
        </span>
        <span className="flex h-7 w-7 items-center justify-center rounded-md border border-g200 text-base text-g400">
          ♡
        </span>
      </CardFooter>
    </Card>
  );
}

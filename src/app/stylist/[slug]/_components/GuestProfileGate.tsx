'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { GateModal } from '@/components/ui/GateModal';
import { routes } from '@/config/routes';

export function GuestProfileGate() {
  const [modalOpen, setModalOpen] = useState(false);

  // Auto-open the gate modal immediately on mount (match MVP behaviour)
  useEffect(() => {
    const timer = setTimeout(() => setModalOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <GateModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        totalCount={121}
      />

      {/* Sticky overlay banner */}
      <div className="rounded-lg border border-g200 bg-paper p-8 text-center shadow-md">
        <p className="mb-3 text-3xl" aria-hidden>🔒</p>
        <Eyebrow className="mb-2">Members only</Eyebrow>
        <h3 className="mb-2 font-serif text-2xl text-ink">
          Sign up to view full{' '}
          <em className="italic text-g400">profiles</em>
        </h3>
        <p className="mb-6 text-sm font-light leading-relaxed text-g600">
          Create a free account to see services, contact info, and book your
          appointment.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => setModalOpen(true)} size="md">
            Sign up free →
          </Button>
          <Link href={routes.directory}>
            <Button variant="secondary" size="md">
              ← Back to directory
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}

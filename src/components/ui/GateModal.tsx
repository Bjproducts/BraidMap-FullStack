'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';

export interface GateModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount?: number;
}

export function GateModal({ isOpen, onClose, totalCount = 121 }: GateModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prev;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-g200 bg-paper p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md font-sans text-xl leading-none text-g400 transition-colors hover:bg-g100 hover:text-ink"
          aria-label="Close"
        >
          ×
        </button>

        <Eyebrow className="mb-2">Join BraidMap</Eyebrow>
        <h2
          id="gate-modal-title"
          className="mb-3 font-serif text-display-md text-ink"
        >
          Unlock all{' '}
          <em className="italic text-g400">{totalCount} stylists</em>
        </h2>
        <p className="mb-7 text-sm font-light leading-relaxed text-g600">
          Sign up free to browse every BIPOC hairstylist across BC — knotless
          braids, locs, silk press, and more.
        </p>

        <div className="flex flex-col gap-3">
          <Link href={routes.signup} onClick={onClose} className="block">
            <Button size="md" className="w-full">
              Sign up free →
            </Button>
          </Link>
          <Link href={routes.login} onClick={onClose} className="block">
            <Button size="md" variant="secondary" className="w-full">
              Log in
            </Button>
          </Link>
        </div>

        <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-wider text-g400">
          Free forever · No spam · Unsubscribe anytime
        </p>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';

interface ClaimProfileModalProps {
  stylistName: string;
}

export function ClaimProfileModal({ stylistName }: ClaimProfileModalProps) {
  const [isOpen, setIsOpen]       = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission delay (form data would go to an API route in prod)
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full rounded-lg border border-g200 p-5 text-left transition-colors hover:border-g400 hover:bg-g100"
      >
        <Eyebrow className="mb-1">Business owner?</Eyebrow>
        <p className="font-serif text-base text-ink">Claim this profile</p>
        <p className="mt-1 text-sm font-light text-g600">
          Verify ownership to manage your listing.
        </p>
        <p className="mt-2 font-mono text-[10px] text-g400">Claim Profile →</p>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-modal-title"
        >
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-g200 bg-paper p-8 shadow-2xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md font-sans text-xl leading-none text-g400 hover:bg-g100 hover:text-ink"
              aria-label="Close"
            >
              ×
            </button>

            {submitted ? (
              <div className="text-center py-4">
                <p className="mb-4 text-4xl" aria-hidden>✅</p>
                <Eyebrow className="mb-2">Request received</Eyebrow>
                <h3 className="mb-3 font-serif text-display-sm text-ink">
                  We&apos;ll be in touch
                </h3>
                <p className="text-sm font-light text-g600">
                  We&apos;ll review your claim and reach out within 3–5 business days.
                </p>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="secondary"
                  size="md"
                  className="mt-6"
                >
                  Close
                </Button>
              </div>
            ) : (
              <>
                <Eyebrow className="mb-2">Business owner</Eyebrow>
                <h2
                  id="claim-modal-title"
                  className="mb-2 font-serif text-display-sm text-ink"
                >
                  Claim{' '}
                  <em className="italic text-g400">this profile</em>
                </h2>
                <p className="mb-6 text-sm font-light text-g600">
                  Fill in your details and we&apos;ll reach out to verify within
                  3–5 business days.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input type="hidden" name="stylist" value={stylistName} />
                  <Input
                    name="your_name"
                    label="Your name"
                    placeholder="Your full name"
                    required
                  />
                  <Input
                    name="your_email"
                    label="Your email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                  <Input
                    name="your_phone"
                    label="Your phone"
                    type="tel"
                    placeholder="+1 (604) 000-0000"
                    hint="(optional)"
                  />
                  <Textarea
                    name="message"
                    label="Message"
                    placeholder="Any additional context…"
                    hint="(optional)"
                    rows={3}
                  />
                  <div className="flex gap-3 pt-1">
                    <Button type="submit" loading={loading} size="md" className="flex-1">
                      Submit claim →
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

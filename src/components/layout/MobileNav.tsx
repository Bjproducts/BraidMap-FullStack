'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth/actions';
import { routes } from '@/config/routes';

interface MobileNavProps {
  user: { email?: string | null } | null;
  initial: string;
  firstName: string;
}

export function MobileNav({ user, initial, firstName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setIsOpen(false), []);
  const open  = useCallback(() => setIsOpen(true), []);

  // Close on route change
  useEffect(() => { close(); }, [pathname, close]);

  // Escape key + focus trap (only when open)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        hamburgerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;

      const drawer = document.getElementById('bm-mobile-nav');
      if (!drawer) return;
      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    // Move focus into drawer on open
    requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isOpen, close]);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* ── Hamburger button (mobile only) ─────────────────────────── */}
      <button
        ref={hamburgerRef}
        onClick={open}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="bm-mobile-nav"
        className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-md text-g600 transition-colors hover:bg-g100 hover:text-ink md:hidden"
      >
        <span className="block h-px w-[18px] bg-current" />
        <span className="block h-px w-[18px] bg-current" />
        <span className="block h-px w-[11px] self-start bg-current" />
      </button>

      {/* ── Backdrop ────────────────────────────────────────────────── */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        aria-hidden="true"
        onClick={close}
        className={[
          'fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm transition-opacity duration-200 md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      {/* ── Drawer ──────────────────────────────────────────────────── */}
      <div
        id="bm-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          'fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col bg-paper shadow-2xl',
          'transition-transform duration-300 ease-out md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-g200 px-5 py-[18px]">
          <span className="font-serif text-base italic text-ink">BraidMap</span>
          <button
            ref={closeButtonRef}
            onClick={close}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded-md text-g400 transition-colors hover:bg-g100 hover:text-ink"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* User badge */}
        {user && (
          <div className="border-b border-g200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink font-serif text-sm italic text-paper">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{firstName}</p>
                <p className="truncate font-mono text-[10px] text-g400">{user.email ?? ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav aria-label="Mobile navigation" className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          <NavLink href={routes.directory} current={pathname}>
            Find a stylist
          </NavLink>

          {user ? (
            <>
              <NavLink href={routes.dashboard} current={pathname}>
                My dashboard
              </NavLink>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <NavLink href={routes.report as any} current={pathname}>
                Report an issue
              </NavLink>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <NavLink href={routes.suggest as any} current={pathname}>
                Suggest a stylist
              </NavLink>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-2 border-t border-g200 pt-3">
              <Link
                href={routes.login}
                className="w-full rounded-md border border-g200 px-4 py-2.5 text-center text-sm font-medium text-g600 no-underline transition-colors hover:border-ink hover:text-ink"
              >
                Log in
              </Link>
              <Link
                href={routes.signup}
                className="w-full rounded-md bg-ink px-4 py-2.5 text-center text-sm font-semibold text-paper no-underline transition-opacity hover:opacity-85"
              >
                Join free
              </Link>
            </div>
          )}
        </nav>

        {/* Sign out footer */}
        {user && (
          <div className="border-t border-g200 p-3">
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-md px-3 py-2.5 text-left font-mono text-[11px] uppercase tracking-wider text-g400 transition-colors hover:bg-g100 hover:text-ink"
              >
                Sign out →
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

// ── Shared active-aware nav link ─────────────────────────────────────────────

function NavLink({
  href,
  current,
  children,
}: {
  href: string;
  current: string;
  children: React.ReactNode;
}) {
  const isActive =
    href === '/'
      ? current === '/'
      : current === href || current.startsWith(href + '/');

  return (
    <Link
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      href={href as any}
      className={[
        'rounded-md px-3 py-2.5 text-sm no-underline transition-colors',
        isActive
          ? 'bg-g100 font-medium text-ink'
          : 'text-g600 hover:bg-g100 hover:text-ink',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}

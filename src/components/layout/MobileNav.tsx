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

  // Escape key + basic focus trap
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
      {/* ── Hamburger ── */}
      <button
        ref={hamburgerRef}
        onClick={open}
        aria-label="Open navigation menu"
        aria-expanded={isOpen}
        aria-controls="bm-mobile-nav"
        className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-md text-g600 transition-colors hover:bg-g100 hover:text-ink md:hidden"
      >
        <span className="block h-[1.5px] w-[20px] bg-current transition-all" />
        <span className="block h-[1.5px] w-[20px] bg-current transition-all" />
        <span className="block h-[1.5px] w-[14px] self-start bg-current transition-all" />
      </button>

      {/* ── Backdrop ── */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        aria-hidden="true"
        onClick={close}
        className={[
          'fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
      />

      {/* ── Drawer ── */}
      <div
        id="bm-mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          'fixed inset-y-0 right-0 z-50 flex h-full w-[300px] max-w-[88vw] flex-col bg-paper',
          'shadow-[−4px_0_32px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-g200">
          <span className="font-mono text-[10px] uppercase tracking-[2px] text-g400">Menu</span>
          <button
            ref={closeButtonRef}
            onClick={close}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-md text-g400 transition-colors hover:bg-g100 hover:text-ink"
          >
            {/* Larger, easier-to-tap × */}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* User badge (authenticated) */}
        {user && (
          <div className="border-b border-g200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ink font-serif text-sm italic text-paper">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{firstName}</p>
                <p className="truncate font-mono text-[10px] text-g400">{user.email ?? ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav
          aria-label="Mobile navigation"
          className="flex flex-1 flex-col overflow-y-auto p-4 gap-1"
        >
          <NavLink href={routes.home} current={pathname}>Home</NavLink>
          <NavLink href={routes.directory} current={pathname}>Find a stylist</NavLink>

          {user && (
            <>
              <div className="my-2 border-t border-g200" />
              <NavLink href={routes.dashboard} current={pathname}>My dashboard</NavLink>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <NavLink href={routes.report as any} current={pathname}>Report an issue</NavLink>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <NavLink href={routes.suggest as any} current={pathname}>Suggest a stylist</NavLink>
            </>
          )}
        </nav>

        {/* Bottom CTA / Sign-out */}
        <div className="border-t border-g200 p-4">
          {user ? (
            <form action={logout}>
              <button
                type="submit"
                className="w-full rounded-lg border border-g200 px-4 py-3 text-left font-mono text-[11px] uppercase tracking-wider text-g400 transition-colors hover:bg-g100 hover:text-ink"
              >
                Sign out →
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href={routes.signup}
                className="w-full rounded-lg bg-ink px-4 py-3 text-center text-sm font-semibold text-paper no-underline transition-opacity hover:opacity-85"
              >
                Join free →
              </Link>
              <Link
                href={routes.login}
                className="w-full rounded-lg border border-g200 px-4 py-3 text-center text-sm font-medium text-g600 no-underline transition-colors hover:border-ink hover:text-ink"
              >
                Log in
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Active-aware nav link ────────────────────────────────────────────────────

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
        'flex items-center rounded-lg px-3 py-3 text-sm font-medium no-underline transition-colors',
        isActive
          ? 'bg-ink text-paper'
          : 'text-g600 hover:bg-g100 hover:text-ink',
      ].join(' ')}
    >
      {children}
    </Link>
  );
}

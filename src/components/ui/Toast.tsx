'use client';

import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/utils/cn';

export type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

/** Call from any client code to show a toast notification. */
export function toast(message: string, variant: ToastVariant = 'info') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('bm:toast', { detail: { message, variant } }),
  );
}

/** Mount once in root layout — listens for bm:toast events and renders toasts. */
export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, variant: ToastVariant) => {
    const id = Math.random().toString(36).slice(2);
    setItems(prev => [...prev, { id, message, variant }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  useEffect(() => {
    function onToast(e: Event) {
      const { message, variant } = (e as CustomEvent).detail as {
        message: string;
        variant: ToastVariant;
      };
      push(message, variant);
    }
    window.addEventListener('bm:toast', onToast);
    return () => window.removeEventListener('bm:toast', onToast);
  }, [push]);

  if (!items.length) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2"
    >
      {items.map(t => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex min-w-[260px] max-w-[380px] items-start gap-3',
            'animate-fadeUp rounded-lg border px-4 py-3 font-sans text-sm shadow-xl',
            t.variant === 'success' && 'border-success/30 bg-paper text-ink',
            t.variant === 'error'   && 'border-danger/30  bg-paper text-ink',
            t.variant === 'info'    && 'border-g800        bg-ink   text-paper',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
              t.variant === 'success' && 'bg-success text-white',
              t.variant === 'error'   && 'bg-danger  text-white',
              t.variant === 'info'    && 'bg-paper/20 text-paper',
            )}
          >
            {t.variant === 'success' ? '✓' : t.variant === 'error' ? '✕' : '→'}
          </span>
          <span className="leading-snug">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

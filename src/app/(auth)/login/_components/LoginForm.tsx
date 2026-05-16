'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { loginAction, type AuthResult } from '@/lib/auth/actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(
    loginAction,
    null,
  );

  // Scroll error into view on mobile
  useEffect(() => {
    if (state && !state.ok) {
      document.getElementById('login-error')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {/* Inline error banner */}
      {state && !state.ok && (
        <div
          id="login-error"
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="jane@example.com"
        autoComplete="email"
        required
        aria-describedby={state && !state.ok ? 'login-error' : undefined}
      />
      <Input
        name="password"
        type="password"
        label="Password"
        autoComplete="current-password"
        required
      />

      <Button type="submit" size="md" loading={pending} className="mt-2 w-full">
        {pending ? 'Logging in…' : 'Log in →'}
      </Button>

      <p className="text-center text-xs text-g400">
        Don&apos;t have an account?{' '}
        <Link
          href={routes.signup}
          className="font-semibold text-ink underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}

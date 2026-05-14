'use client';

import { useActionState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { signupAction, type AuthResult } from '@/lib/auth/actions';

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthResult | null, FormData>(
    signupAction,
    null,
  );

  useEffect(() => {
    if (state && !state.ok) {
      document.getElementById('signup-error')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {/* Inline error banner */}
      {state && !state.ok && (
        <div
          id="signup-error"
          role="alert"
          aria-live="polite"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <Input
        name="fullName"
        type="text"
        label="Full name"
        placeholder="Jane Doe"
        autoComplete="name"
        required
        aria-describedby={state && !state.ok ? 'signup-error' : undefined}
      />
      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="jane@example.com"
        autoComplete="email"
        required
      />
      <Input
        name="password"
        type="password"
        label="Password"
        hint="Min 8 characters"
        autoComplete="new-password"
        minLength={8}
        required
      />

      <Button type="submit" size="md" loading={pending} className="mt-2 w-full">
        {pending ? 'Creating account…' : 'Create account →'}
      </Button>

      <p className="text-center text-xs text-g400">
        Already have an account?{' '}
        <Link
          href={routes.login}
          className="font-semibold text-ink underline-offset-4 hover:underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}

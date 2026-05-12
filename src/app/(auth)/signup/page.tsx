import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { signup } from '@/lib/auth/actions';

export const metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <Container className="py-20 lg:py-28">
      <div className="mx-auto max-w-md">
        <Eyebrow className="mb-3">Join BraidMap</Eyebrow>
        <h1 className="mb-2 font-serif text-display-lg text-ink">
          Create your <em className="italic text-g400">free account</em>
        </h1>
        <p className="mb-8 text-sm font-light leading-relaxed text-g600">
          Unlock the full directory and track your favourite stylists.
        </p>

        <form action={signup} className="flex flex-col gap-4">
          <Input
            name="fullName"
            type="text"
            label="Full name"
            placeholder="Jane Doe"
            autoComplete="name"
            required
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
            hint="(min 8 characters)"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Button type="submit" size="md" className="mt-2 w-full">
            Create account →
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-g400">
          Already have an account?{' '}
          <Link href={routes.login} className="font-semibold text-ink underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </Container>
  );
}

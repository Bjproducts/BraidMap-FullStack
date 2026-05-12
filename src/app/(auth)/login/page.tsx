import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { login } from '@/lib/auth/actions';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <Container className="py-20 lg:py-28">
      <div className="mx-auto max-w-md">
        <Eyebrow className="mb-3">Welcome back</Eyebrow>
        <h1 className="mb-2 font-serif text-display-lg text-ink">
          Log <em className="italic text-g400">in</em>
        </h1>
        <p className="mb-8 text-sm font-light leading-relaxed text-g600">
          Access your BraidMap profile, favourites, and dashboard.
        </p>

        <form action={login} className="flex flex-col gap-4">
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
            autoComplete="current-password"
            required
          />
          <Button type="submit" size="md" className="mt-2 w-full">
            Log in →
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-g400">
          Don't have an account?{' '}
          <Link href={routes.signup} className="font-semibold text-ink underline-offset-4 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </Container>
  );
}

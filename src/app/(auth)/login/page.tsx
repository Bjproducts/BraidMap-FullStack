import { Eyebrow } from '@/components/ui/Eyebrow';
import LoginForm from './_components/LoginForm';

export const metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Eyebrow className="mb-3">Welcome back</Eyebrow>
      <h1 className="mb-2 font-serif text-display-lg text-ink">
        Log <em className="italic text-g400">in</em>
      </h1>
      <p className="mb-8 text-sm font-light leading-relaxed text-g600">
        Access your BraidMap profile, favourites, and dashboard.
      </p>
      <LoginForm />
    </div>
  );
}

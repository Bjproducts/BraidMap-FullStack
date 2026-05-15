import { Eyebrow } from '@/components/ui/Eyebrow';
import { SignupForm } from './_components/SignupForm';

export const metadata = { title: 'Sign up' };

export default function SignupPage() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Eyebrow className="mb-3">Join BraidMap</Eyebrow>
      <h1 className="mb-2 font-serif text-display-lg text-ink">
        Create your <em className="italic text-g400">free account</em>
      </h1>
      <p className="mb-8 text-sm font-light leading-relaxed text-g600">
        Unlock the full directory and track your favourite stylists.
      </p>
      <SignupForm />
    </div>
  );
}

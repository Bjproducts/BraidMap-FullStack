import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SuggestForm } from './_components/SuggestForm';

export const metadata = { title: 'Suggest a stylist' };

export default function SuggestPage() {
  return (
    <Container className="py-20 lg:py-28">
      <div className="mx-auto max-w-lg">
        <Eyebrow className="mb-3">Suggest a stylist</Eyebrow>
        <h1 className="mb-2 font-serif text-display-lg text-ink">
          Know someone <em className="italic text-g400">great?</em>
        </h1>
        <p className="mb-8 text-sm font-light leading-relaxed text-g600">
          Help grow the directory — suggest a BIPOC hairstylist in BC and
          we&apos;ll review them for listing.
        </p>
        <SuggestForm />
      </div>
    </Container>
  );
}

import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { ReportForm } from './_components/ReportForm';

export const metadata = { title: 'Report a listing' };

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ stylist?: string }>;
}) {
  const sp = await searchParams;

  return (
    <Container className="py-20 lg:py-28">
      <div className="mx-auto max-w-lg">
        <Eyebrow className="mb-3">Report a listing</Eyebrow>
        <h1 className="mb-2 font-serif text-display-lg text-ink">
          Flag an <em className="italic text-g400">issue</em>
        </h1>
        <p className="mb-8 text-sm font-light leading-relaxed text-g600">
          See something wrong? Let us know and we&apos;ll review the listing.
        </p>
        <ReportForm prefillName={sp.stylist} />
      </div>
    </Container>
  );
}

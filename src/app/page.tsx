import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <Container className="relative">
          <Eyebrow className="mb-5 text-white/30">BC's BIPOC hair directory · Est. 2026</Eyebrow>
          <h1 className="max-w-4xl font-serif text-display-xl text-paper">
            Find your <em className="italic text-paper/40">next</em>
            <br />
            hair stylist
          </h1>
          <p className="mt-6 max-w-md text-[15px] font-light leading-relaxed text-paper/40">
            Discover talented BIPOC hairstylists across British Columbia — from knotless braids to
            locs, wigs to silk press.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={routes.directory}>
              <Button size="lg" variant="primary" className="bg-paper text-ink hover:opacity-85">
                Browse stylists →
              </Button>
            </Link>
            <Link href={routes.signup}>
              <Button
                size="lg"
                variant="secondary"
                className="border-paper/30 text-paper hover:border-paper hover:text-paper"
              >
                Join free
              </Button>
            </Link>
          </div>
        </Container>
      </section>

      {/* TRUST ROW */}
      <section className="border-b border-g200 px-6 py-12 sm:px-8 lg:px-12">
        <Container className="grid grid-cols-3 gap-6 text-center sm:text-left">
          {[
            { num: '121', label: 'Stylists listed' },
            { num: '16',  label: 'Cities in BC' },
            { num: '22',  label: 'Style categories' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="font-serif text-display-md text-ink">{num}</p>
              <Eyebrow className="mt-1">{label}</Eyebrow>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}

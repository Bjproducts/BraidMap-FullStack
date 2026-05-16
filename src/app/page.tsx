import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { routes } from '@/config/routes';
import { formatTag } from '@/utils/formatTag';
import { getFeaturedStylists, getCitiesAndTags, getTagCounts } from '@/services/stylists';
import { getSession } from '@/lib/auth/getSession';
import { HomeSearchBar } from '@/components/HomeSearchBar';
import { HomeGateTrigger } from '@/components/HomeGateTrigger';

export default async function HomePage() {
  const [featured, { cities }, tagCounts, session] = await Promise.all([
    getFeaturedStylists(6).catch(() => []),
    getCitiesAndTags().catch(() => ({ cities: [] as string[], tags: [] as string[] })),
    getTagCounts().catch(() => []),
    getSession(),
  ]);

  const heroFeatured = featured.slice(0, 3);
  const nearYou      = featured.slice(0, 6);
  const topTags      = tagCounts.slice(0, 22);

  // Marquee tags (repeat for seamless scroll)
  const marqueeItems = [
    'Knotless Braids', 'Cornrows', 'Locs', 'Silk Press', 'Twists',
    'Wigs', 'Box Braids', 'Sew-In', 'Crochet', 'Bridal Hair',
    'Natural Hair', 'Men\'s Braids', 'Kids\' Braids', 'Ponytails',
  ];

  return (
    <>
      {/* Auto gate for guests after 4 s */}
      {!session && <HomeGateTrigger totalCount={121} />}

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <Container className="relative grid gap-0 lg:grid-cols-2">
          {/* Left: headline + search */}
          <div className="flex flex-col justify-center px-6 py-14 sm:px-8 sm:py-24 lg:py-32 lg:pr-16">
            <Eyebrow className="mb-5 text-white/30">
              BC&apos;s BIPOC hair directory · Est. 2026
            </Eyebrow>
            <h1 className="max-w-xl font-serif text-[40px] leading-[1.05] tracking-[-1.5px] text-paper sm:text-display-xl">
              Find your <em className="italic text-paper/40">next</em>
              <br />
              hair stylist
            </h1>
            <p className="mt-6 max-w-md text-[15px] font-light leading-relaxed text-paper/40">
              Discover talented BIPOC hairstylists across British Columbia —
              from knotless braids to locs, wigs to silk press.
            </p>

            {/* Search bar */}
            <div className="mt-8 max-w-lg">
              <HomeSearchBar cities={cities} />
            </div>

            {/* Stats */}
            <div className="mt-10 flex gap-8">
              {[
                { num: '121', label: 'Stylists' },
                { num: '16',  label: 'Cities' },
                { num: '22',  label: 'Style tags' },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p className="font-serif text-display-md leading-none text-paper">
                    {num}
                  </p>
                  <Eyebrow className="mt-1 text-paper/30">{label}</Eyebrow>
                </div>
              ))}
            </div>
          </div>

          {/* Right: featured stylist cards */}
          {heroFeatured.length > 0 && (
            <div className="hidden border-l border-paper/10 px-8 py-24 lg:flex lg:flex-col lg:justify-center lg:gap-3">
              <Eyebrow className="mb-4 text-paper/30">Featured stylists</Eyebrow>
              {heroFeatured.map(s => (
                <Link
                  key={s.id}
                  href={session ? routes.stylist(s.slug) : routes.signup}
                  className="group flex items-center gap-4 rounded-lg border border-paper/10 p-4 no-underline transition-all hover:border-paper/25 hover:bg-paper/5"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-paper/10 font-serif text-sm italic text-paper">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-paper truncate">{s.name}</p>
                    <p className="font-mono text-[10px] text-paper/40">{s.city}, BC</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {s.tags.slice(0, 3).map(t => (
                        <span
                          key={t}
                          className="rounded-sm border border-paper/15 px-1.5 py-0.5 font-mono text-[9px] text-paper/50"
                        >
                          {formatTag(t)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-paper/30 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* ── TRUST ROW ── */}
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

      {/* ── STYLISTS NEAR YOU ── */}
      {nearYou.length > 0 && (
        <section className="border-b border-g200 px-6 py-16 sm:px-8 lg:px-12">
          <Container>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <Eyebrow className="mb-2">Discover</Eyebrow>
                <h2 className="font-serif text-display-lg text-ink">
                  Stylists <em className="italic text-g400">near you</em>
                </h2>
              </div>
              <Link
                href={routes.directory}
                className="font-mono text-[10px] uppercase tracking-wider text-g400 no-underline hover:text-ink"
              >
                View all 121 →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {nearYou.map(s => (
                <Link
                  key={s.id}
                  href={session ? routes.stylist(s.slug) : routes.signup}
                  className="group flex flex-col gap-3 rounded-lg border border-g200 bg-paper p-5 no-underline transition-all hover:-translate-y-0.5 hover:border-g400 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink font-serif text-sm italic text-paper">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="rounded-sm border border-g200 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-g400">
                      {s.city}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-ink">{s.name}</h3>
                    {s.handle && (
                      <p className="font-mono text-[10px] text-g400">@{s.handle}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {s.tags.slice(0, 3).map(t => (
                      <span
                        key={t}
                        className="rounded-sm border border-g200 bg-g100 px-1.5 py-0.5 font-mono text-[10px] text-g600"
                      >
                        {formatTag(t)}
                      </span>
                    ))}
                    {s.tags.length > 3 && (
                      <span className="rounded-sm border border-g200 bg-g100 px-1.5 py-0.5 font-mono text-[10px] text-g600">
                        +{s.tags.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto border-t border-g200 pt-3">
                    <span className="font-serif text-sm italic text-g400">
                      {s.service_count} services
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── MARQUEE ── */}
      <div
        className="overflow-hidden border-b border-g200 bg-g100 py-4"
        aria-hidden
      >
        <div
          className="flex gap-6 whitespace-nowrap"
          style={{ animation: 'marquee 28s linear infinite' }}
        >
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span
              key={i}
              className="font-mono text-[11px] uppercase tracking-[2px] text-g400"
            >
              {item} ·
            </span>
          ))}
        </div>
        <style>{`
          @keyframes marquee {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* ── BROWSE BY STYLE ── */}
      {topTags.length > 0 && (
        <section className="border-b border-g200 px-6 py-16 sm:px-8 lg:px-12">
          <Container>
            <Eyebrow className="mb-3">Browse by style</Eyebrow>
            <h2 className="mb-8 font-serif text-display-lg text-ink">
              What are you <em className="italic text-g400">looking for?</em>
            </h2>
            <div className="flex flex-wrap gap-2">
              {topTags.map(({ tag, count }) => {
                /* eslint-disable @typescript-eslint/no-explicit-any */
                const tagHref = `${routes.directory}?tag=${encodeURIComponent(tag)}` as any;
                /* eslint-enable @typescript-eslint/no-explicit-any */
                return (
                <Link
                  key={tag}
                  href={tagHref}
                  className="group flex items-center gap-1.5 rounded-md border border-g200 px-3.5 py-2 font-mono text-[11px] no-underline transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <span className="text-ink transition-colors group-hover:text-paper">
                    {formatTag(tag)}
                  </span>
                  <span className="text-g400 transition-colors group-hover:text-paper/50">
                    ({count})
                  </span>
                </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section className="border-b border-g200 px-6 py-16 sm:px-8 lg:px-12">
        <Container>
          <Eyebrow className="mb-3">How it works</Eyebrow>
          <h2 className="mb-10 font-serif text-display-lg text-ink">
            Simple as <em className="italic text-g400">1, 2, 3</em>
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Search by style',
                body: 'Filter by the exact service you need — knotless, locs, silk press, and more.',
              },
              {
                num: '02',
                title: 'Browse & compare',
                body: 'See real stylists, their service list, location, and social media — all in one place.',
              },
              {
                num: '03',
                title: 'Book directly',
                body: 'Click through to their booking link or Instagram to lock in your appointment.',
              },
            ].map(step => (
              <div
                key={step.num}
                className="rounded-lg border border-g200 p-6 transition-colors hover:bg-g100"
              >
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[2px] text-g400">
                  {step.num}
                </p>
                <h3 className="mb-2 font-serif text-xl text-ink">{step.title}</h3>
                <p className="text-sm font-light leading-relaxed text-g600">{step.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="relative overflow-hidden bg-ink px-6 py-20 sm:px-8 lg:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <Container className="relative text-center">
          <Eyebrow className="mb-4 text-paper/30">Join the community</Eyebrow>
          <h2 className="mb-4 font-serif text-display-xl text-paper">
            Join the <em className="italic text-paper/40">community</em>
          </h2>
          <p className="mx-auto mb-8 max-w-md text-[15px] font-light leading-relaxed text-paper/50">
            100% free. No spam. Just access to BC&apos;s most complete BIPOC
            hairstylist directory.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href={routes.signup}>
              <Button size="lg" className="bg-paper text-ink hover:opacity-85">
                Join free →
              </Button>
            </Link>
            <Link href={routes.directory}>
              <Button
                size="lg"
                variant="secondary"
                className="border-paper/30 text-paper hover:border-paper hover:text-paper"
              >
                Browse directory
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}

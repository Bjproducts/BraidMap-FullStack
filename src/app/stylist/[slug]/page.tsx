import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { TrackView } from '@/components/TrackView';
import { getStylistBySlug, getRelatedStylists } from '@/services/stylists';
import { getUserFavoriteIds } from '@/services/favorites';
import { getSession } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';
import { formatTag } from '@/utils/formatTag';
import { cn } from '@/utils/cn';
import { GuestProfileGate } from './_components/GuestProfileGate';
import { ClaimProfileModal } from './_components/ClaimProfileModal';

interface Params { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const stylist = await getStylistBySlug(slug).catch(() => null);
  return {
    title: stylist?.name ?? 'Stylist',
    description: stylist
      ? `Book ${stylist.name} in ${stylist.city}, BC — ${stylist.tags.slice(0, 3).map(formatTag).join(', ')}`
      : undefined,
  };
}

export default async function StylistPage({ params }: Params) {
  const { slug } = await params;
  const [stylist, session] = await Promise.all([
    getStylistBySlug(slug),
    getSession(),
  ]);
  if (!stylist) notFound();

  const [favoriteIds, related] = await Promise.all([
    session ? getUserFavoriteIds(session.user.id) : Promise.resolve([]),
    getRelatedStylists(stylist.id, stylist.tags, stylist.city, 3).catch(() => []),
  ]);
  const isFavorited = favoriteIds.includes(stylist.id);

  return (
    <>
      <TrackView stylistId={stylist.id} />

      {/* Hero */}
      <header className="border-b border-g200 bg-ink px-6 py-16 sm:px-8 lg:px-12">
        <Container>
          <Link
            href={routes.directory}
            className="mb-8 inline-block font-mono text-[10px] uppercase tracking-[2px] text-paper/40 no-underline hover:text-paper"
          >
            ← Back to directory
          </Link>

          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-md bg-paper/10 font-serif text-3xl italic text-paper">
              {stylist.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <Eyebrow className="mb-2 text-paper/40">📍 {stylist.city}</Eyebrow>
              <div className="flex flex-wrap items-start gap-3">
                <h1 className="font-serif text-display-xl text-paper">{stylist.name}</h1>
                {session && (
                  <FavoriteButton
                    stylistId={stylist.id}
                    initialFavorited={isFavorited}
                    className="mt-2"
                  />
                )}
              </div>
              {stylist.handle && (
                <p className="mt-1 font-mono text-xs text-paper/40">@{stylist.handle}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {stylist.booking_url && (
              <a href={stylist.booking_url} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-paper text-ink hover:opacity-85">
                  Book appointment →
                </Button>
              </a>
            )}
            {session && (
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
              <Link href={`${routes.report}?stylist=${encodeURIComponent(stylist.name)}` as any}>
                <Button
                  size="lg"
                  variant="ghost"
                  className="border border-paper/20 text-paper/40 hover:border-paper/40 hover:text-paper"
                >
                  Report an issue
                </Button>
              </Link>
            )}
          </div>
        </Container>
      </header>

      {/* Body */}
      <Container className="py-16">
        {!session ? (
          /* ── Guest: gate overlay ── */
          <div className="mx-auto max-w-lg py-8">
            <GuestProfileGate />
          </div>
        ) : (
          /* ── Authenticated: full profile ── */
          <div className="grid gap-12 md:grid-cols-[1fr_300px]">
            <article>
              <Eyebrow className="mb-4">Services Offered</Eyebrow>
              <h2 className="mb-6 font-serif text-display-md text-ink">
                What <em className="italic text-g400">{stylist.name}</em> does
              </h2>
              {stylist.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {stylist.tags.map((t, i) => (
                    <span
                      key={t}
                      className={cn(
                        'rounded-sm border px-3 py-1.5 font-mono text-xs',
                        i < 3
                          ? 'border-ink bg-ink text-paper'
                          : 'border-g200 bg-g100 text-g600',
                      )}
                    >
                      {formatTag(t)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-g400">No services listed yet.</p>
              )}

              {stylist.bio && (
                <div className="mt-10">
                  <Eyebrow className="mb-4">About</Eyebrow>
                  <p className="max-w-prose text-sm leading-relaxed text-g600">
                    {stylist.bio}
                  </p>
                </div>
              )}
            </article>

            <aside className="flex flex-col gap-8">
              <div>
                <Eyebrow className="mb-3">Location</Eyebrow>
                <p className="text-sm text-ink">{stylist.city}, BC</p>
              </div>

              {(stylist.instagram || stylist.tiktok || stylist.facebook || stylist.website) && (
                <div>
                  <Eyebrow className="mb-3">Social &amp; links</Eyebrow>
                  <ul className="flex flex-col gap-2 text-sm">
                    {stylist.instagram && (
                      <li>
                        <a
                          href={`https://instagram.com/${stylist.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-g600 hover:text-ink"
                        >
                          Instagram →
                        </a>
                      </li>
                    )}
                    {stylist.tiktok && (
                      <li>
                        <a
                          href={`https://tiktok.com/@${stylist.tiktok}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-g600 hover:text-ink"
                        >
                          TikTok →
                        </a>
                      </li>
                    )}
                    {stylist.facebook && (
                      <li>
                        <a
                          href={
                            stylist.facebook.startsWith('http')
                              ? stylist.facebook
                              : `https://facebook.com/${stylist.facebook}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-g600 hover:text-ink"
                        >
                          Facebook →
                        </a>
                      </li>
                    )}
                    {stylist.website && (
                      <li>
                        <a
                          href={stylist.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-g600 hover:text-ink"
                        >
                          Website →
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {stylist.phone && (
                <div>
                  <Eyebrow className="mb-3">Phone</Eyebrow>
                  <a href={`tel:${stylist.phone}`} className="text-sm text-g600 hover:text-ink">
                    {stylist.phone}
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 border-t border-g200 pt-6">
                <ClaimProfileModal stylistName={stylist.name} />

                <div className="rounded-lg border border-g200 p-5">
                  <Eyebrow className="mb-1">Noticed an issue?</Eyebrow>
                  <p className="font-serif text-base text-ink">Report this listing</p>
                  <p className="mt-1 text-sm font-light text-g600">
                    Wrong info, closed business, broken links.
                  </p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Link href={`${routes.report}?stylist=${encodeURIComponent(stylist.name)}` as any}>
                    <p className="mt-2 font-mono text-[10px] text-g400 hover:text-ink">
                      Report Issue →
                    </p>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        )}
      </Container>

      {/* Related stylists — shown to all authenticated users */}
      {session && related.length > 0 && (
        <section className="border-t border-g200 px-6 py-16 sm:px-8 lg:px-12">
          <Container>
            <Eyebrow className="mb-3">You might also like</Eyebrow>
            <h2 className="mb-8 font-serif text-display-lg text-ink">
              Similar <em className="italic text-g400">stylists</em>
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {related.map(r => (
                <Link
                  key={r.id}
                  href={routes.stylist(r.slug)}
                  className="group flex flex-col gap-3 rounded-lg border border-g200 bg-paper p-5 no-underline transition-all hover:-translate-y-0.5 hover:border-g400"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink font-serif text-sm italic text-paper">
                      {r.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="rounded-sm border border-g200 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-g400">
                      {r.city}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif text-base text-ink">{r.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.tags.slice(0, 3).map(t => (
                      <span
                        key={t}
                        className="rounded-sm border border-g200 bg-g100 px-1.5 py-0.5 font-mono text-[10px] text-g600"
                      >
                        {formatTag(t)}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

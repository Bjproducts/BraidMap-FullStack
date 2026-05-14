import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { TrackView } from '@/components/TrackView';
import { getStylistBySlug } from '@/services/stylists';
import { getUserFavoriteIds } from '@/services/favorites';
import { getSession } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';
import { formatTag } from '@/utils/formatTag';

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
  const { slug }   = await params;
  const [stylist, session] = await Promise.all([
    getStylistBySlug(slug),
    getSession(),
  ]);
  if (!stylist) notFound();

  const favoriteIds = session ? await getUserFavoriteIds(session.user.id) : [];
  const isFavorited = favoriteIds.includes(stylist.id);

  return (
    <>
      {/* Track this view client-side */}
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
                <h1 className="font-serif text-display-xl text-paper">
                  {stylist.name}
                </h1>
                <FavoriteButton
                  stylistId={stylist.id}
                  initialFavorited={isFavorited}
                  className="mt-2"
                />
              </div>
              {stylist.handle && (
                <p className="mt-1 font-mono text-xs text-paper/40">
                  @{stylist.handle}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {stylist.booking_url && (
              <a
                href={stylist.booking_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-paper text-ink hover:opacity-85">
                  Book appointment →
                </Button>
              </a>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <Link href={`${routes.report}?stylist=${encodeURIComponent(stylist.name)}` as any}>
              <Button
                size="lg"
                variant="ghost"
                className="border border-paper/20 text-paper/40 hover:border-paper/40 hover:text-paper"
              >
                Report an issue
              </Button>
            </Link>
          </div>
        </Container>
      </header>

      {/* Body */}
      <Container className="grid gap-12 py-16 md:grid-cols-[1fr_300px]">
        <article>
          <Eyebrow className="mb-4">Services Offered</Eyebrow>
          <h2 className="mb-6 font-serif text-display-md text-ink">
            What <em className="italic text-g400">{stylist.name}</em> does
          </h2>
          {stylist.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {stylist.tags.map(t => (
                <span
                  key={t}
                  className="rounded-sm border border-g200 bg-g100 px-3 py-1.5 font-mono text-xs text-g600"
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
              <Eyebrow className="mb-3">Social & links</Eyebrow>
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
        </aside>
      </Container>
    </>
  );
}

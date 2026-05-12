import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { getStylistBySlug } from '@/services/stylists';
import { routes } from '@/config/routes';

interface Params { params: Promise<{ slug: string }>; }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const stylist = await getStylistBySlug(slug).catch(() => null);
  return { title: stylist?.name ?? 'Stylist' };
}

export default async function StylistPage({ params }: Params) {
  const { slug } = await params;
  const stylist = await getStylistBySlug(slug);
  if (!stylist) notFound();

  return (
    <>
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
            <div>
              <Eyebrow className="mb-2 text-paper/40">📍 {stylist.city}</Eyebrow>
              <h1 className="font-serif text-display-xl text-paper">{stylist.name}</h1>
              {stylist.handle && (
                <p className="mt-1 font-mono text-xs text-paper/40">@{stylist.handle}</p>
              )}
            </div>
          </div>

          {stylist.booking_url && (
            <a href={stylist.booking_url} target="_blank" rel="noopener noreferrer" className="mt-8 inline-block">
              <Button size="lg" className="bg-paper text-ink hover:opacity-85">
                Book appointment →
              </Button>
            </a>
          )}
        </Container>
      </header>

      <Container className="grid gap-12 py-16 md:grid-cols-[1fr_320px]">
        <article>
          <Eyebrow className="mb-4">Services Offered</Eyebrow>
          <h2 className="mb-6 font-serif text-display-md text-ink">
            What <em className="italic text-g400">{stylist.name}</em> does
          </h2>
          <div className="flex flex-wrap gap-2">
            {stylist.tags.map((t) => (
              <span
                key={t}
                className="rounded-sm border border-g200 bg-g100 px-3 py-1.5 font-mono text-xs text-g600"
              >
                {t}
              </span>
            ))}
          </div>
        </article>

        <aside className="flex flex-col gap-6">
          <div>
            <Eyebrow className="mb-3">Location</Eyebrow>
            <p className="text-sm text-ink">{stylist.city}, BC</p>
          </div>
          <div>
            <Eyebrow className="mb-3">Social</Eyebrow>
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
                    href={stylist.facebook.startsWith('http') ? stylist.facebook : `https://facebook.com/${stylist.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-g600 hover:text-ink"
                  >
                    Facebook →
                  </a>
                </li>
              )}
            </ul>
          </div>
        </aside>
      </Container>
    </>
  );
}

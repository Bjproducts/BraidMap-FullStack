import { Suspense } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { listStylists, getCitiesAndTags } from '@/services/stylists';
import { getUserFavoriteIds } from '@/services/favorites';
import { getSession } from '@/lib/auth/getSession';
import { routes } from '@/config/routes';
import { formatTag } from '@/utils/formatTag';
import { FilterSidebar } from './_components/FilterSidebar';
import { SearchInput } from './_components/SearchInput';
import { Pagination } from './_components/Pagination';

export const metadata = { title: 'Find a stylist' };

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; tag?: string; q?: string; page?: string }>;
}) {
  const sp   = await searchParams;
  const page = sp.page ? Math.max(1, Number(sp.page)) : 1;

  const [{ cities, tags }, result, session] = await Promise.all([
    getCitiesAndTags().catch(() => ({ cities: [] as string[], tags: [] as string[] })),
    listStylists({ city: sp.city, tag: sp.tag, q: sp.q, page }).catch(() => ({
      stylists: [],
      total: 0,
      page,
      pageSize: 24,
    })),
    getSession(),
  ]);

  const favoriteIds = session ? await getUserFavoriteIds(session.user.id) : [];
  const favoriteSet = new Set(favoriteIds);

  return (
    <>
      {/* Header */}
      <header className="border-b border-g200 px-6 py-16 sm:px-8 lg:px-12">
        <Container className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-3">Directory</Eyebrow>
            <h1 className="font-serif text-display-xl text-ink">
              Find your <em className="italic text-g400">stylist</em>
            </h1>
          </div>
          <div className="text-right">
            <p className="font-serif text-display-md leading-none">{result.total}</p>
            <Eyebrow className="mt-1">
              {sp.city || sp.tag || sp.q ? 'matching' : 'stylists in BC'}
            </Eyebrow>
          </div>
        </Container>
      </header>

      {/* Search */}
      <div className="border-b border-g200 px-6 py-4 sm:px-8 lg:px-12">
        <Container>
          <Suspense fallback={<div className="skeleton h-11 w-full rounded-md" />}>
            <SearchInput defaultValue={sp.q ?? ''} />
          </Suspense>
        </Container>
      </div>

      {/* Grid + sidebar */}
      <Container className="grid gap-8 py-8 pb-16 md:grid-cols-[240px_1fr]">
        <Suspense
          fallback={
            <aside className="hidden md:flex md:flex-col md:gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-8 rounded-md" />
              ))}
            </aside>
          }
        >
          <FilterSidebar cities={cities} tags={tags} />
        </Suspense>

        <section aria-label="Stylist listings">
          {result.stylists.length === 0 ? (
            <EmptyState hasFilters={!!(sp.city || sp.tag || sp.q)} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {result.stylists.map(s => (
                  <Card key={s.id} className="group">
                    <Link
                      href={routes.stylist(s.slug)}
                      className="no-underline flex-1 block"
                    >
                      <CardBody>
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink font-serif text-base italic text-paper">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="rounded-sm border border-g200 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-g400">
                            {s.city ?? 'BC'}
                          </span>
                        </div>
                        <h3 className="font-serif text-base leading-tight text-ink">
                          {s.name}
                        </h3>
                        {s.handle && (
                          <p className="font-mono text-[10px] text-g400">@{s.handle}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-1">
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
                      </CardBody>
                    </Link>

                    <CardFooter>
                      {s.booking_url ? (
                        <a
                          href={s.booking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="rounded-sm bg-ink px-3 py-1.5 font-sans text-[11px] font-semibold text-paper transition-opacity hover:opacity-75"
                        >
                          Book →
                        </a>
                      ) : (
                        <span className="font-serif text-sm italic text-g400">
                          {s.service_count} services
                        </span>
                      )}
                      <FavoriteButton
                        stylistId={s.id}
                        initialFavorited={favoriteSet.has(s.id)}
                      />
                    </CardFooter>
                  </Card>
                ))}
              </div>

              <Suspense fallback={null}>
                <Pagination page={page} total={result.total} pageSize={result.pageSize} />
              </Suspense>
            </>
          )}
        </section>
      </Container>
    </>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-g200 p-16 text-center">
      <p className="mb-3 text-4xl opacity-50" aria-hidden>
        {hasFilters ? '🔍' : '✦'}
      </p>
      <h3 className="font-serif text-2xl text-ink">
        {hasFilters ? (
          <>Still <em className="italic text-g400">hunting</em> for you</>
        ) : (
          <>No stylists <em className="italic text-g400">found</em></>
        )}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm font-light text-g600">
        {hasFilters
          ? 'No stylists match these filters yet — try adjusting or clearing them.'
          : 'The directory is still growing. Check back soon.'}
      </p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Link
        href={routes.suggest as any}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper no-underline transition-opacity hover:opacity-85"
      >
        Suggest a stylist →
      </Link>
    </div>
  );
}

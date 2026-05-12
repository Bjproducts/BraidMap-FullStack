import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { listStylists } from '@/services/stylists';
import { routes } from '@/config/routes';

export const metadata = { title: 'Find a stylist' };

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; tag?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const page = sp.page ? Math.max(1, Number(sp.page)) : 1;

  let result;
  try {
    result = await listStylists({ city: sp.city, tag: sp.tag, q: sp.q, page });
  } catch {
    result = { stylists: [], total: 0, page, pageSize: 0 };
  }

  return (
    <>
      <header className="border-b border-g200 px-6 py-16 sm:px-8 lg:px-12">
        <Container className="flex items-end justify-between gap-6">
          <div>
            <Eyebrow className="mb-3">Directory</Eyebrow>
            <h1 className="font-serif text-display-xl text-ink">
              Find your <em className="italic text-g400">stylist</em>
            </h1>
          </div>
          <div className="text-right">
            <p className="font-serif text-display-md leading-none">{result.total}</p>
            <Eyebrow className="mt-1">stylists in BC</Eyebrow>
          </div>
        </Container>
      </header>

      <Container className="grid gap-8 py-8 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[2px] text-g400">Filters</p>
          <p className="text-xs text-g400">Filter UI coming soon.</p>
        </aside>

        <section>
          {result.stylists.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {result.stylists.map((s) => (
                <Link key={s.id} href={routes.stylist(s.slug)} className="no-underline">
                  <Card>
                    <CardBody>
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-ink font-serif text-base italic text-paper">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="rounded-sm border border-g200 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-g400">
                          {s.city ?? 'BC'}
                        </span>
                      </div>
                      <h3 className="font-serif text-base leading-tight text-ink">{s.name}</h3>
                      {s.handle && <p className="font-mono text-[10px] text-g400">@{s.handle}</p>}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {s.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="rounded-sm border border-g200 bg-g100 px-1.5 py-0.5 font-mono text-[10px] text-g600"
                          >
                            {t}
                          </span>
                        ))}
                        {s.tags.length > 3 && (
                          <span className="rounded-sm border border-g200 bg-g100 px-1.5 py-0.5 font-mono text-[10px] text-g600">
                            +{s.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </CardBody>
                    <CardFooter>
                      <span className="flex items-baseline gap-1 font-serif text-sm text-g400">
                        <span className="font-serif text-2xl italic text-g200">{s.service_count}</span>
                        services
                      </span>
                      <span className="rounded-sm bg-ink px-3 py-1.5 font-sans text-[11px] font-semibold text-paper">
                        View →
                      </span>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </Container>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-g200 p-16 text-center">
      <p className="mb-3 text-4xl opacity-50" aria-hidden>
        🔍
      </p>
      <h3 className="font-serif text-2xl text-ink">
        Still <em className="italic text-g400">hunting</em> for you
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm font-light text-g600">
        No stylists match these filters yet — but the directory grows weekly.
      </p>
      <Link
        href={routes.suggest}
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper no-underline transition-opacity hover:opacity-85"
      >
        Suggest a stylist →
      </Link>
    </div>
  );
}

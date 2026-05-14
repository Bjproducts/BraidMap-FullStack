import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Card, CardBody, CardFooter } from '@/components/ui/Card';
import { getSession } from '@/lib/auth/getSession';
import { getUserFavorites } from '@/services/favorites';
import { getStylistsByIds } from '@/services/stylists';
import { routes } from '@/config/routes';
import { RECENTS_COOKIE, parseRecents } from '@/utils/recents';
import { formatTag } from '@/utils/formatTag';
import { EditProfileForm } from './_components/EditProfileForm';

export const metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect(routes.login);

  const firstName =
    session.profile?.full_name?.split(' ')[0] ??
    session.user.email?.split('@')[0] ??
    'there';
  const fullName = session.profile?.full_name ?? '';

  // Read recently viewed from cookie
  const cookieStore = await cookies();
  const recentsCookie = cookieStore.get(RECENTS_COOKIE)?.value;
  const recentIds = parseRecents(recentsCookie ? decodeURIComponent(recentsCookie) : undefined);

  // Fetch in parallel
  const [recentStylists, savedStylists] = await Promise.all([
    getStylistsByIds(recentIds),
    getUserFavorites(session.user.id),
  ]);

  return (
    <>
      {/* Hero */}
      <header className="border-b border-g200 bg-ink px-6 py-16 sm:px-8 lg:px-12">
        <Container className="flex items-center gap-6">
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-paper/10 font-serif text-3xl italic text-paper">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <Eyebrow className="mb-1 text-paper/40">Member dashboard</Eyebrow>
            <h1 className="font-serif text-display-xl text-paper">
              Hello, <em className="italic text-paper/40">{firstName}</em>
            </h1>
          </div>
        </Container>
      </header>

      <Container className="flex flex-col gap-12 py-12">

        {/* Account info */}
        <section>
          <Eyebrow className="mb-4">Account</Eyebrow>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardBody>
                <Eyebrow className="mb-2">Role</Eyebrow>
                <p className="font-serif text-xl capitalize">
                  {session.profile?.role ?? 'member'}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Eyebrow className="mb-2">Email</Eyebrow>
                <p className="break-all text-sm">{session.user.email}</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <Eyebrow className="mb-2">Member since</Eyebrow>
                <p className="text-sm">
                  {session.profile?.created_at
                    ? new Date(session.profile.created_at).toLocaleDateString('en-CA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '—'}
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Edit profile */}
        <section>
          <Eyebrow className="mb-4">Edit profile</Eyebrow>
          <div className="max-w-md">
            <EditProfileForm currentName={fullName} />
          </div>
        </section>

        {/* Saved stylists */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <Eyebrow>Saved stylists</Eyebrow>
            {savedStylists.length > 0 && (
              <Link
                href={routes.directory}
                className="font-mono text-[10px] uppercase tracking-wider text-g400 hover:text-ink"
              >
                Browse more →
              </Link>
            )}
          </div>

          {savedStylists.length === 0 ? (
            <div className="rounded-lg border border-dashed border-g200 p-10 text-center">
              <p className="mb-2 font-serif text-lg text-g400">
                No saved stylists yet
              </p>
              <p className="mb-5 text-sm font-light text-g400">
                Heart a stylist in the directory to save them here.
              </p>
              <Link href={routes.directory}>
                <span className="rounded-md bg-ink px-4 py-2.5 font-sans text-sm font-semibold text-paper transition-opacity hover:opacity-85">
                  Browse the directory
                </span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savedStylists.map(s => (
                <Card key={s.id}>
                  <Link href={routes.stylist(s.slug)} className="no-underline flex-1 block">
                    <CardBody>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-ink font-serif text-base italic text-paper">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-serif text-base leading-tight text-ink">
                        {s.name}
                      </h3>
                      <p className="mt-0.5 font-mono text-[10px] text-g400">{s.city}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {s.tags.slice(0, 2).map(t => (
                          <span
                            key={t}
                            className="rounded-sm border border-g200 bg-g100 px-1.5 py-0.5 font-mono text-[10px] text-g600"
                          >
                            {formatTag(t)}
                          </span>
                        ))}
                      </div>
                    </CardBody>
                  </Link>
                  <CardFooter>
                    <span className="font-serif text-xs italic text-g400">
                      {s.service_count} services
                    </span>
                    {s.booking_url && (
                      <a
                        href={s.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-sm bg-ink px-2.5 py-1 font-sans text-[10px] font-semibold text-paper hover:opacity-75"
                      >
                        Book →
                      </a>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Recently viewed */}
        <section>
          <Eyebrow className="mb-4">Recently viewed</Eyebrow>

          {recentStylists.length === 0 ? (
            <div className="rounded-lg border border-dashed border-g200 p-10 text-center">
              <p className="mb-2 font-serif text-lg text-g400">Nothing yet</p>
              <p className="text-sm font-light text-g400">
                Stylists you visit will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recentStylists.map(s => (
                <Card key={s.id}>
                  <Link href={routes.stylist(s.slug)} className="no-underline flex-1 block">
                    <CardBody>
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-ink font-serif text-base italic text-paper">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 className="font-serif text-base leading-tight text-ink">
                        {s.name}
                      </h3>
                      <p className="mt-0.5 font-mono text-[10px] text-g400">{s.city}</p>
                    </CardBody>
                  </Link>
                  <CardFooter>
                    <span className="font-serif text-xs italic text-g400">
                      {s.service_count} services
                    </span>
                    <Link
                      href={routes.stylist(s.slug)}
                      className="rounded-sm border border-g200 px-2.5 py-1 font-mono text-[10px] text-g600 hover:border-ink hover:text-ink"
                    >
                      View →
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>

      </Container>
    </>
  );
}

import Link from 'next/link';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { routes } from '@/config/routes';
import { getSession } from '@/lib/auth/getSession';
import { logout } from '@/lib/auth/actions';
import { Button } from '@/components/ui/Button';

/**
 * Server component — reads session server-side so the nav arrives
 * already-personalised (no auth flicker).
 */
export async function Nav() {
  const session = await getSession();
  const user = session?.user ?? null;
  const initial = (session?.profile?.full_name ?? user?.email ?? 'M').charAt(0).toUpperCase();
  const firstName =
    session?.profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'My profile';

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-g200 bg-paper/95 px-6 py-5 backdrop-blur-md sm:px-8 lg:px-12">
      <Logo />

      <ul className="hidden items-center gap-7 md:flex">
        <li>
          <Link href={routes.directory} className="text-sm text-g600 hover:text-ink">
            Find a stylist
          </Link>
        </li>
        {user && (
          <>
            <li>
              <Link href={routes.report} className="text-sm text-g600 hover:text-ink">
                Report
              </Link>
            </li>
            <li>
              <Link href={routes.suggest} className="text-sm text-g600 hover:text-ink">
                Suggest
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* Desktop auth controls */}
      <div className="hidden items-center gap-2 md:flex">
        {user ? (
          <>
            <Link
              href={routes.dashboard}
              aria-label="My profile"
              className="flex items-center gap-2 no-underline"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-serif text-sm italic text-paper">
                {initial}
              </div>
              <span className="hidden font-medium text-g600 sm:inline">{firstName}</span>
            </Link>
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </>
        ) : (
          <>
            <Link href={routes.login}>
              <Button variant="secondary" size="sm">
                Log in
              </Button>
            </Link>
            <Link href={routes.signup}>
              <Button variant="primary" size="sm">
                Join free
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile nav (hamburger + drawer) — client component */}
      <MobileNav user={user} initial={initial} firstName={firstName} />
    </nav>
  );
}

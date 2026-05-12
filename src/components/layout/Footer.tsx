import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { routes } from '@/config/routes';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t border-g200 px-6 py-16 sm:px-8 lg:px-12">
      <Container className="px-0">
        <div className="grid gap-12 border-b border-g200 pb-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="font-serif text-xl">BraidMap</p>
            <p className="mt-2 max-w-[200px] text-xs font-light leading-relaxed text-g400">
              {siteConfig.tagline}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[2px] text-g400">
                Discover
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link href={routes.directory} className="text-sm text-g600 hover:text-ink">
                    Find a stylist
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[2px] text-g400">
                Contribute
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link href={routes.suggest} className="text-sm text-g600 hover:text-ink">
                    Suggest a stylist
                  </Link>
                </li>
                <li>
                  <Link href={routes.report} className="text-sm text-g600 hover:text-ink">
                    Report an issue
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-mono text-[10px] uppercase tracking-[2px] text-g400">
                Account
              </h4>
              <ul className="flex flex-col gap-2.5">
                <li>
                  <Link href={routes.login} className="text-sm text-g600 hover:text-ink">
                    Log in
                  </Link>
                </li>
                <li>
                  <Link href={routes.signup} className="text-sm text-g600 hover:text-ink">
                    Join free
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 font-mono text-[10px] tracking-wide text-g400 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} BraidMap.</span>
          <span>Made with care in British Columbia.</span>
        </div>
      </Container>
    </footer>
  );
}

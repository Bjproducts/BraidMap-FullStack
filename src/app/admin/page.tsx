import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { getSession } from '@/lib/auth/getSession';
import { getPendingReports, getPendingSuggestions, getAllStylists } from '@/services/admin';
import { routes } from '@/config/routes';
import {
  ReportsSection,
  SuggestionsSection,
  StylistVisibilitySection,
} from './_components/ReportsSection';

export const metadata = { title: 'Admin console' };

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect(routes.login);
  if (session.profile?.role !== 'admin') redirect(routes.dashboard);

  const [reports, suggestions, stylists] = await Promise.all([
    getPendingReports().catch(() => []),
    getPendingSuggestions().catch(() => []),
    getAllStylists().catch(() => []),
  ]);

  return (
    <>
      {/* Header */}
      <header className="border-b border-g200 px-6 py-16 sm:px-8 lg:px-12">
        <Container>
          <Eyebrow className="mb-3">Admin</Eyebrow>
          <h1 className="font-serif text-display-xl text-ink">
            Admin <em className="italic text-g400">console</em>
          </h1>
          <div className="mt-6 flex flex-wrap gap-6">
            <Stat label="Open reports"      value={reports.length} />
            <Stat label="Pending suggestions" value={suggestions.length} />
            <Stat label="Total stylists"    value={stylists.length} />
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-12 pb-20">

        {/* ── Reports ────────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Open reports"
            count={reports.length}
            description="User-submitted reports awaiting review."
          />
          <ReportsSection reports={reports} />
        </section>

        {/* ── Suggestions ────────────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Pending suggestions"
            count={suggestions.length}
            description="New stylist suggestions awaiting approval."
          />
          <SuggestionsSection suggestions={suggestions} />
        </section>

        {/* ── Stylist visibility ──────────────────────────────────── */}
        <section>
          <SectionHeader
            title="Stylist directory"
            count={stylists.length}
            description="Toggle visibility for individual profiles."
          />
          <StylistVisibilitySection stylists={stylists} />
        </section>

      </Container>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-serif text-display-md leading-none text-ink">{value}</p>
      <Eyebrow className="mt-1">{label}</Eyebrow>
    </div>
  );
}

function SectionHeader({
  title,
  count,
  description,
}: {
  title: string;
  count: number;
  description: string;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2 border-b border-g200 pb-4">
      <div>
        <h2 className="font-serif text-display-md text-ink">
          {title}{' '}
          <span className="font-mono text-base font-normal text-g400">({count})</span>
        </h2>
        <p className="mt-1 text-xs text-g400">{description}</p>
      </div>
    </div>
  );
}

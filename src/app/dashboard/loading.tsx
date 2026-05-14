import { Container } from '@/components/ui/Container';

export default function DashboardLoading() {
  return (
    <>
      {/* Hero */}
      <header className="border-b border-g200 bg-ink px-6 py-16 sm:px-8 lg:px-12">
        <Container className="flex items-center gap-6">
          <div className="skeleton h-20 w-20 flex-shrink-0 rounded-full opacity-20" />
          <div>
            <div className="skeleton mb-2 h-3 w-28 rounded opacity-20" />
            <div className="skeleton h-10 w-56 rounded opacity-20" />
          </div>
        </Container>
      </header>

      <Container className="flex flex-col gap-12 py-12">
        {/* Account cards */}
        <section>
          <div className="skeleton mb-4 h-3 w-16 rounded" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-g200 p-5">
                <div className="skeleton mb-3 h-3 w-16 rounded" />
                <div className="skeleton h-6 w-24 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Edit profile */}
        <section>
          <div className="skeleton mb-4 h-3 w-20 rounded" />
          <div className="skeleton h-11 max-w-md rounded-md" />
        </section>

        {/* Saved stylists */}
        <section>
          <div className="skeleton mb-4 h-3 w-28 rounded" />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-g200 p-5">
                <div className="skeleton mb-3 h-10 w-10 rounded-md" />
                <div className="skeleton mb-1.5 h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </section>

        {/* Recently viewed */}
        <section>
          <div className="skeleton mb-4 h-3 w-32 rounded" />
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-g200 p-5">
                <div className="skeleton mb-3 h-10 w-10 rounded-md" />
                <div className="skeleton mb-1.5 h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </section>
      </Container>
    </>
  );
}

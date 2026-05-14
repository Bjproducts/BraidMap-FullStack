import { Container } from '@/components/ui/Container';

export default function StylistLoading() {
  return (
    <>
      <header className="border-b border-g200 bg-ink px-6 py-16 sm:px-8 lg:px-12">
        <Container>
          <div className="skeleton mb-8 h-3 w-32 rounded opacity-20" />
          <div className="flex items-start gap-6">
            <div className="skeleton h-20 w-20 flex-shrink-0 rounded-md opacity-20" />
            <div className="flex-1">
              <div className="skeleton mb-2 h-3 w-24 rounded opacity-20" />
              <div className="skeleton h-12 w-72 rounded opacity-20" />
              <div className="skeleton mt-2 h-3 w-28 rounded opacity-20" />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <div className="skeleton h-12 w-44 rounded-md opacity-20" />
            <div className="skeleton h-12 w-36 rounded-md opacity-10" />
          </div>
        </Container>
      </header>
      <Container className="grid gap-12 py-16 md:grid-cols-[1fr_300px]">
        <div>
          <div className="skeleton mb-4 h-3 w-28 rounded" />
          <div className="skeleton mb-6 h-8 w-64 rounded" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-7 w-24 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="skeleton h-16 w-full rounded-lg" />
          <div className="skeleton h-24 w-full rounded-lg" />
        </div>
      </Container>
    </>
  );
}

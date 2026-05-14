import { Container } from '@/components/ui/Container';
import { SkeletonGrid } from '@/components/ui/SkeletonCard';

export default function DirectoryLoading() {
  return (
    <>
      <header className="border-b border-g200 px-6 py-16 sm:px-8 lg:px-12">
        <Container className="flex items-end justify-between gap-6">
          <div>
            <div className="skeleton mb-3 h-3 w-20 rounded" />
            <div className="skeleton h-12 w-72 rounded" />
          </div>
          <div className="skeleton h-10 w-16 rounded" />
        </Container>
      </header>
      <div className="border-b border-g200 px-6 py-4 sm:px-8 lg:px-12">
        <Container>
          <div className="skeleton h-11 w-full rounded-md" />
        </Container>
      </div>
      <Container className="grid gap-8 py-8 md:grid-cols-[240px_1fr]">
        <aside className="hidden md:flex md:flex-col md:gap-2">
          <div className="skeleton mb-3 h-3 w-16 rounded" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-8 rounded-md" />
          ))}
        </aside>
        <SkeletonGrid count={12} />
      </Container>
    </>
  );
}

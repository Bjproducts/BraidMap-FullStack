import { Container } from '@/components/ui/Container';

export default function AdminLoading() {
  return (
    <>
      <header className="border-b border-g200 px-6 py-16 sm:px-8 lg:px-12">
        <Container>
          <div className="skeleton mb-3 h-4 w-14 rounded" />
          <div className="skeleton h-10 w-64 rounded" />
          <div className="mt-6 flex gap-6">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <div className="skeleton h-8 w-8 rounded" />
                <div className="skeleton mt-2 h-3 w-24 rounded" />
              </div>
            ))}
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-12 pb-20">
        {[1, 2].map(s => (
          <section key={s}>
            <div className="mb-5 border-b border-g200 pb-4">
              <div className="skeleton h-7 w-48 rounded" />
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-24 rounded-lg" />
              ))}
            </div>
          </section>
        ))}
      </Container>
    </>
  );
}

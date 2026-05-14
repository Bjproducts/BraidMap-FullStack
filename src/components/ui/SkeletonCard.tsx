export function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-g200 bg-paper">
      <div className="flex-1 p-5 pb-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="skeleton h-10 w-10 rounded-md" />
          <div className="skeleton h-4 w-16 rounded-sm" />
        </div>
        <div className="skeleton mb-1.5 h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="mt-3 flex flex-wrap gap-1">
          <div className="skeleton h-5 w-16 rounded-sm" />
          <div className="skeleton h-5 w-20 rounded-sm" />
          <div className="skeleton h-5 w-14 rounded-sm" />
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-g200 bg-g100 px-5 py-3">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="skeleton h-6 w-14 rounded-sm" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

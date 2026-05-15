'use client';

interface BookingLinkProps {
  href: string;
}

export function BookingLink({ href }: BookingLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      className="rounded-sm bg-ink px-3 py-1.5 font-sans text-[11px] font-semibold text-paper transition-opacity hover:opacity-75"
    >
      Book →
    </a>
  );
}

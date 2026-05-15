import { Eyebrow } from '@/components/ui/Eyebrow';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      {/* Left branding panel — desktop only */}
      <div className="relative hidden overflow-hidden bg-ink lg:flex lg:w-5/12 lg:flex-col lg:justify-center lg:px-14 lg:py-20 xl:w-2/5">
        {/* Grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative">
          <Eyebrow className="mb-4 text-paper/30">
            BC&apos;s BIPOC Hair Directory
          </Eyebrow>
          <h2 className="mb-4 font-serif text-display-lg text-paper">
            Your next great hair{' '}
            <em className="italic text-paper/40">stylist awaits</em>
          </h2>
          <p className="mb-10 text-sm font-light leading-relaxed text-paper/40">
            Join BraidMap to unlock 121 BIPOC hairstylists across British
            Columbia — free forever.
          </p>
          {/* Mini stats */}
          <div className="flex gap-8 border-t border-paper/10 pt-8">
            {[
              { num: '121', label: 'Stylists' },
              { num: '16',  label: 'Cities in BC' },
              { num: '22',  label: 'Style tags' },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="font-serif text-2xl text-paper">{num}</p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-paper/30">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 xl:px-20">
        {children}
      </div>
    </div>
  );
}

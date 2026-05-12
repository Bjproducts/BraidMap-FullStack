import type { Config } from 'tailwindcss';

/**
 * BraidMap design tokens.
 * Migrated from the static MVP's `--g100`–`--g800`, `--sp-*`, `--radius-*`
 * variables so the brand language survives the platform rebuild.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutrals from the MVP --g* scale
        ink:    '#0A0A0A',
        paper:  '#FAFAFA',
        g100:   '#F2F2F2',
        g200:   '#E0E0E0',
        g400:   '#A0A0A0',
        g600:   '#555555',
        g800:   '#222222',

        // Semantic tokens (resolved against the neutrals above)
        background: '#FAFAFA',
        foreground: '#0A0A0A',
        muted:      '#555555',
        border:     '#E0E0E0',
        accent:     '#0A0A0A',
        success:    '#1D6F4A',
        danger:     '#B53030',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Instrument Serif', 'ui-serif', 'serif'],
        mono:  ['var(--font-mono)',  'DM Mono',          'ui-monospace', 'monospace'],
        sans:  ['var(--font-sans)',  'Manrope',          'ui-sans-serif','system-ui','sans-serif'],
      },
      fontSize: {
        // Display sizes used for hero/section titles in the MVP
        'display-xl': ['56px', { lineHeight: '1.05', letterSpacing: '-2px' }],
        'display-lg': ['44px', { lineHeight: '1.1',  letterSpacing: '-1.5px' }],
        'display-md': ['32px', { lineHeight: '1.15', letterSpacing: '-1px' }],
      },
      letterSpacing: {
        tightest: '-2px',
        tighter:  '-1.5px',
        tight2:   '-1px',
      },
      spacing: {
        xs:  '4px',
        sm:  '8px',
        md:  '16px',
        lg:  '32px',
        xl:  '48px',
        '2xl': '64px',
        '3xl': '80px',
      },
      borderRadius: {
        sm: '4px',
        md: '7px',
        lg: '10px',
        xl: '16px',
      },
      transitionTimingFunction: {
        'in-out-soft': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        fadeUp:  'fadeUp 0.4s ease-out',
        spin:    'spin 0.6s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;

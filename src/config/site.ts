/**
 * Single source of truth for site-wide metadata.
 */
export const siteConfig = {
  name: 'BraidMap',
  tagline: "BC's BIPOC hairstylist directory",
  description:
    "Find BIPOC hairstylists across British Columbia — filter by city, style, and book directly.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ogImage: '/og.png',

  links: {
    twitter: '',
    instagram: '',
    github: 'https://github.com/Bjproducts/BraidMap',
  },

  /** Static MVP from which this platform was migrated. */
  legacy: {
    url: 'https://thebraidmap.com',
    repo: 'https://github.com/Bjproducts/BraidMap',
  },
} as const;

export type SiteConfig = typeof siteConfig;

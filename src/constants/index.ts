/**
 * Domain constants. Pure values — no env reads, no side effects.
 */

export const USER_ROLES = ['visitor', 'member', 'stylist', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const REPORT_TYPES = [
  'business_closed',
  'wrong_phone',
  'wrong_social',
  'wrong_location',
  'booking_broken',
  'wrong_services',
  'duplicate',
  'other',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_TYPE_ICONS: Record<ReportType, string> = {
  business_closed: '🚫',
  wrong_phone:     '📞',
  wrong_social:    '📱',
  wrong_location:  '📍',
  booking_broken:  '🔗',
  wrong_services:  '✂️',
  duplicate:       '📋',
  other:           '💬',
};

// ── BC cities ────────────────────────────────────────────────────────────────

export const BC_CITIES = [
  'Abbotsford', 'Burnaby', 'Chilliwack', 'Coquitlam', 'Delta',
  'Kamloops', 'Kelowna', 'Langley', 'Maple Ridge', 'Mission',
  'Nanaimo', 'New Westminster', 'North Vancouver', 'Prince George',
  'Richmond', 'Surrey', 'Vancouver', 'Victoria',
] as const;

// ── Service categories (match DB tag slugs) ───────────────────────────────────

export const SERVICE_CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'knotless_braids',  label: 'Knotless Braids' },
  { slug: 'box_braids',       label: 'Box Braids' },
  { slug: 'cornrows',         label: 'Cornrows' },
  { slug: 'twists',           label: 'Twists' },
  { slug: 'locs_install',     label: 'Locs Installation' },
  { slug: 'loc_retwist',      label: 'Loc Retwist / Maintenance' },
  { slug: 'braids_on_locs',   label: 'Braids on Dreadlocks' },
  { slug: 'extensions',       label: 'Hair Extensions / Sew-In' },
  { slug: 'wig_install',      label: 'Wig Installs' },
  { slug: 'custom_wigs',      label: 'Custom Wigs' },
  { slug: 'wig_maintenance',  label: 'Wig Maintenance' },
  { slug: 'wig_revamp',       label: 'Wig Revamp' },
  { slug: 'crochet_faux',     label: 'Crochet / Faux Locs' },
  { slug: 'mens_braids',      label: "Men's Braids" },
  { slug: 'kids_braids',      label: "Kids' Braids" },
  { slug: 'takedown',         label: 'Braid Takedown' },
  { slug: 'wash_blowdry',     label: 'Wash & Blow Dry' },
  { slug: 'relaxer',          label: 'Relaxer' },
  { slug: 'colour',           label: 'Colouring / Hair Colour' },
  { slug: 'ponytails',        label: 'Ponytails' },
  { slug: 'bridal',           label: 'Bridal Hair' },
  { slug: 'silk_press',       label: 'Silk Press' },
  { slug: 'natural',          label: 'Natural Hair Care' },
];

export const REPORT_STATUSES = ['open', 'in_review', 'resolved', 'rejected'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const SUGGESTION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export const ADMIN_ACTION_TYPES = [
  'stylist_approved',
  'stylist_rejected',
  'stylist_edited',
  'stylist_unpublished',
  'report_resolved',
  'report_rejected',
  'user_role_changed',
] as const;
export type AdminActionType = (typeof ADMIN_ACTION_TYPES)[number];

/** Pagination defaults */
export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

// ── Report type display labels ────────────────────────────────────────────────

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  business_closed: 'Business is closed / no longer operating',
  wrong_phone:     'Wrong phone number',
  wrong_social:    'Wrong social media link',
  wrong_location:  'Wrong location or city',
  booking_broken:  'Booking link is broken',
  wrong_services:  'Wrong or outdated services listed',
  duplicate:       'Duplicate listing',
  other:           'Other',
};

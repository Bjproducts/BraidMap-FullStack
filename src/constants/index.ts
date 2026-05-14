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

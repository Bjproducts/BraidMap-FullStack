/**
 * types.ts — Source and target types for the BraidMap seed script.
 *
 * SourceStylist  = shape of one record in braidmap_data.json
 * StylistInsert  = shape expected by public.stylists INSERT
 */

// ── Source (braidmap_data.json) ───────────────────────────────────────────────

export interface SourceStylist {
  /** BraidMap legacy ID, e.g. "BM-0114". Used to generate a deterministic UUID. */
  id: string;
  name: string;
  /** Instagram handle only (no "@"), may be empty string. */
  ig: string;
  /** Full instagram URL — not mapped to DB, derived from `ig`. */
  ig_url: string;
  /** Full TikTok URL — not mapped to DB, derived from `tiktok_u`. */
  tiktok: string;
  /** TikTok handle only (no "@"), may be empty string. */
  tiktok_u: string;
  /** Full Facebook URL, may be empty string. */
  facebook: string;
  /** Google Maps URL — not in schema, ignored. */
  maps_url: string;
  /** Phone number string, may be empty. */
  phone: string;
  /** Booking / website URL. */
  booking: string;
  /** Whether the stylist requires a deposit. */
  deposit: boolean;
  city: string;
  /** PascalCase service tag slugs, e.g. ["BraidsGeneral", "KidsBraids"]. */
  tags: string[];
  /** Number of distinct services. */
  count: number;
}

export interface SourceData {
  stylists: SourceStylist[];
}

// ── Target (public.stylists INSERT) ──────────────────────────────────────────

/**
 * Matches `Database['public']['Tables']['stylists']['Insert']`
 * but spelled out explicitly so the seed script has no dependency on
 * the Next.js app's type tree.
 */
export interface StylistInsert {
  id: string;               // deterministic UUID derived from BM-XXXX
  slug: string;             // url-safe, unique
  owner_id: null;
  name: string;
  city: string;
  handle: string | null;    // primary display handle (@user)
  bio: null;
  tags: string[];           // snake_case: "braids_general", "kids_braids" …
  booking_url: string | null;
  phone: string | null;
  instagram: string | null; // handle only, no "@"
  tiktok: string | null;    // handle only, no "@"
  facebook: string | null;  // full URL
  website: null;
  published: true;
  deposit_required: boolean;
  service_count: number;
}

// ── Reporting ────────────────────────────────────────────────────────────────

export interface ValidationError {
  index: number;
  bmId: string;
  field: string;
  message: string;
}

export interface TransformResult {
  record: StylistInsert;
  bmId: string;
  warnings: string[];
}

export interface SeedSummary {
  total: number;
  inserted: number;
  skipped: number;
  failedBatches: number;
  warnings: number;
  elapsedMs: number;
}

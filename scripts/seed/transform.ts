/**
 * transform.ts — Pure transformation and validation utilities.
 *
 * No Supabase dependency. No side effects. Fully testable in isolation.
 */

import { createHash } from 'node:crypto';
import type {
  SourceStylist,
  StylistInsert,
  TransformResult,
  ValidationError,
} from './types';

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Fixed namespace string used as input to the UUID derivation.
 * Change this to invalidate all previously generated UUIDs (migration reset).
 */
const SEED_NAMESPACE = 'braidmap-seed-v1';

// ── UUID ──────────────────────────────────────────────────────────────────────

/**
 * Derives a stable, deterministic UUID v4-shaped identifier from a BM-XXXX id.
 *
 * Uses SHA-256 internally so the same BM-id always produces the same UUID across
 * runs, machines, and Node versions. Formatted as a valid UUID v4 (version bits
 * and variant bits set correctly).
 *
 * @example deterministicUuid("BM-0114") → "3f2a1b4c-..."
 */
export function deterministicUuid(bmId: string): string {
  const hash = createHash('sha256')
    .update(`${SEED_NAMESPACE}:${bmId}`)
    .digest('hex');

  // UUID v4 layout: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx  (32 hex digits total)
  const h = hash; // 64 hex chars; we use the first 32

  const part1 = h.slice(0, 8);
  const part2 = h.slice(8, 12);
  const part3 = '4' + h.slice(13, 16);                                          // version = 4
  const yNibble = ((parseInt(h[16]!, 16) & 0x3) | 0x8).toString(16);           // variant = 10xx
  const part4 = yNibble + h.slice(17, 20);
  const part5 = h.slice(20, 32);

  return [part1, part2, part3, part4, part5].join('-');
}

// ── Slug ──────────────────────────────────────────────────────────────────────

/**
 * Converts a business name to a URL-safe slug.
 *
 * Rules:
 * - Lower-case everything
 * - Remove apostrophes / backticks (keep the letters either side together)
 * - Expand "&" → "and"
 * - Replace any sequence of non-alphanumeric chars with a single hyphen
 * - Strip leading and trailing hyphens
 * - Cap at 80 characters
 *
 * @example toSlug("DES Curl Spa")      → "des-curl-spa"
 * @example toSlug("Brenda's Braids")   → "brendas-braids"
 * @example toSlug("Hair & Beauty Co.") → "hair-and-beauty-co"
 */
export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[''`]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/**
 * Resolves a unique slug for a record, avoiding collisions with:
 *   (a) slugs already in the database  (dbSlugs)
 *   (b) slugs already assigned to earlier records in this batch  (localSlugs)
 *
 * Resolution order:
 *   1. toSlug(name)
 *   2. toSlug(name + "-" + city)      (city disambiguation)
 *   3. toSlug(name + "-" + city) + "-2", "-3", …
 *
 * Mutates `localSlugs` to register the chosen slug, preventing a second record
 * from the same batch from receiving the same value.
 */
export function resolveSlug(
  name: string,
  city: string,
  localSlugs: Set<string>,
  dbSlugs: Set<string>,
): string {
  const taken = (s: string) => localSlugs.has(s) || dbSlugs.has(s);

  const base = toSlug(name);
  if (!taken(base)) {
    localSlugs.add(base);
    return base;
  }

  const withCity = toSlug(`${name}-${city}`);
  if (!taken(withCity)) {
    localSlugs.add(withCity);
    return withCity;
  }

  let n = 2;
  while (taken(`${withCity}-${n}`)) n++;
  const fallback = `${withCity}-${n}`;
  localSlugs.add(fallback);
  return fallback;
}

// ── Tags ──────────────────────────────────────────────────────────────────────

/**
 * Converts a PascalCase source tag to snake_case for consistent DB storage.
 *
 * The app's `formatTag()` utility then converts snake_case → "Title Case" for display.
 *
 * @example toSnakeCase("BraidsGeneral")   → "braids_general"
 * @example toSnakeCase("NaturalHairCare") → "natural_hair_care"
 * @example toSnakeCase("LocsRetwist")     → "locs_retwist"
 * @example toSnakeCase("WashBlowDry")     → "wash_blow_dry"
 */
export function toSnakeCase(s: string): string {
  return s.replace(/[A-Z]/g, (char, index: number) =>
    index === 0 ? char.toLowerCase() : '_' + char.toLowerCase(),
  );
}

// ── Nullable ─────────────────────────────────────────────────────────────────

/**
 * Returns null for empty / whitespace-only strings, otherwise trims and returns.
 * Mirrors the source data pattern of using "" to represent absent optional fields.
 */
export function nullIfEmpty(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Validates one raw record against the required-field contract.
 * Returns an array of errors (empty = valid).
 */
export function validateRecord(raw: unknown, index: number): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof raw !== 'object' || raw === null) {
    return [{ index, bmId: '(unknown)', field: 'root', message: 'Record is not an object' }];
  }

  const r = raw as Record<string, unknown>;
  const bmId = typeof r['id'] === 'string' ? r['id'] : '(unknown)';

  if (!bmId || bmId === '(unknown)') {
    errors.push({ index, bmId, field: 'id', message: 'Missing or non-string id' });
  }

  if (typeof r['name'] !== 'string' || !r['name'].trim()) {
    errors.push({ index, bmId, field: 'name', message: 'Missing or empty name' });
  }

  if (typeof r['city'] !== 'string' || !r['city'].trim()) {
    errors.push({ index, bmId, field: 'city', message: 'Missing or empty city' });
  }

  if (!Array.isArray(r['tags'])) {
    errors.push({ index, bmId, field: 'tags', message: 'tags must be an array' });
  } else if ((r['tags'] as unknown[]).some(t => typeof t !== 'string')) {
    errors.push({ index, bmId, field: 'tags', message: 'All tags must be strings' });
  }

  if (typeof r['deposit'] !== 'boolean') {
    errors.push({ index, bmId, field: 'deposit', message: 'deposit must be a boolean' });
  }

  if (typeof r['count'] !== 'number' || !Number.isInteger(r['count']) || (r['count'] as number) < 0) {
    errors.push({ index, bmId, field: 'count', message: 'count must be a non-negative integer' });
  }

  // booking is required by the app UX but tolerated as empty in source
  // (all 121 source records have it; validation is informational)
  if (typeof r['booking'] !== 'string') {
    errors.push({ index, bmId, field: 'booking', message: 'booking must be a string' });
  }

  return errors;
}

// ── Transform ─────────────────────────────────────────────────────────────────

/**
 * Maps one validated SourceStylist record to a StylistInsert row.
 *
 * Field mapping:
 *   id          → deterministicUuid(id)           stable UUID from BM-XXXX
 *   slug        → resolveSlug(name, city)          collision-safe URL slug
 *   handle      → ig || tiktok_u || null           primary display handle
 *   instagram   → ig || null                       ig handle only (no @)
 *   tiktok      → tiktok_u || null                 tiktok handle only (no @)
 *   facebook    → facebook || null                 full URL as provided
 *   booking_url → booking || null
 *   phone       → phone || null
 *   tags        → tags.map(toSnakeCase)            PascalCase → snake_case
 *   service_count → count
 *   deposit_required → deposit
 *   published   → true                             all seed data is published
 *   bio/website/owner_id → null                    not in source data
 *
 * Note: ig_url, tiktok (full URL), maps_url are intentionally dropped — they
 * are either derivable from handles or have no column in the schema.
 */
export function transformRecord(
  raw: SourceStylist,
  localSlugs: Set<string>,
  dbSlugs: Set<string>,
): TransformResult {
  const warnings: string[] = [];

  const slug = resolveSlug(raw.name, raw.city, localSlugs, dbSlugs);

  if (slug !== toSlug(raw.name)) {
    warnings.push(`Slug collision resolved: "${toSlug(raw.name)}" → "${slug}"`);
  }

  const instagram = nullIfEmpty(raw.ig);
  const tiktokHandle = nullIfEmpty(raw.tiktok_u);

  // Primary display handle: prefer Instagram, fall back to TikTok
  const handle = instagram ?? tiktokHandle;

  const record: StylistInsert = {
    id:               deterministicUuid(raw.id),
    slug,
    owner_id:         null,
    name:             raw.name.trim(),
    city:             raw.city.trim(),
    handle,
    bio:              null,
    tags:             raw.tags.map(toSnakeCase),
    booking_url:      nullIfEmpty(raw.booking),
    phone:            nullIfEmpty(raw.phone),
    instagram,
    tiktok:           tiktokHandle,
    facebook:         nullIfEmpty(raw.facebook),
    website:          null,
    published:        true,
    deposit_required: raw.deposit,
    service_count:    raw.count,
  };

  return { record, bmId: raw.id, warnings };
}

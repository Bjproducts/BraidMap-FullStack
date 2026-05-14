# BraidMap — Stylist Seed Script

Imports the original BraidMap stylist dataset (`braidmap_data.json`) into the
Supabase `public.stylists` table.

---

## Quick start

```bash
# 1. Install dependencies (only needed once)
npm install

# 2. Place the source data file
cp /path/to/braidmap_data.json scripts/seed/data/braidmap_data.json

# 3. Dry-run first — validates everything without touching the database
npm run db:seed:dry

# 4. Run for real
npm run db:seed
```

---

## Prerequisites

| Requirement | Details |
|-------------|---------|
| Node.js ≥ 20 | Required for ESM support |
| `.env.local` | Must contain `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` |
| Supabase migration applied | `supabase/migrations/0001_init.sql` must have been run first |

### Required env vars

```bash
# Already in .env.local — no changes needed
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...          # service role key, NOT the anon key
```

> **Why service role?** The `stylists` table has RLS enabled. The `INSERT` policy
> only allows a row's `owner_id` to write it. Seed data has `owner_id = null`, so
> no RLS policy matches. The service role key bypasses RLS entirely, which is the
> correct tool for admin seeding. Never expose this key in client-side code.

---

## NPM scripts

| Script | What it does |
|--------|-------------|
| `npm run db:seed` | Full import run |
| `npm run db:seed:dry` | Validate + transform only, no database writes |

### CLI flags (append with `--`)

```bash
npm run db:seed -- --dry-run                            # same as db:seed:dry
npm run db:seed -- --data=../other/braidmap_data.json   # custom source path
npm run db:seed -- --batch-size=25                      # smaller batches (default 50)
```

---

## Source → DB field mapping

| Source field | DB column | Notes |
|---|---|---|
| `id` | `id` (UUID) | Deterministic UUID v4 derived from BM-XXXX via SHA-256 |
| `name` | `name` | Trimmed |
| `name` + `city` | `slug` | URL-safe, collision-resolved |
| `ig` | `instagram` | Handle only (no `@`) |
| `ig` or `tiktok_u` | `handle` | Primary display handle; prefers Instagram |
| `tiktok_u` | `tiktok` | Handle only (no `@`) |
| `facebook` | `facebook` | Full URL as-is |
| `booking` | `booking_url` | |
| `phone` | `phone` | `null` if empty string |
| `tags[]` | `tags[]` | PascalCase → snake_case (`BraidsGeneral` → `braids_general`) |
| `count` | `service_count` | |
| `deposit` | `deposit_required` | |
| — | `published` | Always `true` for seeded data |
| — | `owner_id`, `bio`, `website` | Always `null` (not in source) |
| `ig_url`, `tiktok` (URL), `maps_url` | *(dropped)* | Derivable from handles or not in schema |

### Tag normalisation

Source tags are PascalCase. They are converted to `snake_case` so the app's
`formatTag()` utility can render them as human-readable labels:

```
BraidsGeneral   →  braids_general   →  "Braids General"
NaturalHairCare →  natural_hair_care →  "Natural Hair Care"
WashBlowDry     →  wash_blow_dry     →  "Wash Blow Dry"
KidsBraids      →  kids_braids       →  "Kids Braids"
```

---

## Idempotency

The script is **safe to run multiple times**:

1. Before inserting, it fetches all existing `slug` and `id` values from the DB.
2. Any record whose UUID **or** slug already exists is skipped (reported as "skipped").
3. Only genuinely new records are inserted.
4. If a batch fails mid-run, re-running the script will retry only the records that
   weren't yet inserted.

```
Re-run example output:
  To insert: 0
  To skip:   121  (already in database)
  ✓ Nothing to insert — all records already exist in the database.
```

---

## Deterministic UUIDs

Each source record has a BM-XXXX id (e.g. `BM-0114`). The script derives a stable
UUID v4 from it using SHA-256:

```
deterministicUuid("BM-0114") → a26e7ed6-449e-4457-9c3e-7ee1322a84d2
```

This UUID is **fixed forever** for that stylist — changing the source record's
name, city, or tags will not change its UUID. This matters for:

- Foreign keys in `favorites`, `reports`, etc.
- Reproducible re-seeds after a table truncation
- Matching records between environments (dev / staging / prod)

---

## File structure

```
scripts/seed/
├── README.md              This file
├── tsconfig.json          Standalone TS config (no Next.js paths)
├── types.ts               SourceStylist + StylistInsert type definitions
├── transform.ts           Pure transformation utilities (slug, UUID, tags, validation)
├── seed-stylists.ts       Main script entry point
└── data/
    └── braidmap_data.json  Source data (git-ignored — copy here before running)
```

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY is not set` | Missing env var | Check `.env.local` has the service role key |
| `Database connection failed` | Wrong URL or key | Verify `NEXT_PUBLIC_SUPABASE_URL` is the bare project URL (no `/rest/v1/`) |
| `Could not read data file` | JSON not copied | Run `cp /path/to/braidmap_data.json scripts/seed/data/` |
| `Validation failed` | Malformed source JSON | Check the error output for field + index |
| Batch fails with `duplicate key` | Slug collision with existing data | The script skips by UUID first; this only appears if a record was inserted by a different tool with the same slug |
| `permission denied for table stylists` | Using anon key instead of service role | Confirm `SUPABASE_SERVICE_ROLE_KEY` is set (not the anon key) |

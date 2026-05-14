# BraidMap Platform — DEVLOG

> **Scope:** `BraidMap_F/BraidMap-FullStack` (Next.js 15 + Supabase)  
> **Static MVP reference:** `BraidMap-Fresh` at `thebraidmap.com`  
> **Do not touch:** BraidMap-Fresh is deployed and untouched.

---

## Version History

| Version | Date       | Summary |
|---------|------------|---------|
| v0.1.0  | 2026-05-13 | Initial scaffold — 54 files, architecture + auth skeleton |
| v0.2.0  | 2026-05-13 | Core feature completion — all missing pages + directory UX + dashboard + toast/skeleton system |
| v0.3.0  | 2026-05-13 | Mobile nav + auth UX hardening + DB type safety + admin panel foundation |
| v0.3.1  | 2026-05-13 | Production seed script — 121 stylists imported from `braidmap_data.json` |
| v0.4.0  | 2026-05-14 | Phase 5+6 hardening — UX polish, zero TypeScript errors, Supabase type generation |

---

## v0.4.0 — Phase 5+6 Hardening (2026-05-14)

### Files modified (11)

| File | Change |
|------|--------|
| `src/types/database.ts` | Full rewrite: hand-written `interface` stub → `export type Database = {…}` alias derived from live schema via PostgREST OpenAPI. Adds real `Enums` section, FK `Relationships` arrays, correct nullable/optional fields, and Supabase CLI–style helper exports (`Tables`, `TablesInsert`, `TablesUpdate`, `Enums`) |
| `package.json` | `@supabase/ssr` bumped `^0.5.2` → `^0.10.3`; `db:types` script switched to `npx supabase` with hardcoded project ID |
| `src/lib/supabase/server.ts` | Updated `setAll` callback to new `(cookies, headers?)` signature from `@supabase/ssr` v0.10 |
| `src/lib/supabase/middleware.ts` | Same `setAll` signature update; now also forwards CDN cache-control headers on auth token refresh |
| `src/constants/index.ts` | Added `REPORT_TYPE_LABELS` record (was missing; only lived in the stub) |
| `src/constants.ts` | Converted from duplicate stub → barrel re-export of `constants/index.ts` |
| `src/app/directory/page.tsx` | Added `.catch()` fallback on `getCitiesAndTags()` so network errors don't crash the full page |
| `src/app/admin/_components/ReportsSection.tsx` | Fixed `bg-g300` → `bg-g400` (g300 absent from Tailwind config — status dot was invisible); added `overflow-x-auto` + `min-w-[540px]` wrapper for mobile horizontal scroll |
| `src/app/error.tsx` | Added "← Home" escape link (`routes.home`), error digest display (`error.digest`), `flex-wrap` on button row |
| `src/app/dashboard/loading.tsx` | Rewrote skeleton to match real dashboard layout: hero, account cards, edit profile, saved stylists grid, recently viewed grid |
| `.env.local` / `.env.example` | Removed erroneous `/rest/v1/` suffix from `NEXT_PUBLIC_SUPABASE_URL` — `createServerClient` expects the bare project URL |

### Root cause of the `never` inference bug (Phase 6)

All 13 TypeScript errors (`Argument of type '{…}' is not assignable to parameter of type 'never'`) shared the same root: a **version mismatch between `@supabase/ssr` and `@supabase/supabase-js`**.

**Exact failure chain:**

1. `@supabase/supabase-js` v2.105.4 expanded `SupabaseClient` from 3 → **5 type parameters**: `<Database, SchemaNameOrClientOptions, SchemaName, Schema, ClientOptions>`.
2. `@supabase/ssr` v0.5.2 was written for `supabase-js ^2.43.4` (the 3-param era). Its `createServerClient` still returns `SupabaseClient<Database, SchemaName, Schema>` — only 3 type args.
3. When TypeScript maps 3 args onto 5 params, the 3rd arg (`Schema = Database['public']`) lands in the **3rd slot (`SchemaName`)**, not the 4th (`Schema`). The actual 4th slot (`Schema`) then uses its default:
   ```
   Omit<Database, '__InternalSupabase'>[SchemaName] extends GenericSchema
     ? Omit<Database, '__InternalSupabase'>[SchemaName]
     : never
   ```
   With `SchemaName` now set to the full public schema object (not the string `'public'`), `Database[{complex object}]` resolves to `never`. `Schema = never`.
4. `from<TableName extends string & keyof never['Tables']>` → `from<TableName extends never>` → every `.from()` call infers `Relation = never` → `.insert()` / `.update()` / `.select()` all take `never`.

**Fix:** upgraded `@supabase/ssr` to v0.10.3, which declares `createServerClient<Database, SchemaName>` (2 type params, no explicit `Schema`), matching the 5-param `SupabaseClient` correctly.

**Why `database.ts` changes had no effect:** the bug was entirely in the package version mismatch — no amount of rewriting the `Database` type could fix a mis-mapped type parameter at the `SupabaseClient` class level.

### Phase 5 UX changes

- **Error boundary** — added home-link escape and error digest reference so users aren't stranded on the error page.
- **Admin table** — invisible status dot (wrong Tailwind colour class) fixed; table now scrolls horizontally on narrow viewports.
- **Directory page** — filter metadata fetch wrapped in `.catch()` so a Supabase connection failure degrades to empty filters instead of a full-page 500.
- **Dashboard loading skeleton** — expanded to match the real page layout (was showing a generic placeholder).

### `db:types` workflow

The generated `database.ts` was derived manually from the live PostgREST OpenAPI schema (`GET /rest/v1/` with service role key). Going forward, regenerate with:

```bash
npm run db:types   # requires: npx supabase login (one-time)
```

This overwrites `src/types/database.ts` with the CLI-generated version, which also picks up new columns, enum values, and FK relationships automatically.

---

## v0.3.1 — Seed Script (2026-05-13)

### New files created (5)

| File | Purpose |
|------|---------|
| `scripts/seed/seed-stylists.ts` | Main seed entry point — env loading, CLI flags, batch insert, summary |
| `scripts/seed/transform.ts` | Pure transform utilities: `deterministicUuid`, `toSlug`, `resolveSlug`, `toSnakeCase`, `nullIfEmpty`, `validateRecord`, `transformRecord` |
| `scripts/seed/types.ts` | `SourceStylist`, `StylistInsert`, `ValidationError`, `TransformResult` type definitions |
| `scripts/seed/tsconfig.json` | Standalone TS config scoped to `scripts/seed/` — no Next.js path aliases |
| `scripts/seed/README.md` | Setup instructions, field mapping table, CLI flags, troubleshooting guide |

### Files modified (3)

| File | Change |
|------|--------|
| `package.json` | Added `tsx` devDependency; added `db:seed` and `db:seed:dry` npm scripts |
| `.gitignore` | Added `scripts/seed/data/` — source JSON is not committed |

### Run results (live, 2026-05-13)

```
Source records:    121
Inserted:          121
Skipped:           0
Failed batches:    0
Warnings:          1  (slug collision auto-resolved — see below)
Elapsed:           1.72s
```

Idempotency confirmed — re-run skips all 121 with zero errors.

### Architecture notes

**Deterministic UUIDs** — Each source record has a legacy `BM-XXXX` id (e.g. `BM-0114`). The script derives a stable UUID v4 from it via `SHA-256("braidmap-seed-v1:<bmId>")`. The same BM-XXXX always produces the same UUID across runs, machines, and environments. This matters for foreign keys in `favorites`, `reports`, etc., and for reproducible re-seeds after a table truncation.

**Idempotency** — Before inserting, the script fetches all existing `id` and `slug` values from the DB. Any record whose UUID or slug is already present is skipped. Only net-new records are sent to Supabase. Safe to re-run at any time; safe to run after a partial failure.

**Tag normalisation** — Source tags are PascalCase (`BraidsGeneral`, `NaturalHairCare`). The script converts them to `snake_case` (`braids_general`, `natural_hair_care`) so the app's `formatTag()` utility renders them as "Braids General" / "Natural Hair Care" in the UI.

**Slug collision** — `BM-0116 "Vancouver Braids"` and `BM-0117 "Vancouver Braids"` (different cities) generated the same base slug. The collision resolver appended the city: `vancouver-braids-vancouver`. Warning logged; no manual intervention required.

**Field mapping highlights**

| Source | DB column | Transform |
|--------|-----------|-----------|
| `id` ("BM-0114") | `id` (UUID) | `deterministicUuid(bmId)` |
| `name` + `city` | `slug` | `resolveSlug()` with collision fallback |
| `ig` | `instagram`, `handle` | Handle only; `handle` prefers `ig`, falls back to `tiktok_u` |
| `tiktok_u` | `tiktok` | Handle only (source `tiktok` field is full URL — dropped) |
| `tags[]` (PascalCase) | `tags[]` | `.map(toSnakeCase)` |
| `count` | `service_count` | Direct |
| `deposit` | `deposit_required` | Direct (boolean) |
| `ig_url`, `tiktok` (URL), `maps_url` | *(dropped)* | Not in schema or derivable from handles |
| `bio`, `website`, `owner_id` | `null` | Not in source data |
| — | `published` | Always `true` for seeded data |

**RLS bypass** — The `stylists` INSERT policy only allows rows where `owner_id = auth.uid()`. Seed rows have `owner_id = null` so no standard policy matches. The script uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS entirely. The key is read from `.env.local` (never committed; never exposed client-side).

**Batch size** — Default 50 records per Supabase insert call. Override with `--batch-size=N`. 3 batches for 121 records.

### npm scripts added

```bash
npm run db:seed             # full import
npm run db:seed:dry         # validate + transform only, no DB writes
npm run db:seed -- --data=  # custom source JSON path
npm run db:seed -- --batch-size=25
```

---

## v0.3.0 — P1–P4 Hardening (2026-05-13)

### New files created (8)

| File | Purpose |
|------|---------|
| `src/components/layout/MobileNav.tsx` | Mobile hamburger + animated drawer, focus trap, scroll lock, auth-aware |
| `src/app/(auth)/login/_components/LoginForm.tsx` | Login client form — `useActionState`, inline errors, loading state |
| `src/app/(auth)/signup/_components/SignupForm.tsx` | Signup client form — `useActionState`, inline errors, loading state |
| `src/services/admin.ts` | `getPendingReports`, `getPendingSuggestions`, `getAllStylists` |
| `src/lib/actions/admin.ts` | `resolveReport`, `rejectReport`, `approveSuggestion`, `rejectSuggestion`, `toggleStylistVisibility` |
| `src/app/admin/_components/ReportsSection.tsx` | Admin UI — reports table, suggestions table, stylist visibility table |
| `src/app/admin/loading.tsx` | Admin skeleton loading state |

### Files modified (12)

| File | Change |
|------|--------|
| `src/components/layout/Nav.tsx` | Added `<MobileNav>` client island; desktop controls wrapped in `hidden md:flex` |
| `src/app/(auth)/login/page.tsx` | Rewritten as server wrapper — removed direct `action={login}` |
| `src/app/(auth)/signup/page.tsx` | Rewritten as server wrapper — removed direct `action={signup}` |
| `src/lib/auth/actions.ts` | Added `loginAction` + `signupAction` — `useActionState`-compatible (prevState, formData) wrappers |
| `src/types/database.ts` | Added `CompositeTypes: { [_ in never]: never }` to public schema — fixes `never[]` inference in supabase-js v2.48 |
| `src/services/favorites.ts` | Removed `(r as { stylist_id: string })` intermediate cast |
| `src/lib/actions/favorites.ts` | Removed `const db = supabase as any` — fully typed Supabase calls |
| `src/lib/actions/report.ts` | Removed `(supabase.from('reports') as any)` cast |
| `src/lib/actions/suggest.ts` | Removed `(supabase.from('suggestions') as any)` cast |
| `src/lib/actions/profile.ts` | Removed `(supabase.from('profiles') as any)` cast |
| `src/app/admin/page.tsx` | Full rewrite — stats header, reports section, suggestions section, stylist visibility table |

### Architecture notes

**Mobile nav** — `MobileNav` is a `'use client'` component that renders two things: (1) the hamburger button (visible on mobile only via `md:hidden`) and (2) the drawer + backdrop. `Nav.tsx` remains a server component — it fetches session server-side and passes `user`, `initial`, `firstName` as props. The desktop auth controls are wrapped in `hidden md:flex`; the mobile nav is placed after. Focus management: Escape → closes + returns focus to hamburger. Tab key → trapped inside drawer. Route change → drawer auto-closes via `usePathname` effect. Body scroll lock via `document.body.style.overflow`.

**Auth UX** — `loginAction`/`signupAction` in `actions.ts` are server actions with `(prevState, formData)` signature that delegate to the original `login`/`signup` functions. `LoginForm`/`SignupForm` use `useActionState` to hold error state. Inline red error banner appears on `state && !state.ok`. Button shows "Logging in…" / "Creating account…" while `pending`. The `redirect()` in the underlying actions is a thrown Next.js signal — it propagates through the wrapper cleanly; state is only populated on error.

**DB type safety** — `@supabase/supabase-js` v2.48 requires `CompositeTypes` in the `Database` schema to resolve generics correctly. Without it, every `.from()` call inferred `never[]`. Adding `CompositeTypes: { [_ in never]: never }` (not `Record<string, never>` — the mapped type form is required) restores full inference. All `as any` casts in actions/services removed.

**Admin panel** — fully server-rendered data fetch in `page.tsx` (with `.catch(() => [])` fallback for each query). Client components handle the interactive approve/reject/toggle calls via `useTransition` + toast feedback. `requireAdmin()` guard in every action double-checks role on the server. All three sections (reports, suggestions, stylist visibility) degrade gracefully to empty states.

---

## v0.1.0 — Initial Scaffold (2026-05-13)

### What was built

Full project scaffold with production-grade architecture:

**Infrastructure**
- Next.js 15 App Router + React 19 + TypeScript strict mode
- Tailwind v3.4 with BraidMap design tokens (ink, paper, g100–g800)
- Supabase SSR auth via `@supabase/ssr` — three clients: browser, server, middleware
- `noUncheckedIndexedAccess` + `typedRoutes: true`
- Zod env validation (`src/utils/env.ts`)
- Centralized route table (`src/config/routes.ts`)
- Security headers in `next.config.mjs`

**Database**
- `supabase/migrations/0001_init.sql` — full schema (7 tables, enums, RLS, triggers, indexes)
- GIN index on `stylists.tags[]`, pg_trgm trigram index on `stylists.name`
- `is_admin(uid)` security definer function
- `handle_new_user()` trigger — auto-creates `profiles` row on auth signup

**Auth**
- Server actions: `login`, `signup`, `logout` with Zod validation + `revalidatePath + redirect`
- `getSession()`, `getUser()`, `getRole()` server helpers
- Middleware: route guards for PROTECTED_ROUTES, ADMIN_ROUTES, PUBLIC_ONLY_ROUTES
- `useUser()` hook for client auth state

**Pages (scaffolded)**
- `/` — Hero + trust stats row
- `/login` — Email/password form wired to Supabase auth
- `/signup` — Name/email/password form
- `/directory` — Server component card grid (fetches from Supabase)
- `/stylist/[slug]` — Profile page with dark hero, tags, social links, booking button
- `/dashboard` — Member dashboard (role, email, member since)
- `/admin` — Role-gated stub
- `/api/health` — Supabase ping endpoint

**Components**
- `Button`, `Input`, `Card/CardBody/CardFooter`, `Container`, `Eyebrow`
- `Nav` (server component, session-aware)
- `Footer`, `Logo`

**Services**
- `listStylists(params)` — city/tag/q/page filtering via Supabase query
- `getStylistBySlug(slug)` — single stylist fetch
- `reports.ts`, `suggestions.ts` — stub service files

---

## v0.2.0 — Core Feature Completion (2026-05-13)

### New files created (23)

| File | Purpose |
|------|---------|
| `src/utils/formatTag.ts` | `snake_case` slug → "Display Label" formatter |
| `src/utils/recents.ts` | `bm_recents` cookie parse/format/add helpers |
| `src/components/ui/Toast.tsx` | `toast()` + `<Toaster>` — custom event-bus toast system |
| `src/components/ui/FavoriteButton.tsx` | Client toggle button wired to `toggleFavorite` action |
| `src/components/ui/SkeletonCard.tsx` | `SkeletonCard` + `SkeletonGrid` shimmer components |
| `src/components/TrackView.tsx` | Client component — sets `bm_recents` cookie on mount |
| `src/lib/actions/report.ts` | `submitReport` server action (Zod + Supabase insert) |
| `src/lib/actions/suggest.ts` | `submitSuggestion` server action |
| `src/lib/actions/favorites.ts` | `toggleFavorite` server action |
| `src/lib/actions/profile.ts` | `updateProfile` server action |
| `src/services/favorites.ts` | `getUserFavoriteIds`, `getUserFavorites` |
| `src/app/report/page.tsx` | `/report` page — server component wrapper |
| `src/app/report/_components/ReportForm.tsx` | Report form — `useActionState` client component |
| `src/app/suggest/page.tsx` | `/suggest` page — server component wrapper |
| `src/app/suggest/_components/SuggestForm.tsx` | Suggest form — `useActionState` client component |
| `src/app/directory/_components/FilterSidebar.tsx` | City + tag filters — URL-driven client component |
| `src/app/directory/_components/SearchInput.tsx` | Debounced search — URL-driven client component |
| `src/app/directory/_components/Pagination.tsx` | Prev/Next pagination — URL-driven client component |
| `src/app/directory/loading.tsx` | Directory skeleton loading state |
| `src/app/stylist/[slug]/loading.tsx` | Profile skeleton loading state |
| `src/app/dashboard/loading.tsx` | Dashboard skeleton loading state |
| `src/app/dashboard/_components/EditProfileForm.tsx` | Profile name edit — `useActionState` client component |

### Files modified (10)

| File | Change |
|------|--------|
| `src/app/layout.tsx` | Added `<Toaster />` |
| `src/app/directory/page.tsx` | Full rewrite — filter sidebar, search, pagination, FavoriteButton, tag labels |
| `src/app/stylist/[slug]/page.tsx` | Added `<FavoriteButton>`, `<TrackView>`, report link, website/phone fields |
| `src/app/dashboard/page.tsx` | Full rewrite — profile edit, saved stylists, recently viewed sections |
| `src/services/stylists.ts` | Added `getCitiesAndTags()`, `getStylistsByIds()` |
| `src/config/routes.ts` | Added explicit typed return types for `typedRoutes` compat |
| `src/components/ui/index.ts` | Exported Toast, FavoriteButton, SkeletonCard |

### Architecture notes

**Toast system** — custom `CustomEvent`-based bus. `toast(message, variant)` dispatches `bm:toast` on `window`. `<Toaster>` listens and renders. No React context required — works across RSC boundaries. Auto-dismiss at 4s.

**Recently viewed** — `bm_recents` cookie (max 5 IDs, comma-separated, 30-day TTL). `TrackView` sets it client-side on profile mount. Dashboard reads it server-side via `cookies()` from `next/headers`, fetches stylists with `getStylistsByIds`.

**Favorites** — `favorites` table (user_id, stylist_id). `toggleFavorite` server action does check → delete/insert. `FavoriteButton` uses `useTransition` for optimistic feedback + toast. Directory page pre-fetches all favorite IDs for the current user in one query, passes as a `Set` to each card.

**Directory filters** — all three client components (`FilterSidebar`, `SearchInput`, `Pagination`) are URL-driven. They call `router.push` to update `?city=`, `?tag=`, `?q=`, `?page=` params. The server component (`directory/page.tsx`) re-renders with the new params. `<Suspense>` wraps each client component to avoid blocking server render.

**TypeScript note** — `typedRoutes: true` in `next.config.mjs` requires Next.js to regenerate `.next/types/__route-types.ts` before new routes (`/report`, `/suggest`) are recognized. `Nav.tsx`, `Footer.tsx` errors for these routes will auto-resolve on first `npm run dev`. Dynamic query-string URLs (`router.push(\`${pathname}?${params}\`)`) use `as any` casts — this is the standard Next.js workaround for dynamic route navigation with `typedRoutes`.

---

## Feature Parity — Static MVP vs FullStack Platform

| Feature | Static MVP | FullStack v0.3.0 |
|---------|-----------|-----------------|
| Landing page | ✓ Hero + signup gate | ✓ Hero + stats (no gate — auth is real) |
| Login / Register | ✓ localStorage | ✓ Supabase Auth |
| Directory — card grid | ✓ 121 stylists | ✓ Live from Supabase |
| Directory — city filter | ✓ | ✓ v0.2.0 |
| Directory — style/tag filter | ✓ | ✓ v0.2.0 |
| Directory — search | ✓ | ✓ v0.2.0 debounced |
| Directory — pagination | — (all at once) | ✓ v0.2.0 |
| Directory — Book button | ✓ | ✓ v0.2.0 |
| Directory — Save button | ✓ | ✓ v0.2.0 (Supabase-backed) |
| Directory — tag labels | ✓ | ✓ v0.2.0 |
| Stylist profile page | ✓ | ✓ v0.2.0 |
| Profile — Save/favourite | ✓ | ✓ v0.2.0 |
| Profile — Report link | ✓ | ✓ v0.2.0 (prefilled) |
| Member dashboard | ✓ | ✓ v0.2.0 |
| Dashboard — recently viewed | ✓ | ✓ v0.2.0 (cookie-based) |
| Dashboard — saved stylists | ✓ | ✓ v0.2.0 (Supabase `favorites`) |
| Dashboard — edit profile | — | ✓ v0.2.0 |
| Report form | ✓ | ✓ v0.2.0 |
| Suggest form | ✓ | ✓ v0.2.0 |
| Toast notifications | ✓ | ✓ v0.2.0 |
| Skeleton loading states | ✓ | ✓ v0.2.0 |
| Button loading states | ✓ | ✓ (Button has `loading` prop) |
| Mobile nav | ✓ | ✓ v0.3.0 (hamburger + animated drawer, focus trap, scroll lock) |
| Admin panel | — | ✓ v0.3.0 (reports, suggestions, stylist visibility) |

---

## Next Build Priorities (v0.5.0+)

Phase 5+6 hardening complete. Zero TypeScript errors. Remaining work ordered by impact.

### P1 — Email notifications
- Supabase Edge Function or Resend integration: notify admin on new report/suggestion submitted.
- Notify user when their suggestion is approved/rejected.

### P2 — Stylist owner portal
- Allow stylists with `role = 'stylist'` to claim and edit their own profile.
- `/dashboard/profile` edit page for stylist-role users.

### P3 — Search improvements
- Full-text search across name + bio + tags (currently `ilike` on name only).
- Add pg_trgm trigram similarity scoring.

### P4 — DB types (CLI-generated) *(partially done)*
- `database.ts` is now derived from the live schema but via manual OpenAPI parsing.
- Run `npx supabase login` once, then `npm run db:types` to overwrite with the authoritative CLI-generated version.
- Will pick up any new columns/enums/FK changes automatically going forward.

### P5 — Analytics / events
- Wire up the `events` table for page views and button clicks.
- Admin dashboard analytics section.

---

## File Reference (v0.3.0)

```
src/app/
├── page.tsx                        Landing ✓
├── layout.tsx                      Root layout + Toaster ✓
├── (auth)/
│   ├── login/
│   │   ├── page.tsx                Login server wrapper ✓ v0.3.0
│   │   └── _components/
│   │       └── LoginForm.tsx       useActionState form + inline errors ✓ v0.3.0
│   └── signup/
│       ├── page.tsx                Signup server wrapper ✓ v0.3.0
│       └── _components/
│           └── SignupForm.tsx      useActionState form + inline errors ✓ v0.3.0
├── report/
│   ├── page.tsx                    Report page ✓ v0.2.0
│   └── _components/ReportForm.tsx  Report form ✓ v0.2.0
├── suggest/
│   ├── page.tsx                    Suggest page ✓ v0.2.0
│   └── _components/SuggestForm.tsx Suggest form ✓ v0.2.0
├── directory/
│   ├── page.tsx                    Full directory ✓ v0.2.0
│   ├── loading.tsx                 Skeleton ✓ v0.2.0
│   └── _components/
│       ├── FilterSidebar.tsx       City + tag filters ✓ v0.2.0
│       ├── SearchInput.tsx         Debounced search ✓ v0.2.0
│       └── Pagination.tsx          Prev/Next ✓ v0.2.0
├── stylist/[slug]/
│   ├── page.tsx                    Profile ✓ v0.2.0
│   └── loading.tsx                 Skeleton ✓ v0.2.0
├── dashboard/
│   ├── page.tsx                    Full dashboard ✓ v0.2.0
│   ├── loading.tsx                 Skeleton ✓ v0.2.0
│   └── _components/
│       └── EditProfileForm.tsx     Name edit ✓ v0.2.0
├── admin/
│   ├── page.tsx                    Full admin console ✓ v0.3.0
│   ├── loading.tsx                 Admin skeleton ✓ v0.3.0
│   └── _components/
│       └── ReportsSection.tsx      Reports + Suggestions + Visibility tables ✓ v0.3.0
├── api/health/route.ts             Supabase ping ✓
├── error.tsx                       Error boundary ✓
└── not-found.tsx                   404 ✓

src/services/
├── stylists.ts     listStylists, getStylistBySlug, getCitiesAndTags, getStylistsByIds ✓
├── favorites.ts    getUserFavoriteIds, getUserFavorites ✓ v0.2.0
├── admin.ts        getPendingReports, getPendingSuggestions, getAllStylists ✓ v0.3.0
├── reports.ts      stub (actions handle inserts)
└── suggestions.ts  stub (actions handle inserts)

src/lib/actions/
├── report.ts       submitReport ✓ v0.2.0 (type-safe v0.3.0)
├── suggest.ts      submitSuggestion ✓ v0.2.0 (type-safe v0.3.0)
├── favorites.ts    toggleFavorite ✓ v0.2.0 (type-safe v0.3.0)
├── profile.ts      updateProfile ✓ v0.2.0 (type-safe v0.3.0)
└── admin.ts        resolveReport, rejectReport, approveSuggestion, rejectSuggestion, toggleStylistVisibility ✓ v0.3.0

src/components/
├── TrackView.tsx          Sets bm_recents cookie ✓ v0.2.0
├── layout/
│   ├── Nav.tsx            Server nav + MobileNav island ✓ v0.3.0
│   └── MobileNav.tsx      Hamburger + animated drawer + focus trap ✓ v0.3.0
└── ui/
    ├── Toast.tsx          toast() + Toaster ✓ v0.2.0
    ├── FavoriteButton.tsx Save/unsave toggle ✓ v0.2.0
    ├── SkeletonCard.tsx   Shimmer cards ✓ v0.2.0
    ├── Button.tsx         loading prop ✓
    ├── Input.tsx          Input + Textarea ✓
    ├── Card.tsx           Card/Body/Footer ✓
    └── ...

src/utils/
├── formatTag.ts    slug → "Display Label" ✓ v0.2.0
├── recents.ts      bm_recents cookie helpers ✓ v0.2.0
├── cn.ts           clsx + tailwind-merge ✓
└── env.ts          Zod env validation ✓
```

---

## Known Issues

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | ~~DB has no rows~~ | ~~Blocker~~ | ✅ 121 stylists seeded via `npm run db:seed` v0.3.1 |
| 2 | ~~`/report` and `/suggest` return 404~~ | ~~High~~ | ✅ Pages built v0.2.0 |
| 3 | ~~Filter sidebar shows "coming soon"~~ | ~~High~~ | ✅ Built v0.2.0 |
| 4 | ~~No toast notifications~~ | ~~Medium~~ | ✅ Toast system built v0.2.0 |
| 5 | ~~No loading skeletons~~ | ~~Medium~~ | ✅ `loading.tsx` files added v0.2.0 |
| 6 | ~~No mobile nav~~ | ~~Medium~~ | ✅ `MobileNav.tsx` built v0.3.0 |
| 7 | ~~Auth forms had no inline error display~~ | ~~Medium~~ | ✅ `useActionState` forms built v0.3.0 |
| 8 | ~~`never[]` type errors — `@supabase/ssr` / `supabase-js` version mismatch~~ | ~~High~~ | ✅ `@supabase/ssr` upgraded to v0.10.3 + `database.ts` regenerated v0.4.0 |
| 9 | ~~Admin panel was a stub~~ | ~~Low~~ | ✅ Admin panel built v0.3.0 |
| 10 | ~~Admin status dot invisible (wrong Tailwind class)~~ | ~~Low~~ | ✅ `bg-g300` → `bg-g400` v0.4.0 |
| 11 | ~~Admin table overflows on mobile~~ | ~~Low~~ | ✅ `overflow-x-auto` wrapper added v0.4.0 |
| 12 | ~~Error boundary had no home-link escape~~ | ~~Low~~ | ✅ "← Home" link + digest added v0.4.0 |
| 13 | ~~`NEXT_PUBLIC_SUPABASE_URL` included `/rest/v1/` suffix~~ | ~~Medium~~ | ✅ Fixed in `.env.local` + `.env.example` v0.4.0 |
| 14 | `typedRoutes` errors for `/report`, `/suggest` in Nav/Footer | Low | Auto-resolves on first `npm run dev` |
| 15 | `database.ts` manually derived from OpenAPI — not CLI-generated | Low | Run `npm run db:types` after `npx supabase login` to get fully authoritative types |

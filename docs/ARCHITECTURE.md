# BraidMap Platform — Architecture

## Goals

1. **Preserve the MVP aesthetic** — the static MVP is approved and live. Brand language survives the rebuild verbatim.
2. **Real auth + real database** — replace `localStorage` with Supabase + Postgres.
3. **Role-aware UX** — `visitor → member → stylist → admin`.
4. **Production-grade defaults** — RLS, env validation, security headers, error boundary, 404, generated types.
5. **Optional everything else** — analytics, payments, monitoring are wired as no-ops and activate when keys are present.

---

## Request flow

```
┌──────────┐   1. request   ┌────────────────────┐
│ Browser  │ ─────────────► │ src/middleware.ts  │  reads request cookies
└──────────┘                └────────┬───────────┘
                                     │ refreshes Supabase session
                                     │ → response with rotated cookie
                                     ▼
                            ┌─────────────────────┐
                            │ Next.js App Router  │  resolves /app/.../page.tsx
                            └────────┬────────────┘
                                     │ Server component
                                     ▼
                            ┌─────────────────────┐
                            │ getSession()        │  RLS-aware read
                            │ services/stylists.ts│
                            └────────┬────────────┘
                                     │ supabase-js (server client)
                                     ▼
                            ┌─────────────────────┐
                            │ Postgres + RLS      │  policies enforce who sees what
                            └─────────────────────┘
```

**Key principle:** RLS is the source of truth for authorization. Middleware + page guards are UX optimizations (fast redirects, no flash of forbidden content). Even if both layers failed, the database would not leak data.

---

## Supabase clients — three flavors

| File | Use from | Notes |
|------|----------|-------|
| `src/lib/supabase/client.ts`     | Client components, hooks | Reads `NEXT_PUBLIC_*` only |
| `src/lib/supabase/server.ts`     | Server components, route handlers, server actions | Honors session cookies |
| `src/lib/supabase/middleware.ts` | `middleware.ts` only | Special cookie handling for session refresh |

The `createServiceClient()` export in `server.ts` returns a **service-role** client. RLS-bypass. Use only for admin operations and never log its key.

---

## Auth

Session is owned by Supabase Auth — JWT + refresh token in HTTP-only cookies. The middleware refreshes the session on every request, so:

- Cookies never expire mid-session
- Server components always see a fresh user
- Client hook (`useUser`) subscribes to `onAuthStateChange` for client-side updates

**Roles** live in `profiles.role` (not in the JWT). This means a role change takes effect on the next request. If you ever need it baked into the JWT, set up a custom `access_token_hook` in Supabase Auth.

---

## Server actions

Auth flows (`login`, `signup`, `logout`) are **server actions** in `src/lib/auth/actions.ts`. They:

1. Validate input with Zod
2. Call Supabase
3. `revalidatePath('/', 'layout')` — busts the layout cache so the nav re-renders
4. `redirect(...)` on success

Server actions can be called directly from `<form action={action}>` — no JSON, no fetch, no client JS required.

---

## RLS policy patterns

| Resource    | Owner reads | Admin reads | Public reads |
|-------------|:-:|:-:|:-:|
| `profiles`     | ✓ | ✓ | ✗ |
| `stylists` (published) | ✓ | ✓ | ✓ |
| `stylists` (draft)     | ✓ (owner) | ✓ | ✗ |
| `reports`     | ✓ (reporter) | ✓ | ✗ |
| `suggestions` | ✓ (submitter) | ✓ | ✗ |
| `favorites`   | ✓ | ✗ | ✗ |
| `admin_actions` | — | ✓ | ✗ |
| `events`        | — | ✓ | ✗ |

See `supabase/migrations/0001_init.sql` for exact policies.

---

## File organization conventions

| Folder | What lives here |
|--------|-----------------|
| `src/app/`        | Pages and route handlers. **Never** put reusable logic here. |
| `src/components/` | Reusable UI. No business logic. `ui/` for primitives, `layout/` for shell. |
| `src/features/`   | Vertical features (see `features/README.md`). |
| `src/lib/`        | Cross-cutting infrastructure (auth, supabase, future: stripe). |
| `src/services/`   | Database query layer. Server-only. Returns typed rows. |
| `src/utils/`      | Pure functions. No DOM, no DB, no fetch. |
| `src/hooks/`      | Client React hooks. |
| `src/providers/`  | Client React context providers. |

**Import alias `@/*` points to `src/*`** — set in `tsconfig.json`.

---

## Future hooks

- **Sentry**: wire `src/app/error.tsx` to call `Sentry.captureException(error)` once the DSN is configured.
- **PostHog**: insert into `public.events` table from server actions for sensitive flows; use `posthog-js` for client-side page views.
- **Stripe**: add `src/lib/stripe/` and a `subscriptions` table; gate features via `profiles.subscription_tier`.
- **Messaging**: new table `messages (id, sender_id, recipient_id, body, created_at)` + Supabase Realtime subscription.

---

## What is NOT in this scaffold

- No tests yet (Vitest + Playwright recommended)
- No bundle splitting tuning yet (revisit when actual feature work lands)
- No edge runtime opt-in yet (default Node runtime is fine for v2.0)
- No i18n yet (next-intl when needed)
- No CMS yet — direct DB editing is fine until stylist count > 1000

These are intentional. Don't pay complexity costs until you have evidence you need them.

# Setup — first time

## 1. Tools you need

- Node ≥ 20
- npm
- A Supabase project (https://supabase.com)
- Optional but recommended: [Supabase CLI](https://supabase.com/docs/guides/cli) for migrations

## 2. Clone + install

```bash
git clone <repo-url> braidmap-platform
cd braidmap-platform
cp .env.example .env.local
npm install
```

## 3. Create the Supabase project

1. Go to https://supabase.com → new project. Pick a region close to your users (e.g. `us-west-1` for BC).
2. Wait for provisioning (~2 min).
3. In **Project settings → API**, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY` (server only!)
   - Project ref (the bit before `.supabase.co`) → `SUPABASE_PROJECT_ID`
4. Paste them into `.env.local`.

## 4. Run the schema

**Option A — Supabase CLI (recommended for teams):**
```bash
supabase link --project-ref $SUPABASE_PROJECT_ID
supabase db push
```

**Option B — copy/paste in the SQL editor:**
1. Open Supabase dashboard → SQL Editor → New query.
2. Paste the contents of `supabase/migrations/0001_init.sql`.
3. Run.

## 5. Enable email auth

Supabase dashboard → Authentication → Providers → Email → enable. Disable "Confirm email" for local dev if you want instant logins.

## 6. Generate types

```bash
SUPABASE_PROJECT_ID=your-project-ref npm run db:types
```

This overwrites `src/types/database.ts` with the live schema. Re-run after every migration.

## 7. Start dev server

```bash
npm run dev
```

Open http://localhost:3000.

## 8. Create your first admin

After signing up via the UI, promote your user to admin in the SQL editor:

```sql
update public.profiles
   set role = 'admin'
 where email = 'you@example.com';
```

You can now visit `/admin`.

## 9. Deploy to Vercel

1. Push to GitHub.
2. https://vercel.com/new → import the repo.
3. Add **all env vars** from `.env.local` to the Vercel project. **Mark `SUPABASE_SERVICE_ROLE_KEY` as encrypted** and uncheck "Preview" / "Development" if you want to keep it production-only.
4. Add your production domain in **Supabase → Authentication → URL Configuration → Site URL**, otherwise auth redirects break.
5. Deploy.

## 10. Health check

After deploy, visit `/api/health`. You should get:

```json
{ "ok": true, "latencyMs": 42, "service": "braidmap" }
```

If you get `{ "ok": false, ... }`, the most common causes are:
- Service role key missing or wrong
- Migration didn't run (no `profiles` table)
- Wrong Supabase URL

## Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `Error: Invalid environment variables` at boot | `.env.local` missing required keys; check the Zod schema in `src/utils/env.ts` |
| Signup works but profile row missing | The `on_auth_user_created` trigger didn't fire — re-run section 9 of the migration |
| Admin redirected to `/dashboard` | The `profiles.role` for that user is not `'admin'` — promote them via SQL |
| `Module not found: @/...` | Run `npm run type-check` — usually a path alias mismatch |
| Build fails on Vercel: `database types missing fields` | Run `npm run db:types` locally and commit the regenerated file |

-- ════════════════════════════════════════════════════════════════════════════
-- BraidMap — initial schema
-- Designed for Supabase (Postgres 15+, RLS enabled).
-- Run in Supabase SQL editor, or via `supabase db push`.
-- ════════════════════════════════════════════════════════════════════════════

-- ── 1. Extensions ──────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- ── 2. Enums ───────────────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('visitor', 'member', 'stylist', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type report_status as enum ('open', 'in_review', 'resolved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type suggestion_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

-- ── 3. profiles ────────────────────────────────────────────────────────────
-- Mirrors auth.users 1:1. Populated by the on-signup trigger below.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text,
  role        user_role not null default 'member',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);

-- ── 4. stylists ────────────────────────────────────────────────────────────
create table if not exists public.stylists (
  id                uuid primary key default uuid_generate_v4(),
  slug              text not null unique,
  owner_id          uuid references public.profiles(id) on delete set null,
  name              text not null,
  city              text not null,
  handle            text,
  bio               text,
  tags              text[] not null default '{}',
  booking_url       text,
  phone             text,
  instagram         text,
  tiktok            text,
  facebook          text,
  website           text,
  published         boolean not null default false,
  deposit_required  boolean not null default false,
  service_count     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists stylists_city_idx       on public.stylists (city);
create index if not exists stylists_published_idx  on public.stylists (published) where published;
create index if not exists stylists_tags_gin_idx   on public.stylists using gin (tags);
create index if not exists stylists_name_trgm_idx  on public.stylists using gin (name gin_trgm_ops);
create extension if not exists pg_trgm;

-- ── 5. reports ─────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id            uuid primary key default uuid_generate_v4(),
  stylist_id    uuid references public.stylists(id) on delete cascade,
  reporter_id   uuid references public.profiles(id) on delete set null,
  issue_type    text not null,
  details       text not null,
  status        report_status not null default 'open',
  resolved_by   uuid references public.profiles(id) on delete set null,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists reports_stylist_idx on public.reports (stylist_id);
create index if not exists reports_status_idx  on public.reports (status);

-- ── 6. suggestions ─────────────────────────────────────────────────────────
create table if not exists public.suggestions (
  id              uuid primary key default uuid_generate_v4(),
  submitter_id    uuid references public.profiles(id) on delete set null,
  business_name   text not null,
  city            text not null,
  instagram       text,
  tiktok          text,
  facebook        text,
  website         text,
  booking_url     text,
  phone           text,
  styles          text[] not null default '{}',
  notes           text,
  status          suggestion_status not null default 'pending',
  reviewed_by     uuid references public.profiles(id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists suggestions_status_idx on public.suggestions (status);

-- ── 7. favorites ───────────────────────────────────────────────────────────
create table if not exists public.favorites (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  stylist_id  uuid not null references public.stylists(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, stylist_id)
);

create index if not exists favorites_stylist_idx on public.favorites (stylist_id);

-- ── 8. admin_actions (audit log) ───────────────────────────────────────────
create table if not exists public.admin_actions (
  id            uuid primary key default uuid_generate_v4(),
  admin_id      uuid not null references public.profiles(id) on delete restrict,
  action_type   text not null,
  target_table  text not null,
  target_id     text not null,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index if not exists admin_actions_admin_idx     on public.admin_actions (admin_id);
create index if not exists admin_actions_target_idx    on public.admin_actions (target_table, target_id);
create index if not exists admin_actions_created_idx   on public.admin_actions (created_at desc);

-- ── 9. events (analytics-ready) ────────────────────────────────────────────
create table if not exists public.events (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.profiles(id) on delete set null,
  event_name   text not null,
  properties   jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

create index if not exists events_user_idx     on public.events (user_id);
create index if not exists events_name_idx     on public.events (event_name);
create index if not exists events_created_idx  on public.events (created_at desc);

-- ── 10. Triggers ───────────────────────────────────────────────────────────
-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_profiles_updated  on public.profiles;
create trigger trg_profiles_updated  before update on public.profiles  for each row execute function public.set_updated_at();

drop trigger if exists trg_stylists_updated  on public.stylists;
create trigger trg_stylists_updated  before update on public.stylists  for each row execute function public.set_updated_at();

-- Auto-create a profile row when a new auth.users row is inserted
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── 11. Helper: is_admin(uuid) ─────────────────────────────────────────────
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.profiles where id = uid), false);
$$;

-- ── 12. RLS ────────────────────────────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.stylists      enable row level security;
alter table public.reports       enable row level security;
alter table public.suggestions   enable row level security;
alter table public.favorites     enable row level security;
alter table public.admin_actions enable row level security;
alter table public.events        enable row level security;

-- profiles: users read/write their own row; admins read/write all
drop policy if exists "profiles select own"      on public.profiles;
drop policy if exists "profiles select admin"    on public.profiles;
drop policy if exists "profiles update own"      on public.profiles;
drop policy if exists "profiles update admin"    on public.profiles;

create policy "profiles select own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles select admin" on public.profiles for select using (public.is_admin(auth.uid()));
create policy "profiles update own"   on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles update admin" on public.profiles for update using (public.is_admin(auth.uid()));

-- stylists: anyone reads published; owner manages their own; admins manage all
drop policy if exists "stylists read public"   on public.stylists;
drop policy if exists "stylists read owner"    on public.stylists;
drop policy if exists "stylists insert owner"  on public.stylists;
drop policy if exists "stylists update owner"  on public.stylists;
drop policy if exists "stylists admin all"     on public.stylists;

create policy "stylists read public"  on public.stylists for select using (published = true);
create policy "stylists read owner"   on public.stylists for select using (owner_id = auth.uid());
create policy "stylists insert owner" on public.stylists for insert with check (owner_id = auth.uid());
create policy "stylists update owner" on public.stylists for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "stylists admin all"    on public.stylists for all   using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- reports: any authed user can create; reporter reads own; admin reads/updates all
drop policy if exists "reports insert authed" on public.reports;
drop policy if exists "reports read own"      on public.reports;
drop policy if exists "reports admin all"     on public.reports;

create policy "reports insert authed" on public.reports for insert with check (auth.uid() is not null and reporter_id = auth.uid());
create policy "reports read own"      on public.reports for select using (reporter_id = auth.uid());
create policy "reports admin all"     on public.reports for all   using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- suggestions: same pattern as reports
drop policy if exists "suggest insert authed" on public.suggestions;
drop policy if exists "suggest read own"      on public.suggestions;
drop policy if exists "suggest admin all"     on public.suggestions;

create policy "suggest insert authed" on public.suggestions for insert with check (auth.uid() is not null and submitter_id = auth.uid());
create policy "suggest read own"      on public.suggestions for select using (submitter_id = auth.uid());
create policy "suggest admin all"     on public.suggestions for all   using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- favorites: a user manages their own
drop policy if exists "favorites own all" on public.favorites;
create policy "favorites own all" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- admin_actions: only admins read/write
drop policy if exists "admin_actions admin only" on public.admin_actions;
create policy "admin_actions admin only" on public.admin_actions for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- events: any authed user can insert their own; admins read all
drop policy if exists "events insert own"   on public.events;
drop policy if exists "events admin select" on public.events;
create policy "events insert own"   on public.events for insert with check (user_id is null or user_id = auth.uid());
create policy "events admin select" on public.events for select using (public.is_admin(auth.uid()));

-- ════════════════════════════════════════════════════════════════════════════
-- END 0001_init.sql
-- ════════════════════════════════════════════════════════════════════════════

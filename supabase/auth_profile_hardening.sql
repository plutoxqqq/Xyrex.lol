-- Xyrex auth/profile hardening migration
-- Run in Supabase SQL editor with a privileged role.

create extension if not exists pgcrypto;

create table if not exists public.xyrex_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  email text not null,
  progress jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint xyrex_profiles_username_format check (username ~ '^[a-z0-9._]{3,24}$')
);

create index if not exists idx_xyrex_profiles_user_id on public.xyrex_profiles(user_id);
create index if not exists idx_xyrex_profiles_username on public.xyrex_profiles(username);

alter table public.xyrex_profiles enable row level security;

create or replace function public.xyrex_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_xyrex_profiles_updated_at on public.xyrex_profiles;
create trigger trg_xyrex_profiles_updated_at
before update on public.xyrex_profiles
for each row execute function public.xyrex_set_updated_at();

drop policy if exists "profiles_select_own" on public.xyrex_profiles;
create policy "profiles_select_own"
on public.xyrex_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.xyrex_profiles;
create policy "profiles_insert_own"
on public.xyrex_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.xyrex_profiles;
create policy "profiles_update_own"
on public.xyrex_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Public RPC used for login/reset by username without exposing the entire profile table.
create or replace function public.xyrex_lookup_login_email(input_username text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select p.email
  from public.xyrex_profiles p
  where p.username = lower(trim(input_username))
  limit 1;
$$;

create or replace function public.xyrex_username_exists(input_username text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists(
    select 1
    from public.xyrex_profiles p
    where p.username = lower(trim(input_username))
  );
$$;

revoke all on function public.xyrex_lookup_login_email(text) from public;
revoke all on function public.xyrex_username_exists(text) from public;
grant execute on function public.xyrex_lookup_login_email(text) to anon, authenticated;
grant execute on function public.xyrex_username_exists(text) to anon, authenticated;

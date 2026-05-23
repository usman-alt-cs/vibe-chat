/* =======================================================================
   Supabase Database Schema for VibeChat
   Run this SQL in: Supabase Dashboard → SQL Editor → New Query
   ======================================================================= */

-- Enable UUID helper (already available in Supabase Postgres)
create extension if not exists "pgcrypto";

-- ─── PROFILES ─────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique,
  username     text unique not null,
  full_name    text not null,
  phone_number text,
  avatar_url   text,
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── MESSAGES ─────────────────────────────────────────────────────────
create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references public.profiles(id) on delete cascade,
  receiver_id  uuid not null references public.profiles(id) on delete cascade,
  content      text not null check (char_length(content) <= 2000),
  message_type text not null default 'text',
  is_read      boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ─── INDEXES ──────────────────────────────────────────────────────────
create index if not exists profiles_username_idx
  on public.profiles (lower(username));

create index if not exists profiles_full_name_idx
  on public.profiles (lower(full_name));

create index if not exists messages_convo_idx
  on public.messages (sender_id, receiver_id, created_at desc);

create index if not exists messages_receiver_idx
  on public.messages (receiver_id, created_at desc);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.messages  enable row level security;

-- Profiles: any authenticated user can read all profiles (needed for search)
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
  on public.profiles for select
  to authenticated
  using (true);

-- Profiles: users can only insert their own row
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

-- Profiles: users can only update their own row
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Messages: users can only read messages they sent or received
drop policy if exists "messages_select" on public.messages;
create policy "messages_select"
  on public.messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Messages: users can only insert messages as themselves
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

-- Messages: receivers can mark messages as read
drop policy if exists "messages_update_read" on public.messages;
create policy "messages_update_read"
  on public.messages for update
  to authenticated
  using (auth.uid() = receiver_id)
  with check (auth.uid() = receiver_id);

-- ─── REALTIME ─────────────────────────────────────────────────────────
-- Enable Realtime on messages table.
-- Run this in SQL Editor OR enable in Supabase Dashboard → Database → Replication
alter publication supabase_realtime add table public.messages;

-- ─── PROFILE CREATION TRIGGER ──────────────────────────────────────────
-- Automatically create profile row when auth.users row is created

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_username text;
begin
  base_username :=
    coalesce(
      nullif(new.raw_user_meta_data ->> 'username', ''),
      split_part(new.email, '@', 1)
    );

  insert into public.profiles (
    id,
    email,
    username,
    full_name,
    phone_number,
    avatar_url,
    bio
  )
  values (
    new.id,
    new.email,
    base_username,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(new.email, '@', 1)
    ),
    nullif(new.raw_user_meta_data ->> 'phone_number', ''),
    null,
    null
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

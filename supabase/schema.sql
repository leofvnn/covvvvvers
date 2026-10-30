-- Album Coverz database schema
-- Run this once in the Supabase SQL editor, then run seed.sql.

-- Collection ---------------------------------------------------------------

create table if not exists public.cover_types (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  hero_image text,
  hero_album text,
  sort_order int not null default 99
);

create table if not exists public.creators (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  role text
);

create table if not exists public.covers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  artist text not null,
  release_year int not null,
  decade text not null,
  label text,
  country text,
  cover_type_id uuid references public.cover_types (id) on delete set null,
  subgenres text[] not null default '{}',
  credits_text text,
  description_html text,
  color text,
  accent_color text,
  image_url text not null,
  image_width int,
  image_height int,
  spotify_album_id text,
  spotify_url text,
  apple_music_url text,
  youtube_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists covers_year_idx on public.covers (release_year desc, title);
create index if not exists covers_type_idx on public.covers (cover_type_id);

create table if not exists public.cover_creators (
  cover_id uuid not null references public.covers (id) on delete cascade,
  creator_id uuid not null references public.creators (id) on delete cascade,
  primary key (cover_id, creator_id)
);

create index if not exists cover_creators_creator_idx on public.cover_creators (creator_id);

-- Accounts -----------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Create a profile row for every new account.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  cover_id uuid not null references public.covers (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, cover_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  album_title text not null check (char_length(album_title) between 1 and 200),
  artist text not null check (char_length(artist) between 1 and 200),
  release_year int check (release_year between 1979 and 2100),
  link text check (char_length(link) <= 500),
  cover_credit text check (char_length(cover_credit) <= 300),
  note text check (char_length(note) <= 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create index if not exists submissions_status_idx on public.submissions (status, created_at desc);

-- Row level security -------------------------------------------------------

alter table public.cover_types enable row level security;
alter table public.creators enable row level security;
alter table public.covers enable row level security;
alter table public.cover_creators enable row level security;
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.submissions enable row level security;

-- The collection is public to read; only admins can change it.
drop policy if exists "read cover types" on public.cover_types;
create policy "read cover types" on public.cover_types for select using (true);
drop policy if exists "admin cover types" on public.cover_types;
create policy "admin cover types" on public.cover_types for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read creators" on public.creators;
create policy "read creators" on public.creators for select using (true);
drop policy if exists "admin creators" on public.creators;
create policy "admin creators" on public.creators for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read covers" on public.covers;
create policy "read covers" on public.covers for select using (true);
drop policy if exists "admin covers" on public.covers;
create policy "admin covers" on public.covers for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read cover creators" on public.cover_creators;
create policy "read cover creators" on public.cover_creators for select using (true);
drop policy if exists "admin cover creators" on public.cover_creators;
create policy "admin cover creators" on public.cover_creators for all using (public.is_admin()) with check (public.is_admin());

-- Profiles: you can read and rename your own. Nobody can make themselves admin.
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

-- Favorites belong to their owner.
drop policy if exists "own favorites" on public.favorites;
create policy "own favorites" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Submissions: members add and read their own; admins read and review all.
drop policy if exists "add submission" on public.submissions;
create policy "add submission" on public.submissions for insert
  with check (user_id = auth.uid() and status = 'pending' and reviewed_at is null);
drop policy if exists "read submissions" on public.submissions;
create policy "read submissions" on public.submissions for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "review submissions" on public.submissions;
create policy "review submissions" on public.submissions for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "delete submissions" on public.submissions;
create policy "delete submissions" on public.submissions for delete using (public.is_admin());

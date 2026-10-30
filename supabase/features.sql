-- Covvvvvers feature update
-- Run once in the Supabase SQL editor, after schema.sql, seed.sql and storage.sql.
-- Safe to run again.

-- Drafts: covers start as drafts in the admin editor and go live when published.
alter table public.covers add column if not exists status text not null default 'published';
alter table public.covers drop constraint if exists covers_status_check;
alter table public.covers add constraint covers_status_check check (status in ('draft', 'published'));
alter table public.covers alter column image_url set default '';
alter table public.covers add column if not exists pull_quote text;
alter table public.covers add column if not exists updated_at timestamptz not null default now();

-- Drafts are only visible to admins.
drop policy if exists "read covers" on public.covers;
create policy "read covers" on public.covers for select using (status = 'published' or public.is_admin());

-- Collections were removed from the site; clear them if an earlier version created them.
drop table if exists public.collection_covers;
drop table if exists public.collections;

-- Profiles and saved covers are private to each member (an earlier version had public profiles).
drop policy if exists "read profiles" on public.profiles;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());

-- Saved covers are private to each member.
drop policy if exists "own favorites" on public.favorites;
drop policy if exists "read favorites" on public.favorites;
drop policy if exists "add favorites" on public.favorites;
drop policy if exists "remove favorites" on public.favorites;
create policy "own favorites" on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Member lists --------------------------------------------------------------

create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  description text check (char_length(description) <= 500),
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lists_user_idx on public.lists (user_id, updated_at desc);

create table if not exists public.list_items (
  list_id uuid not null references public.lists (id) on delete cascade,
  cover_id uuid not null references public.covers (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (list_id, cover_id)
);

alter table public.lists enable row level security;
alter table public.list_items enable row level security;

drop policy if exists "read lists" on public.lists;
create policy "read lists" on public.lists for select using (is_public or user_id = auth.uid());
drop policy if exists "own lists" on public.lists;
create policy "own lists" on public.lists for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "read list items" on public.list_items;
create policy "read list items" on public.list_items for select using (
  exists (select 1 from public.lists l where l.id = list_items.list_id and (l.is_public or l.user_id = auth.uid()))
);
drop policy if exists "own list items" on public.list_items;
create policy "own list items" on public.list_items for all
  using (exists (select 1 from public.lists l where l.id = list_items.list_id and l.user_id = auth.uid()))
  with check (exists (select 1 from public.lists l where l.id = list_items.list_id and l.user_id = auth.uid()));

-- Cover art ratings (the art only, 1 to 5) -----------------------------------

create table if not exists public.ratings (
  user_id uuid not null references auth.users (id) on delete cascade,
  cover_id uuid not null references public.covers (id) on delete cascade,
  score int not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (user_id, cover_id)
);

alter table public.ratings enable row level security;
drop policy if exists "own ratings" on public.ratings;
create policy "own ratings" on public.ratings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Averages are public; individual ratings stay private.
create or replace function public.cover_rating(p_cover uuid)
returns table (average numeric, votes int)
language sql
stable
security definer set search_path = public
as $$
  select round(avg(score)::numeric, 1), count(*)::int from public.ratings where cover_id = p_cover;
$$;

-- How many people saved each cover, used only to sort by "Most saved".
create or replace function public.cover_save_counts()
returns table (cover_id uuid, saves int)
language sql
stable
security definer set search_path = public
as $$
  select cover_id, count(*)::int from public.favorites group by cover_id;
$$;

-- Feedback ------------------------------------------------------------------

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text check (char_length(email) <= 200),
  topic text not null default 'general' check (topic in ('general', 'idea', 'problem', 'correction')),
  message text not null check (char_length(message) between 1 and 3000),
  page text check (char_length(page) <= 300),
  status text not null default 'new' check (status in ('new', 'done')),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;
drop policy if exists "send feedback" on public.feedback;
create policy "send feedback" on public.feedback for insert
  with check (status = 'new' and (user_id is null or user_id = auth.uid()));
drop policy if exists "admin feedback" on public.feedback;
create policy "admin feedback" on public.feedback for all using (public.is_admin()) with check (public.is_admin());

-- Weekly email --------------------------------------------------------------

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 200),
  token uuid not null default gen_random_uuid(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists subscribers_email_key on public.subscribers (lower(email));
alter table public.subscribers enable row level security;
drop policy if exists "admin subscribers" on public.subscribers;
create policy "admin subscribers" on public.subscribers for all using (public.is_admin()) with check (public.is_admin());

-- Sign-up and unsubscribe go through these functions so nobody can read the list.
create or replace function public.subscribe(p_email text)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  if p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' or char_length(p_email) > 200 then
    raise exception 'invalid email';
  end if;
  insert into public.subscribers (email) values (lower(trim(p_email)))
  on conflict ((lower(email))) do update set unsubscribed_at = null;
end;
$$;

create or replace function public.unsubscribe(p_token uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  update public.subscribers set unsubscribed_at = now() where token = p_token and unsubscribed_at is null;
  return found;
end;
$$;

grant execute on function public.subscribe(text) to anon, authenticated;
grant execute on function public.unsubscribe(uuid) to anon, authenticated;
grant execute on function public.cover_rating(uuid) to anon, authenticated;
grant execute on function public.cover_save_counts() to anon, authenticated;

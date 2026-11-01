-- Account: profile picture, newsletter setting and deleting your own account.
-- Run once in the Supabase SQL editor, after schema.sql and features.sql. Safe to run again.

-- A cover from the collection as your profile picture.
alter table public.profiles add column if not exists avatar_cover_id uuid references public.covers (id) on delete set null;

-- Every account has a profile row (older accounts may predate the sign-up trigger).
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- Members can create their own profile row if it's missing, never as an admin.
drop policy if exists "create own profile" on public.profiles;
create policy "create own profile" on public.profiles for insert with check (id = auth.uid() and is_admin = false);

-- Newsletter, for the signed-in member's own email address.
create or replace function public.my_newsletter()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.subscribers s
    where lower(s.email) = lower((select email from auth.users where id = auth.uid()))
      and s.unsubscribed_at is null
  );
$$;

create or replace function public.set_my_newsletter(p_on boolean)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  v_email text := (select email from auth.users where id = auth.uid());
begin
  if v_email is null then
    raise exception 'not signed in';
  end if;
  if p_on then
    insert into public.subscribers (email) values (lower(v_email))
    on conflict ((lower(email))) do update set unsubscribed_at = null;
  else
    update public.subscribers set unsubscribed_at = now()
    where lower(email) = lower(v_email) and unsubscribed_at is null;
  end if;
  return p_on;
end;
$$;

-- Deletes the signed-in member's account. Bookmarks, lists and submissions go with it
-- (their tables cascade from auth.users); feedback they sent stays, without their name.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer set search_path = public, auth
as $$
declare
  v_id uuid := auth.uid();
  v_email text := (select email from auth.users where id = auth.uid());
begin
  if v_id is null then
    raise exception 'not signed in';
  end if;
  if exists (select 1 from public.profiles where id = v_id and is_admin) then
    raise exception 'admins can''t delete their account here';
  end if;
  delete from public.subscribers where lower(email) = lower(v_email);
  delete from auth.users where id = v_id;
end;
$$;

revoke all on function public.my_newsletter() from public, anon;
revoke all on function public.set_my_newsletter(boolean) from public, anon;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.my_newsletter() to authenticated;
grant execute on function public.set_my_newsletter(boolean) to authenticated;
grant execute on function public.delete_my_account() to authenticated;

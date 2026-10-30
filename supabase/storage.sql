-- Storage for cover art
-- Run this once in the Supabase SQL editor (after schema.sql).
-- Creates a public "covers" bucket that anyone can view and only admins can change.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('covers', 'covers', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true;

drop policy if exists "covers are public" on storage.objects;
create policy "covers are public" on storage.objects
  for select using (bucket_id = 'covers');

drop policy if exists "admins add covers" on storage.objects;
create policy "admins add covers" on storage.objects
  for insert to authenticated with check (bucket_id = 'covers' and public.is_admin());

drop policy if exists "admins change covers" on storage.objects;
create policy "admins change covers" on storage.objects
  for update to authenticated using (bucket_id = 'covers' and public.is_admin())
  with check (bucket_id = 'covers' and public.is_admin());

drop policy if exists "admins remove covers" on storage.objects;
create policy "admins remove covers" on storage.objects
  for delete to authenticated using (bucket_id = 'covers' and public.is_admin());

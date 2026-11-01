-- Keep the collection to American albums only.
-- Run in the Supabase SQL editor. Look at step 1's list before running step 2.

-- 1. The covers that will be deleted (anything whose country isn't the United States).
select slug, title, artist, country
from public.covers
where coalesce(country, '') not in ('United States', 'USA', 'US', 'United States of America')
order by country, artist;

-- 2. Delete them. Their credits links, bookmarks, list entries and ratings go with them
--    (those tables cascade from covers). Covers with no country set are deleted too;
--    add a country to any you want to keep before running this.
begin;
delete from public.covers
where coalesce(country, '') not in ('United States', 'USA', 'US', 'United States of America');

-- Creators who no longer have any cover.
delete from public.creators c
where not exists (select 1 from public.cover_creators cc where cc.creator_id = c.id);
commit;

-- 3. Check: every remaining cover is American.
select country, count(*) from public.covers group by country;

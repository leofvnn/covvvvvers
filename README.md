# Covvvvvers

Rap album covers from every era, with the story behind each one and the people who made it.
Built with Next.js, hosted on Vercel, with accounts and the database on Supabase.

Members can sign in with an email link, save covers to their own page, and submit albums for the collection.
Admins review submissions at `/admin`.

## Launch it

### 1. Set up Supabase (about 5 minutes)

1. Create a project at [supabase.com](https://supabase.com). The free plan is enough.
2. Open **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it.
3. Open a new query, paste the contents of `supabase/seed.sql`, and run it. This loads all 177 covers, 224 creators and 13 cover types.
4. Open another query, paste the contents of `supabase/storage.sql`, and run it. This creates the public `covers` bucket for the cover art.
5. Go to **Project Settings > API** (or **API Keys**) and copy the **Project URL** and the **anon / publishable key**.

### 2. Deploy on Vercel

1. At [vercel.com/new](https://vercel.com/new), import this GitHub repository.
2. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`: the Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the anon or publishable key
   - `NEXT_PUBLIC_SITE_URL`: your site's address, for example `https://covvvvvers.vercel.app` (you can fill this in after the first deploy and redeploy)
3. Click **Deploy**.

### 3. Connect sign-in to your address

In Supabase, go to **Authentication > URL Configuration**:

- **Site URL**: your Vercel address
- **Redirect URLs**: add `https://YOUR-ADDRESS/auth/callback` (and `http://localhost:3000/auth/callback` if you run it on your computer)

### 4. Make yourself the admin

Sign in on the live site once, then run this in the Supabase SQL Editor with your email:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

Your account page now has a **Review submissions** button.

### 5. Move the cover art into Supabase

Open `/admin` on the live site and press **Move images to Supabase**. It copies every cover from Wix into the `covers` bucket (a 600px square for the grid and a version up to 2000px for cover pages) and updates the database. Keep the page open until it says all images are stored.

### Optional: Sign in with Google

Turn on the Google provider in **Supabase > Authentication > Providers** (it needs a Google Cloud OAuth client), then add `NEXT_PUBLIC_ENABLE_GOOGLE=true` in Vercel and redeploy.

## How it works

- **Pages are static and refresh every hour.** Edits made in Supabase appear on the site within an hour, or right away if you redeploy.
- **Without Supabase keys** the site still runs from `data/collection.json`, with accounts switched off. That is handy for previews.
- **Cover images** live in the Supabase `covers` bucket as `<slug>.jpg` and `<slug>-600.jpg`. Covers that haven't been moved yet still load from Wix.
- **Security**: row level security means anyone can read the collection, members can only see and change their own favorites and submissions, and only admins can edit covers or review submissions. Nobody can make themselves admin from the site.

## Adding a cover

Upload the art to the `covers` bucket as `<slug>.jpg` plus a 600px square `<slug>-600.jpg`, then add a row to `covers` in the **Table Editor** with the public URL of `<slug>.jpg` as `image_url`, the details, and the essay as `<p>` paragraphs. Link its creators in `cover_creators`.

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in the keys, or leave empty for the offline preview
npm run dev
```

## Database

| Table | Holds |
| --- | --- |
| `covers` | Every album: details, essay, colours, image and streaming links |
| `cover_types` | Childhood photo, Portrait, Painting and the other cover types |
| `creators` | Photographers, painters, designers and art directors |
| `cover_creators` | Which creators made which cover |
| `profiles` | One per account, with the admin switch |
| `favorites` | Covers each member saved |
| `submissions` | Albums members suggested, with their review status |

Free Supabase projects pause after a week with no visits. Open the dashboard to wake one up, or upgrade if the site gets regular traffic.

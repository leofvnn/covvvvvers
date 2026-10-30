export type CoverType = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  hero_image: string | null;
  hero_album: string | null;
  sort_order: number;
  count: number;
};

export type Creator = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
};

export type CreatorWithCount = Creator & { count: number };

export type Cover = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  release_year: number;
  decade: string;
  label: string | null;
  country: string | null;
  type: { slug: string; title: string } | null;
  subgenres: string[];
  credits_text: string | null;
  description_html: string | null;
  color: string | null;
  accent_color: string | null;
  image_url: string;
  image_width: number | null;
  image_height: number | null;
  spotify_album_id: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  youtube_url: string | null;
  featured: boolean;
  creators: Creator[];
};

/** The light version the wall and filters need. */
export type CoverCard = Pick<
  Cover,
  "id" | "slug" | "title" | "artist" | "release_year" | "decade" | "country" | "image_url" | "color" | "type"
> & { creatorNames: string[] };

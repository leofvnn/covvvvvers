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
  pull_quote?: string | null;
  color: string | null;
  accent_color: string | null;
  image_url: string;
  /** Where the image comes from, when it isn't our own copy (Wikipedia, Cover Art Archive…). */
  image_source?: { name: string; url: string } | null;
  image_width: number | null;
  image_height: number | null;
  spotify_album_id: string | null;
  spotify_url: string | null;
  apple_music_url: string | null;
  youtube_url: string | null;
  featured: boolean;
  status?: string;
  /** When the cover joined the collection. */
  created_at?: string;
  creators: Creator[];
  /** Colour group of the main colour, for browsing by colour. */
  family: string | null;
};

/** The light version the grid, filters and search need. */
export type CoverCard = Pick<
  Cover,
  "id" | "slug" | "title" | "artist" | "release_year" | "decade" | "country" | "image_url" | "color" | "type" | "family"
> & {
  creatorNames: string[];
  added?: string;
  /** Lower-case essay text, only sent where search needs it. */
  text?: string;
};

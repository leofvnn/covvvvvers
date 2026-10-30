export type GameItem = {
  id: string;
  slug: string;
  title: string;
  artist: string;
  year: number;
  image: string;
  color: string | null;
};

export type GameInfo = {
  slug: string;
  title: string;
  blurb: string;
  /** What the end screen says when sharing a score. */
  shareText: (score: number, max: number) => string;
};

export const GAMES: GameInfo[] = [
  {
    slug: "guess-the-year",
    title: "Guess the year",
    blurb: "See the cover, slide to the year it came out. The closer you are, the more points.",
    shareText: (s, m) => `I scored ${s} of ${m} guessing the years of rap album covers on Covvvvvers.`,
  },
  {
    slug: "fill-in-the-blank",
    title: "Fill in the blank",
    blurb: "One word is missing from the album title. Pick the right one.",
    shareText: (s, m) => `I filled in ${s} of ${m} rap album titles on Covvvvvers.`,
  },
  {
    slug: "name-the-cover",
    title: "Name the cover",
    blurb: "A small piece of a cover, zoomed right in. Which album is it?",
    shareText: (s, m) => `I named ${s} of ${m} rap albums from a piece of their cover on Covvvvvers.`,
  },
  {
    slug: "which-came-first",
    title: "Which came first?",
    blurb: "Two covers, two years. Tap the one that was released first.",
    shareText: (s, m) => `I got ${s} of ${m} on Which came first? on Covvvvvers.`,
  },
];

export const gameBySlug = (slug: string) => GAMES.find((g) => g.slug === slug);

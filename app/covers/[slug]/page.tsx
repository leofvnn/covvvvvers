import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import SwipeNav from "@/components/SwipeNav";
import { getCover, getCovers } from "@/lib/data";
import { fullImage, inkFor, squareImage } from "@/lib/img";
import type { Creator } from "@/lib/types";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getCovers()).map((c) => ({ slug: c.slug }));
}

type Params = { params: Promise<{ slug: string }> };

function plain(html: string | null) {
  return (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** Turns each creator's name inside the credit line into a link to their page. */
function linkCredits(text: string, creators: Creator[]) {
  const names = [...creators].sort((a, b) => b.name.length - a.name.length);
  if (!names.length) return text;
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${names.map((c) => escape(c.name)).join("|")})`, "g");
  const linked = new Set<string>();
  const parts = text.split(re).map((part, i) => {
    const c = names.find((x) => x.name === part);
    if (!c) return part;
    linked.add(c.id);
    return (
      <Link key={i} href={`/creators/${c.slug}`}>
        {part}
      </Link>
    );
  });
  const rest = creators.filter((c) => !linked.has(c.id));
  return (
    <>
      {parts}
      {rest.map((c) => (
        <span key={c.id}>
          {", "}
          <Link href={`/creators/${c.slug}`}>{c.name}</Link>
        </span>
      ))}
    </>
  );
}

const pageColor = (hex: string | null) => (hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#ffffff");

/** Tints the phone's browser bar with the cover's colour. */
export async function generateViewport({ params }: Params): Promise<Viewport> {
  const found = await getCover((await params).slug);
  return { themeColor: pageColor(found?.cover.color ?? null) };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await getCover((await params).slug);
  if (!found) return {};
  const { cover } = found;
  const text = plain(cover.description_html);
  const description = text.length > 160 ? text.slice(0, 157).replace(/\s\S*$/, "") + "..." : text;
  return {
    title: `${cover.title} by ${cover.artist}`,
    description,
    openGraph: { images: [{ url: squareImage(cover.image_url, 1200), width: 1200, height: 1200 }] },
    twitter: { card: "summary_large_image" },
  };
}

export default async function CoverPage({ params }: Params) {
  const found = await getCover((await params).slug);
  if (!found) notFound();
  const { cover, newer, older } = found;
  const bg = pageColor(cover.color);
  const ink = inkFor(bg);

  const facts: [string, React.ReactNode][] = [
    ["Label", cover.label],
    ["Country", cover.country],
    ["Cover type", cover.type && <Link href={`/types/${cover.type.slug}`}>{cover.type.title}</Link>],
    ["Style", cover.subgenres.join(", ")],
  ];

  const listen = [
    ["Spotify", cover.spotify_url],
    ["Apple Music", cover.apple_music_url],
    ["YouTube", cover.youtube_url],
  ].filter(([, url]) => url) as [string, string][];

  return (
    <article
      className="cover-page"
      style={{ "--bg": bg, "--ink": ink } as React.CSSProperties}
    >
      {/* Hands the cover's colour to the header and footer while this page is open. */}
      <style>{`:root{--page-bg:${bg};--page-ink:${ink}}`}</style>
      <div className="cover-art">
        <img
          src={fullImage(cover.image_url, 1400)}
          alt={`${cover.title} by ${cover.artist}, album cover`}
          width={cover.image_width ?? 1400}
          height={cover.image_height ?? 1400}
          style={{ viewTransitionName: "cover-art" }}
          fetchPriority="high"
        />
      </div>

      <div className="cover-body">
        <header className="cover-head">
          <h1 className="cover-title">{cover.title}</h1>
          <p className="cover-artist">
            {cover.artist}, {cover.release_year}
          </p>
        </header>

        {cover.credits_text && <p className="cover-credits">{linkCredits(cover.credits_text, cover.creators)}</p>}

        <div className="cover-actions">
          <FavoriteButton coverId={cover.id} slug={cover.slug} />
        </div>

        {cover.description_html && (
          <div className="essay" dangerouslySetInnerHTML={{ __html: cover.description_html }} />
        )}

        {cover.spotify_album_id && (
          <iframe
            className="player"
            title={`Listen to ${cover.title} on Spotify`}
            src={`https://open.spotify.com/embed/album/${cover.spotify_album_id}`}
            height={352}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        )}

        <dl className="facts">
          {facts
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          {listen.length > 0 && (
            <div>
              <dt>Listen</dt>
              <dd>
                {listen.map(([name, url], i) => (
                  <span key={name}>
                    {i > 0 && ", "}
                    <a href={url} target="_blank" rel="noopener noreferrer">
                      {name}
                    </a>
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>

        <nav className="cover-nav" aria-label="More covers">
          {newer ? (
            <Link href={`/covers/${newer.slug}`} rel="prev">
              <span>Newer</span>
              {newer.title}
            </Link>
          ) : (
            <span />
          )}
          {older && (
            <Link href={`/covers/${older.slug}`} rel="next">
              <span>Older</span>
              {older.title}
            </Link>
          )}
        </nav>
        <p className="swipe-hint">Swipe left or right for the next cover.</p>
      </div>
      <SwipeNav newer={newer ? `/covers/${newer.slug}` : null} older={older ? `/covers/${older.slug}` : null} />
    </article>
  );
}

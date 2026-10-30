import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToList from "@/components/AddToList";
import CoverArt from "@/components/CoverArt";
import CoverGrid from "@/components/CoverGrid";
import FavoriteButton from "@/components/FavoriteButton";
import Palette from "@/components/Palette";
import Rating from "@/components/Rating";
import ReadingProgress from "@/components/ReadingProgress";
import ShareActions from "@/components/ShareActions";
import SwipeNav from "@/components/SwipeNav";
import { getCover, getCovers, getRelated, toCard } from "@/lib/data";
import { fullImage, inkFor, squareImage } from "@/lib/img";
import { pickPullQuote, readingMinutes } from "@/lib/text";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getCovers()).map((c) => ({ slug: c.slug }));
}

type Params = { params: Promise<{ slug: string }> };

function plain(html: string | null) {
  return (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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
    alternates: { canonical: `/covers/${cover.slug}` },
  };
}

/** Puts the pull quote after the first paragraph of the essay. */
function essayParts(html: string) {
  const cut = html.indexOf("</p>");
  if (cut < 0) return [html, ""];
  return [html.slice(0, cut + 4), html.slice(cut + 4)];
}

export default async function CoverPage({ params }: Params) {
  const found = await getCover((await params).slug);
  if (!found) notFound();
  const { cover, newer, older } = found;
  const related = await getRelated(cover);
  const bg = pageColor(cover.color);
  const ink = inkFor(bg);
  const minutes = readingMinutes(cover.description_html);
  const quote = cover.pull_quote ?? pickPullQuote(cover.description_html);
  const [firstPara, restParas] = essayParts(cover.description_html ?? "");

  const listen = [
    ["Spotify", cover.spotify_url],
    ["Apple Music", cover.apple_music_url],
    ["YouTube", cover.youtube_url],
  ].filter(([, url]) => url) as [string, string][];

  const sleeve: [string, React.ReactNode][] = [
    ["Album", cover.title],
    ["Artist", cover.artist],
    ["Released", cover.release_year],
    ["Label", cover.label],
    ["Country", cover.country],
    ["Cover type", cover.type && <Link href={`/types/${cover.type.slug}`}>{cover.type.title}</Link>],
    ["Style", cover.subgenres.join(", ")],
  ];

  return (
    <>
      <article className="cover-page" style={{ "--bg": bg, "--ink": ink } as React.CSSProperties}>
        {/* Hands the cover's colour to the header and footer while this page is open. */}
        <style>{`:root{--page-bg:${bg};--page-ink:${ink}}`}</style>
        <ReadingProgress />

        <div className="cover-art">
          <CoverArt
            src={fullImage(cover.image_url, 1400)}
            zoomSrc={fullImage(cover.image_url, 2400)}
            alt={`${cover.title} by ${cover.artist}, album cover`}
            width={cover.image_width ?? 1400}
            height={cover.image_height ?? 1400}
          />
          <Palette
            src={squareImage(cover.image_url, 120)}
            fallback={[cover.color, cover.accent_color].filter(Boolean) as string[]}
          />
        </div>

        <div className="cover-body">
          <header className="cover-head">
            <h1 className="cover-title">{cover.title}</h1>
            <p className="cover-artist">
              {cover.artist}, {cover.release_year}
            </p>
          </header>

          {cover.credits_text && <p className="cover-credits">{cover.credits_text}</p>}

          <div className="cover-actions">
            <FavoriteButton coverId={cover.id} slug={cover.slug} />
            <AddToList coverId={cover.id} slug={cover.slug} />
          </div>
          <ShareActions title={cover.title} artist={cover.artist} slug={cover.slug} />

          {cover.description_html && (
            <div className="essay-wrap">
              <p className="reading-time">{minutes} min read</p>
              <div className="essay">
                <div dangerouslySetInnerHTML={{ __html: firstPara }} />
                {quote && (
                  <blockquote className="pull-quote">
                    <p>{quote}</p>
                  </blockquote>
                )}
                {restParas && <div dangerouslySetInnerHTML={{ __html: restParas }} />}
              </div>
            </div>
          )}

          <Rating coverId={cover.id} slug={cover.slug} />

          <section className="sleeve-back" aria-labelledby="credits-h">
            <h2 id="credits-h">Credits</h2>
            {cover.creators.length > 0 && (
              <dl className="sleeve-people">
                {cover.creators.map((c) => (
                  <div key={c.id}>
                    <dt>{c.role ?? "Cover"}</dt>
                    <dd>{c.name}</dd>
                  </div>
                ))}
              </dl>
            )}
            <dl className="sleeve-facts">
              {sleeve
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
            <p className="sleeve-mark">Covvvvvers</p>
          </section>

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

      {related.length > 0 && (
        <section className="related" aria-labelledby="related-h">
          <div className="section-head">
            <h2 id="related-h">More like this</h2>
          </div>
          <CoverGrid covers={related.map((c) => toCard(c))} eager={0} />
        </section>
      )}
    </>
  );
}

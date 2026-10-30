"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { gameBySlug, type GameItem } from "@/lib/games";
import { fullImage } from "@/lib/img";

const ROUNDS = 10;
const STOP = new Set(["the", "and", "for", "with", "from", "into", "you", "your", "are", "was", "but", "not", "off", "out", "all", "vol"]);

function shuffle<T>(list: T[]) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Round =
  | { kind: "name"; answer: GameItem; options: GameItem[]; zoom: number; x: number; y: number }
  | { kind: "year"; answer: GameItem }
  | { kind: "blank"; answer: GameItem; before: string; word: string; after: string; options: string[] }
  | { kind: "first"; a: GameItem; b: GameItem };

/** Words in a title that make a fair blank: real words, three letters or more, not filler. */
function blankable(title: string) {
  return title
    .split(/\s+/)
    .map((w, i) => ({ w, i, core: w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "") }))
    .filter((x) => x.core.length >= 3 && /^\p{L}+$/u.test(x.core) && !STOP.has(x.core.toLowerCase()));
}

function makeRounds(game: string, pool: GameItem[]): Round[] {
  const picks = shuffle(pool);
  if (game === "name-the-cover") {
    return picks.slice(0, ROUNDS).map((answer, i) => ({
      kind: "name",
      answer,
      options: shuffle([answer, ...shuffle(pool.filter((p) => p.id !== answer.id)).slice(0, 3)]),
      // The crop tightens as you go.
      zoom: 3 + i * 0.25,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
    }));
  }
  if (game === "guess-the-year") {
    return picks.slice(0, ROUNDS).map((answer) => ({ kind: "year", answer }));
  }
  if (game === "fill-in-the-blank") {
    const allWords = [...new Set(pool.flatMap((p) => blankable(p.title).map((b) => b.core)))];
    const usable = picks.filter((p) => p.title.split(/\s+/).length >= 2 && blankable(p.title).length > 0);
    return usable.slice(0, ROUNDS).map((answer) => {
      const words = answer.title.split(/\s+/);
      const choice = shuffle(blankable(answer.title))[0];
      const raw = words[choice.i];
      const lead = raw.slice(0, raw.indexOf(choice.core));
      const trail = raw.slice(raw.indexOf(choice.core) + choice.core.length);
      const before = words.slice(0, choice.i).join(" ") + (choice.i > 0 ? " " : "") + lead;
      const after = trail + (choice.i < words.length - 1 ? " " + words.slice(choice.i + 1).join(" ") : "");
      // Wrong answers: words of a similar length from other titles, capitalised the same way.
      const upper = /^\p{Lu}/u.test(choice.core);
      const fit = (w: string) => (upper ? w[0].toUpperCase() + w.slice(1) : w[0].toLowerCase() + w.slice(1));
      const wrong = shuffle(
        [...new Set(
          allWords
            .filter((w) => w.toLowerCase() !== choice.core.toLowerCase() && Math.abs(w.length - choice.core.length) <= 3)
            .map(fit),
        )],
      ).slice(0, 3);
      return { kind: "blank", answer, before, word: choice.core, after, options: shuffle([choice.core, ...wrong]) };
    });
  }
  // Which came first: two covers from different years.
  const rounds: Round[] = [];
  const left = [...picks];
  while (rounds.length < ROUNDS && left.length > 1) {
    const a = left.shift()!;
    const j = left.findIndex((b) => b.year !== a.year);
    if (j < 0) break;
    const [b] = left.splice(j, 1);
    rounds.push({ kind: "first", a, b });
  }
  return rounds;
}

const pointsForYear = (diff: number) => Math.max(0, 100 - diff * 20);

export default function Game({ game, pool, minYear, maxYear }: { game: string; pool: GameItem[]; minYear: number; maxYear: number }) {
  const info = gameBySlug(game)!;
  const [rounds, setRounds] = useState<Round[]>([]);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<{ points: number; text: string; pick?: string } | null>(null);
  const [year, setYear] = useState(Math.round((minYear + maxYear) / 2));
  const [copied, setCopied] = useState(false);

  const perRound = game === "guess-the-year" ? 100 : 1;
  const max = rounds.length * perRound;

  const start = useCallback(() => {
    setRounds(makeRounds(game, pool));
    setI(0);
    setScore(0);
    setAnswer(null);
    setYear(Math.round((minYear + maxYear) / 2));
  }, [game, pool, minYear, maxYear]);

  useEffect(() => start(), [start]);

  const finish = (points: number, text: string, pick?: string) => {
    setAnswer({ points, text, pick });
    setScore((s) => s + points);
    if (points > 0) navigator.vibrate?.(10);
  };

  const next = () => {
    setAnswer(null);
    setYear(Math.round((minYear + maxYear) / 2));
    setI(i + 1);
  };

  const reviewItems = useMemo(
    () => rounds.flatMap((r) => (r.kind === "first" ? [r.a, r.b] : [r.answer])),
    [rounds],
  );

  if (!rounds.length) return <div className="quiz" />;

  if (i >= rounds.length) {
    const share = async () => {
      const text = info.shareText(score, max);
      const url = `${window.location.origin}/games/${game}`;
      if (navigator.share) {
        try {
          await navigator.share({ text, url });
        } catch {}
        return;
      }
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setCopied(true);
      } catch {}
    };
    const ratio = score / max;
    return (
      <div className="quiz quiz-end">
        <p className="quiz-score">
          {score} / {max}
        </p>
        <p>
          {ratio === 1
            ? "Perfect. You know your covers."
            : ratio >= 0.7
              ? "Strong. A few got past you."
              : ratio >= 0.4
                ? "Not bad. The stories behind these covers might help."
                : "Tough one. Browse the covers and try again."}
        </p>
        <div className="intro-actions">
          <button type="button" className="button solid" onClick={start}>
            Play again
          </button>
          <button type="button" className="button" onClick={share}>
            {copied ? "Copied" : "Share your score"}
          </button>
          <Link className="button" href="/games">
            Other games
          </Link>
        </div>
        <ul className="quiz-review">
          {reviewItems.map((c) => (
            <li key={c.id}>
              <Link href={`/covers/${c.slug}`}>
                <img src={fullImage(c.image, 160)} alt="" width={56} height={56} />
                <span>
                  <strong>{c.title}</strong>
                  <span>
                    {c.artist}, {c.year}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const r = rounds[i];
  const done = answer !== null;

  return (
    <div className={`quiz quiz-${r.kind}`}>
      <div className="quiz-top">
        <span>
          Round {i + 1} of {rounds.length}
        </span>
        <span>Score {score}</span>
      </div>

      {r.kind === "name" && (
        <>
          <div className="quiz-frame" style={{ backgroundColor: r.answer.color ?? "#eee" }}>
            <img
              src={fullImage(r.answer.image, 1200)}
              alt={done ? `${r.answer.title} by ${r.answer.artist}` : "A cropped piece of an album cover"}
              draggable={false}
              style={{ transformOrigin: `${r.x}% ${r.y}%`, transform: done ? "scale(1)" : `scale(${r.zoom})` }}
            />
          </div>
          <ul className="quiz-options">
            {r.options.map((o) => {
              const state = !done ? "" : o.id === r.answer.id ? "right" : o.id === answer.pick ? "wrong" : "";
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    data-state={state || undefined}
                    disabled={done && !state}
                    onClick={() =>
                      !done &&
                      finish(
                        o.id === r.answer.id ? 1 : 0,
                        o.id === r.answer.id ? "Right." : `It's ${r.answer.title} by ${r.answer.artist}, ${r.answer.year}.`,
                        o.id,
                      )
                    }
                  >
                    <strong>{o.title}</strong>
                    <span>{o.artist}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {r.kind === "year" && (
        <>
          <div className="quiz-frame" style={{ backgroundColor: r.answer.color ?? "#eee" }}>
            <img src={fullImage(r.answer.image, 1200)} alt={`${r.answer.title} by ${r.answer.artist}`} draggable={false} />
          </div>
          <div className="year-guess">
            <p className="year-album">
              <strong>{r.answer.title}</strong>
              <span>{r.answer.artist}</span>
            </p>
            <label className="year-value" htmlFor="year-input">
              {done ? r.answer.year : year}
            </label>
            <input
              id="year-input"
              type="range"
              min={minYear}
              max={maxYear}
              value={year}
              disabled={done}
              onChange={(e) => setYear(Number(e.target.value))}
            />
            <div className="year-ends">
              <span>{minYear}</span>
              <span>{maxYear}</span>
            </div>
            {!done && (
              <button
                type="button"
                className="button solid"
                onClick={() => {
                  const diff = Math.abs(year - r.answer.year);
                  const pts = pointsForYear(diff);
                  finish(
                    pts,
                    diff === 0
                      ? "Exactly right. 100 points."
                      : `Released in ${r.answer.year}. You guessed ${year}, ${diff} ${diff === 1 ? "year" : "years"} off: ${pts} points.`,
                  );
                }}
              >
                Lock in {year}
              </button>
            )}
          </div>
        </>
      )}

      {r.kind === "blank" && (
        <>
          <div className="quiz-frame blurred" style={{ backgroundColor: r.answer.color ?? "#eee" }}>
            <img src={fullImage(r.answer.image, 800)} alt="" draggable={false} data-revealed={done || undefined} />
          </div>
          <div className="blank-title">
            <p className="blank-line">
              {r.before}
              <span className="blank-slot" data-state={done ? (answer.points ? "right" : "wrong") : undefined}>
                {done ? r.word : "   "}
              </span>
              {r.after}
            </p>
            <p className="blank-artist">
              {r.answer.artist}, {r.answer.year}
            </p>
          </div>
          <ul className="quiz-options">
            {r.options.map((w) => {
              const state = !done ? "" : w === r.word ? "right" : w === answer.pick ? "wrong" : "";
              return (
                <li key={w}>
                  <button
                    type="button"
                    data-state={state || undefined}
                    disabled={done && !state}
                    onClick={() =>
                      !done && finish(w === r.word ? 1 : 0, w === r.word ? "Right." : `The word was ${r.word}.`, w)
                    }
                  >
                    <strong>{w}</strong>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {r.kind === "first" && (
        <ul className="first-pair">
          {[r.a, r.b].map((c) => {
            const older = r.a.year < r.b.year ? r.a : r.b;
            const state = !done ? "" : c.id === older.id ? "right" : c.id === answer.pick ? "wrong" : "";
            return (
              <li key={c.id}>
                <button
                  type="button"
                  data-state={state || undefined}
                  disabled={done}
                  onClick={() =>
                    finish(
                      c.id === older.id ? 1 : 0,
                      c.id === older.id
                        ? `Right. ${older.title} came out in ${older.year}.`
                        : `${older.title} came first, in ${older.year}.`,
                      c.id,
                    )
                  }
                >
                  <span className="first-art" style={{ backgroundColor: c.color ?? "#eee" }}>
                    <img src={fullImage(c.image, 700)} alt="" draggable={false} />
                  </span>
                  <strong>{c.title}</strong>
                  <span>
                    {c.artist}
                    {done && `, ${c.year}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <p className="quiz-feedback" aria-live="polite">
        {answer?.text}
      </p>
      {done && (
        <button type="button" className="button solid quiz-next" onClick={next}>
          {i + 1 === rounds.length ? "See your score" : "Next round"}
        </button>
      )}
    </div>
  );
}

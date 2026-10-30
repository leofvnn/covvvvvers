"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fullImage } from "@/lib/img";

type Item = { id: string; slug: string; title: string; artist: string; year: number; image: string; color: string | null };
type Round = { answer: Item; options: Item[]; zoom: number; x: number; y: number };

const ROUNDS = 10;

function shuffle<T>(list: T[]) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeRounds(pool: Item[]): Round[] {
  return shuffle(pool)
    .slice(0, ROUNDS)
    .map((answer, i) => {
      const others = shuffle(pool.filter((p) => p.id !== answer.id)).slice(0, 3);
      // Rounds get a little harder: the crop tightens as you go.
      const zoom = 3 + i * 0.25;
      return { answer, options: shuffle([answer, ...others]), zoom, x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 };
    });
}

export default function Quiz({ pool }: { pool: Item[] }) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [copied, setCopied] = useState(false);

  const start = useCallback(() => {
    setRounds(makeRounds(pool));
    setI(0);
    setPicked(null);
    setScore(0);
  }, [pool]);

  useEffect(() => start(), [start]);

  if (!rounds.length) return <div className="quiz" />;

  if (i >= rounds.length) {
    const share = async () => {
      const text = `I named ${score} of ${ROUNDS} rap albums from a piece of their cover on Covvvvvers.`;
      const url = `${window.location.origin}/quiz`;
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
    return (
      <div className="quiz quiz-end">
        <p className="quiz-score">
          {score} / {ROUNDS}
        </p>
        <p>
          {score === ROUNDS
            ? "Perfect. You know your covers."
            : score >= 7
              ? "Strong eye. A few got past you."
              : score >= 4
                ? "Not bad. The stories behind these covers might help."
                : "Tough round. Browse the covers and try again."}
        </p>
        <div className="intro-actions">
          <button type="button" className="button solid" onClick={start}>
            Play again
          </button>
          <button type="button" className="button" onClick={share}>
            {copied ? "Copied" : "Share your score"}
          </button>
        </div>
        <ul className="quiz-review">
          {rounds.map((r) => (
            <li key={r.answer.id}>
              <Link href={`/covers/${r.answer.slug}`}>
                <img src={fullImage(r.answer.image, 160)} alt="" width={56} height={56} />
                <span>
                  <strong>{r.answer.title}</strong>
                  <span>{r.answer.artist}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const r = rounds[i];
  const answered = picked !== null;
  const choose = (id: string) => {
    if (answered) return;
    setPicked(id);
    if (id === r.answer.id) {
      setScore((s) => s + 1);
      navigator.vibrate?.(10);
    }
  };

  return (
    <div className="quiz">
      <div className="quiz-top">
        <span>
          Round {i + 1} of {ROUNDS}
        </span>
        <span>Score {score}</span>
      </div>
      <div className="quiz-frame" style={{ backgroundColor: r.answer.color ?? "#eee" }}>
        <img
          src={fullImage(r.answer.image, 1200)}
          alt={answered ? `${r.answer.title} by ${r.answer.artist}` : "A cropped piece of an album cover"}
          draggable={false}
          style={{
            transformOrigin: `${r.x}% ${r.y}%`,
            transform: answered ? "scale(1)" : `scale(${r.zoom})`,
          }}
        />
      </div>
      <ul className="quiz-options">
        {r.options.map((o) => {
          const state = !answered ? "" : o.id === r.answer.id ? "right" : o.id === picked ? "wrong" : "";
          return (
            <li key={o.id}>
              <button type="button" onClick={() => choose(o.id)} data-state={state || undefined} disabled={answered && !state}>
                <strong>{o.title}</strong>
                <span>{o.artist}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="quiz-feedback" aria-live="polite">
        {answered && (picked === r.answer.id ? "Right." : `It's ${r.answer.title} by ${r.answer.artist}, ${r.answer.year}.`)}
      </p>
      {answered && (
        <button
          type="button"
          className="button solid quiz-next"
          onClick={() => {
            setPicked(null);
            setI(i + 1);
          }}
        >
          {i + 1 === ROUNDS ? "See your score" : "Next round"}
        </button>
      )}
    </div>
  );
}

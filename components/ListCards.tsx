import Link from "next/link";
import { squareImage } from "@/lib/img";
import type { Cover } from "@/lib/types";

type L = { id: string; title: string; is_public: boolean; covers: Cover[]; href?: string; note?: string };

/** Lists shown as small stacks of their first covers. */
export default function ListCards({ lists, showPrivacy }: { lists: L[]; showPrivacy?: boolean }) {
  return (
    <ul className="collection-list compact">
      {lists.map((l) => (
        <li key={l.id}>
          <Link href={l.href ?? `/lists/${l.id}`} className="collection-card">
            <span className="collection-stack" aria-hidden="true">
              {l.covers.slice(0, 4).map((c, i) => (
                <img
                  key={c.id}
                  src={squareImage(c.image_url, 240)}
                  alt=""
                  width={120}
                  height={120}
                  loading="lazy"
                  style={{ "--i": i } as React.CSSProperties}
                />
              ))}
              {l.covers.length === 0 && <span className="stack-empty" />}
            </span>
            <span className="collection-text">
              <span className="collection-title">{l.title}</span>
              <span className="collection-count">
                {l.covers.length} {l.covers.length === 1 ? "cover" : "covers"}
                {showPrivacy && !l.is_public && ", only you can see it"}
                {l.note && `, ${l.note}`}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { inkFor, squareImage } from "./img";
import type { Cover } from "./types";

async function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [regular, bold] = await Promise.all([
    readFile(join(dir, "archivo-latin-400-normal.woff")),
    readFile(join(dir, "archivo-latin-800-normal.woff")),
  ]);
  return [
    { name: "Archivo", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Archivo", data: bold, weight: 800 as const, style: "normal" as const },
  ];
}

const pageColor = (hex: string | null) => (hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#111111");

/** The link preview: the cover on its own colour, with the title and the Covvvvvers mark. */
export async function coverCard(cover: Cover) {
  const bg = pageColor(cover.color);
  const ink = inkFor(bg);
  const titleSize = cover.title.length > 28 ? 52 : cover.title.length > 16 ? 64 : 80;
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: bg, color: ink, padding: 56, fontFamily: "Archivo" }}>
        <img
          src={squareImage(cover.image_url, 1040)}
          width={518}
          height={518}
          style={{ boxShadow: "0 30px 60px -30px rgba(0,0,0,0.6)" }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", marginLeft: 56, flex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>Covvvvvers</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1, letterSpacing: -1.5 }}>{cover.title}</div>
            <div style={{ fontSize: 32, marginTop: 18 }}>
              {cover.artist}, {cover.release_year}
            </div>
            {cover.creators[0] && (
              <div style={{ fontSize: 24, marginTop: 14, opacity: 0.75 }}>
                Cover by {cover.creators.map((c) => c.name).slice(0, 2).join(" and ")}
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await fonts() },
  );
}

/** A 1080 by 1350 portrait image for Instagram posts. */
export async function coverStory(cover: Cover) {
  const bg = pageColor(cover.color);
  const ink = inkFor(bg);
  const titleSize = cover.title.length > 28 ? 56 : cover.title.length > 16 ? 72 : 92;
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", background: bg, color: ink, padding: 72, fontFamily: "Archivo" }}>
        <img
          src={squareImage(cover.image_url, 1872)}
          width={936}
          height={936}
          style={{ boxShadow: "0 40px 80px -40px rgba(0,0,0,0.6)" }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "flex-end" }}>
          <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1, letterSpacing: -2 }}>{cover.title}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 30 }}>
              <div>
                {cover.artist}, {cover.release_year}
              </div>
              {cover.creators[0] && (
                <div style={{ fontSize: 24, opacity: 0.75, marginTop: 6 }}>
                  Cover by {cover.creators.map((c) => c.name).slice(0, 2).join(" and ")}
                </div>
              )}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5 }}>Covvvvvers</div>
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: await fonts() },
  );
}

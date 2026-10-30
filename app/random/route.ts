import { NextResponse, type NextRequest } from "next/server";
import { getCovers } from "@/lib/data";

export const dynamic = "force-dynamic";

/** Sends the visitor to a random cover. With ?format=json it returns the address instead. */
export async function GET(request: NextRequest) {
  const covers = await getCovers();
  const skip = request.nextUrl.searchParams.get("not");
  const pool = covers.filter((c) => c.slug !== skip);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  const href = `/covers/${pick.slug}`;
  if (request.nextUrl.searchParams.get("format") === "json") {
    return NextResponse.json({ href }, { headers: { "Cache-Control": "no-store" } });
  }
  return NextResponse.redirect(new URL(href, request.url), { status: 307, headers: { "Cache-Control": "no-store" } });
}

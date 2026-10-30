import { getCover } from "@/lib/data";
import { coverStory } from "@/lib/og";

export const revalidate = 86400;

/** A portrait image of the cover, sized for an Instagram post, served as a download. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await getCover(slug);
  if (!found) return new Response("Not found", { status: 404 });
  const image = await coverStory(found.cover);
  const headers = new Headers(image.headers);
  headers.set("Content-Disposition", `attachment; filename="${slug}-covvvvvers.png"`);
  return new Response(image.body, { status: 200, headers });
}

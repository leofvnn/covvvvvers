import { getCover } from "@/lib/data";
import { coverCard } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Album cover on Covvvvvers";
export const revalidate = 86400;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const found = await getCover((await params).slug);
  if (!found) return new Response("Not found", { status: 404 });
  return coverCard(found.cover);
}

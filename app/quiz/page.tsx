import type { Metadata } from "next";
import Quiz from "@/components/Quiz";
import { getCovers } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Quiz",
  description: "Name the rap album from a small piece of its cover.",
};

export default async function QuizPage() {
  const covers = await getCovers();
  // Well-known, high-resolution covers make fairer questions.
  const pool = covers
    .filter((c) => (c.image_width ?? 0) >= 1000)
    .map((c) => ({ id: c.id, slug: c.slug, title: c.title, artist: c.artist, year: c.release_year, image: c.image_url, color: c.color }));
  return (
    <>
      <header className="page-head">
        <h1>Quiz</h1>
        <p>Ten rounds. Each shows a small piece of a cover; pick the album it comes from.</p>
      </header>
      <Quiz pool={pool} />
    </>
  );
}

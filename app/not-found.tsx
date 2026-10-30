import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel">
      <h1>This page isn't in the crate</h1>
      <p>The address may be mistyped, or the cover may have moved.</p>
      <p>
        <Link className="button solid" href="/">
          Browse all covers
        </Link>
      </p>
    </section>
  );
}

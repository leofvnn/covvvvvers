import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/source-serif-4/standard.css";
import "@fontsource-variable/source-serif-4/standard-italic.css";
import Link from "next/link";
import AccountLink from "@/components/AccountLink";
import { SITE_URL } from "@/lib/supabase/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Album Coverz", template: "%s | Album Coverz" },
  description: "Rap album covers from every era, with the stories behind them and the people who made them.",
  openGraph: { siteName: "Album Coverz", type: "website" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="site-header">
          <Link href="/" className="wordmark" aria-label="Album Coverz home">
            Album Coverz
          </Link>
          <nav aria-label="Main">
            <Link href="/covers">Covers</Link>
            <Link href="/types">Cover types</Link>
            <Link href="/creators">Creators</Link>
            <Link href="/submit">Submit a cover</Link>
            <AccountLink />
          </nav>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <p>
            Album Coverz collects rap album covers that mean something, from the first records of the 1980s to now.
            Cover art belongs to its artists and labels.
          </p>
        </footer>
      </body>
    </html>
  );
}

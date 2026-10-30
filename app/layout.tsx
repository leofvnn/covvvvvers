import type { Metadata, Viewport } from "next";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/source-serif-4/standard.css";
import "@fontsource-variable/source-serif-4/standard-italic.css";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import TransitionDone from "@/components/TransitionDone";
import { SITE_URL } from "@/lib/supabase/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Covvvvvers", template: "%s | Covvvvvers" },
  description: "Rap album covers from every era, with the stories behind them and the people who made them.",
  openGraph: { siteName: "Covvvvvers", type: "website" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <Link href="/" className="footer-mark">
            Covvvvvers
          </Link>
          <p>Rap album covers that mean something, from the 1980s to now. Cover art belongs to its artists and labels.</p>
          <nav aria-label="Footer">
            <Link href="/covers">Covers</Link>
            <Link href="/types">Cover types</Link>
            <Link href="/creators">Creators</Link>
            <Link href="/submit">Submit a cover</Link>
          </nav>
        </footer>
        <TransitionDone />
      </body>
    </html>
  );
}

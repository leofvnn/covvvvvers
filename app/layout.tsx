import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import Script from "next/script";
import NavTransitions from "@/components/NavTransitions";
import NewsletterForm from "@/components/NewsletterForm";
import SiteHeader from "@/components/SiteHeader";
import ThemeToggle from "@/components/ThemeToggle";
import { themeScript } from "@/lib/theme";
import { SITE_URL } from "@/lib/supabase/config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Covvvvvers", template: "%s | Covvvvvers" },
  description: "Rap album covers from every era, with the stories behind them and the people who made them.",
  openGraph: { siteName: "Covvvvvers", type: "website" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121212" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Bowlby One, from Google Fonts, for headings. Text is set in Helvetica. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bowlby+One&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="footer-top">
            <div className="footer-about">
              <Link href="/" className="footer-mark">
                Covvvvvers
              </Link>
              <p>
                Rap album covers that mean something, from the 1980s to now. Cover art belongs to its artists and
                labels.
              </p>
            </div>
            <NewsletterForm />
          </div>
          <nav aria-label="Footer">
            <Link href="/covers">Covers</Link>
            <Link href="/types">Cover types</Link>
            <Link href="/timeline">Through the Years</Link>
            <Link href="/games">Games</Link>
            <Link href="/submit">Submit a cover</Link>
            <Link href="/feedback">Feedback</Link>
          </nav>
          <div className="footer-bottom">
            <ThemeToggle />
            <p className="footer-keys">
              Press <kbd>?</kbd> for keyboard shortcuts
            </p>
          </div>
        </footer>
        <NavTransitions />
        <Analytics />
      </body>
    </html>
  );
}

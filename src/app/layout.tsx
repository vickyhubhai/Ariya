import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { BrandLoader } from "@/components/brand-loader";
import { LegacyServiceWorkerCleanup } from "@/components/legacy-sw-cleanup";
import { OfflineBanner } from "@/components/offline-banner";
import { ScrollToTop } from "@/components/scroll-to-top";
import { ReleaseProvider } from "@/components/release-context";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JsonLd } from "@/components/ui";
import { getLatestRelease } from "@/lib/github";
import { snapshotFromResult } from "@/lib/release-snapshot";
import { absoluteUrl, graph, organizationSchema, softwareApplicationSchema, websiteSchema } from "@/lib/seo";
import { SITE_URL, site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ariya Music Player — Free Open-Source Android Music Player",
    template: "%s · Ariya Music Player",
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.developer, url: site.url }],
  creator: site.developer,
  publisher: site.name,
  category: "music",
  keywords: [
    "Ariya Music Player",
    "Ariya APK",
    "open source Android music player",
    "Android music player with lyrics",
    "FLAC Android player",
    "Ariya download",
    "Ariya GitHub",
  ],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": [{ url: "/feed.xml", title: "Ariya developer news" }],
      "text/plain": [{ url: "/llms.txt", title: "Ariya summary for language models" }],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: SITE_URL,
    siteName: site.name,
    title: "Ariya Music Player — Music Beyond Limits",
    description: site.description,
    images: [{ url: absoluteUrl(site.ogImage), width: 900, height: 900, alt: site.ogImageAlt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ariya Music Player — Music Beyond Limits",
    description: site.description,
    images: [absoluteUrl(site.ogImage)],
  },
  icons: {
    icon: [
      { url: "/assets/ariya-logo-64.png", sizes: "64x64", type: "image/png" },
      { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/assets/ariya-logo-240.png", sizes: "240x240" }],
    shortcut: "/assets/ariya-logo-64.png",
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: "#0a0a13",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const latest = await getLatestRelease();
  const snapshot = snapshotFromResult(latest);
  const schema = graph([
    organizationSchema(),
    websiteSchema(),
    softwareApplicationSchema(snapshot.release),
  ]);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[#05050a] antialiased">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <JsonLd data={schema} />
        <BrandLoader />
        <LegacyServiceWorkerCleanup />
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
        <ReleaseProvider initial={snapshot}>
          <SiteHeader />
          <OfflineBanner />
          <main id="main">{children}</main>
          <SiteFooter />
          <ScrollToTop />
        </ReleaseProvider>
      </body>
    </html>
  );
}

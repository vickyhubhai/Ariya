import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { BrandLoader } from "@/components/brand-loader";
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

/**
 * One-time cleanup for service-worker registrations left behind by the
 * previous Ariya deployment. Its `public/sw.js` served `/_next/static/*`
 * cache-first, so browsers that visited the old site still hydrate fresh
 * server HTML with stale JS chunks (the React hydration mismatch) and get a
 * 404 on the automatic `/sw.js` update check.
 *
 * This runs from the server-rendered HTML on purpose: a fix shipped as an app
 * chunk can itself be served stale by the worker it is meant to remove. It
 * unregisters the worker, drops its caches, and reloads the tab once. It is a
 * no-op for browsers without a registration, so it is safe to keep.
 */
const legacyServiceWorkerCleanup = `
(function () {
  if (!("serviceWorker" in navigator)) return;
  var controlled = !!navigator.serviceWorker.controller;
  var KEY = "ariya:legacy-sw-purged";
  var alreadyPurged = false;
  try {
    alreadyPurged = window.sessionStorage.getItem(KEY) === "1";
  } catch (e) {}
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    if (!registrations || registrations.length === 0) return;
    var cleanup = registrations.map(function (registration) {
      return registration.unregister();
    });
    if ("caches" in window) {
      cleanup.push(
        window.caches.keys().then(function (names) {
          return Promise.all(
            names.map(function (name) { return window.caches.delete(name); })
          );
        })
      );
    }
    Promise.all(cleanup).then(function () {
      if (alreadyPurged || !controlled) return;
      try {
        window.sessionStorage.setItem(KEY, "1");
      } catch (e) {
        return;
      }
      window.location.reload();
    });
  }).catch(function () {});
})();
`;

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
      { url: "/assets/ariya-logo-16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/ariya-logo-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/ariya-logo-64.png", sizes: "64x64", type: "image/png" },
      { url: "/assets/ariya-logo-160.png", sizes: "160x160", type: "image/png" },
      { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/assets/ariya-logo-180.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/assets/ariya-logo-32.png",
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
        <script dangerouslySetInnerHTML={{ __html: legacyServiceWorkerCleanup }} />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <JsonLd data={schema} />
        <BrandLoader />
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

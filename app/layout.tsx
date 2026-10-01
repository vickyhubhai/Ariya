import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { siteConfig } from '@/lib/config';
import { ReleaseProvider } from '@/lib/release-context';
import Loader from '@/components/Loader';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Toast from '@/components/Toast';
import ScrollProgress from '@/components/ScrollProgress';
import ServiceWorker from '@/components/ServiceWorker';
import './globals.css';

const shareImage = {
  url: siteConfig.logo,
  width: 512,
  height: 512,
  alt: 'Ariya app logo',
};

/** Every meta tag from the static <head>, mapped onto Next's metadata API. */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: siteConfig.title,
  description: siteConfig.description,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
    // <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM info">
    types: { 'text/plain': [{ url: '/llms.txt', title: 'LLM info' }] },
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: '/',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [shareImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [shareImage],
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
  },
  icons: {
    icon: [{ url: '/assets/ariya-logo-64.png', type: 'image/png', sizes: '64x64' }],
    apple: [{ url: '/assets/icon-512.png', sizes: '512x512' }],
  },
  other: {
    'google-site-verification': siteConfig.googleSiteVerification,
    'google-adsense-account': siteConfig.googleAdsense.client,
    monetag: siteConfig.monetag.meta,
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: siteConfig.themeColor,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior lets Next disable smooth scrolling on route changes,
    // which otherwise fights the browser jumping to the new page's scroll top.
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Brand loading screen: fixed and self-removing, so it never shifts the layout. */}
        <Loader />
        <ServiceWorker />

        <ReleaseProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <ScrollProgress />
          <Navbar />
          <main id="main">{children}</main>
          <Footer />
          <Toast />
        </ReleaseProvider>

        {/* AdSense loader is a plain async tag (React hoists it to <head>), exactly
            like the original markup: next/script stamps data-nscript on the element
            and AdSense rejects its own loader tag with a console warning. */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${siteConfig.googleAdsense.client}`}
          crossOrigin="anonymous"
        />
        {/* Monetag only ever runs after the page is idle, so it cannot delay the hero. */}
        <Script src={siteConfig.monetag.src} strategy="lazyOnload" data-zone={siteConfig.monetag.zone} data-cfasync="false" />

        {/* Without JS the fixed overlay would trap the visitor. */}
        <noscript>
          <style>{'.page-loader{display:none}'}</style>
        </noscript>
      </body>
    </html>
  );
}

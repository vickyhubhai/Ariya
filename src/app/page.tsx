import type { Metadata } from "next";
import { Suspense } from "react";
import { EntitySummary } from "@/components/sections/entity-summary";
import { FeaturesSection } from "@/components/sections/features";
import { NewsPreview, NewsPreviewSkeleton } from "@/components/sections/news-preview";
import { DownloadSection } from "@/components/sections/download-section";
import { FinalCta } from "@/components/sections/cta";
import { WhatsNewSection } from "@/components/sections/whats-new";
import { FaqSection } from "@/components/faq";
import { Hero } from "@/components/hero";
import { Showcase } from "@/components/showcase";
import { JsonLd } from "@/components/ui";
import { getLatestRelease, getReleases } from "@/lib/github";
import { absoluteUrl, breadcrumbSchema, faqSchema, graph } from "@/lib/seo";
import { SITE_URL, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ariya Music Player — Free Open-Source Android Music Player",
  description:
    "Download Ariya, a free open-source Android music player with synced lyrics, FLAC lossless playback, multiple audio sources, playlists and full queue control. Android 8.0+.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ariya Music Player — Music Beyond Limits",
    description:
      "A calm, lossless-ready Android music player with synced lyrics, full queue control and a dark glass interface. Free and open source.",
    url: SITE_URL,
    images: [{ url: absoluteUrl(site.ogImage), width: 900, height: 900, alt: site.ogImageAlt }],
  },
};

async function WhatsNewData() {
  const [latest, releases] = await Promise.all([getLatestRelease(), getReleases()]);
  return (
    <WhatsNewSection
      release={latest.ok ? latest.data.release : null}
      releases={releases.ok ? releases.data.releases : []}
      error={latest.ok ? null : latest.error}
      stale={latest.ok && latest.stale}
    />
  );
}

function WhatsNewSkeleton() {
  return (
    <section className="section" aria-hidden="true">
      <div className="container-page">
        <span className="skeleton block h-3 w-24" />
        <span className="skeleton mt-4 block h-9 w-2/3 max-w-xl" />
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="glass card-radius p-6">
            <span className="skeleton block h-3 w-24" />
            <span className="skeleton mt-4 block h-7 w-2/3" />
            <span className="skeleton mt-4 block h-40 w-full" />
          </div>
          <div className="glass card-radius p-6">
            <span className="skeleton block h-3 w-28" />
            <span className="skeleton mt-5 block h-32 w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={graph([
          faqSchema(),
          breadcrumbSchema([{ name: "Home", path: "/" }]),
          {
            "@type": "ItemList",
            name: "Ariya interface previews",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home screen" },
              { "@type": "ListItem", position: 2, name: "Now playing screen" },
              { "@type": "ListItem", position: 3, name: "Synced lyrics screen" },
            ],
          },
        ])}
      />
      <Hero />
      <EntitySummary />
      <FeaturesSection />
      <Showcase />
      <Suspense fallback={<WhatsNewSkeleton />}>
        <WhatsNewData />
      </Suspense>
      <Suspense fallback={<NewsPreviewSkeleton />}>
        <NewsPreview />
      </Suspense>
      <DownloadSection />
      <FaqSection />
      <FinalCta />
    </>
  );
}

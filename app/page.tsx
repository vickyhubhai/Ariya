import Hero from '@/components/Hero';
import Features from '@/components/sections/Features';
import WhatsNew from '@/components/sections/WhatsNew';
import DownloadSection from '@/components/sections/DownloadSection';
import Specs from '@/components/sections/Specs';
import Faq from '@/components/sections/Faq';
import Support from '@/components/sections/Support';
import AdSlot from '@/components/AdSlot';
import { buildJsonLdGraph } from '@/lib/seo';

/** Home page: the section order of the original `index.html`, verbatim. */
export default function HomePage() {
  return (
    <>
      {/* React 19 hoists this into <head>: starts the hero logo (LCP candidate)
          decoding in parallel with CSS/JS instead of after hydration. The font
          stack is system-only, so there is no webfont to preload. */}
      <link
        rel="preload"
        as="image"
        imageSrcSet="/assets/ariya-logo-120.webp 120w, /assets/ariya-logo-180.webp 180w, /assets/ariya-logo-240.webp 240w, /assets/ariya-logo-320.webp 320w"
        imageSizes="90px, (min-width: 481px) 120px"
      />
      <Hero />
      <Features />
      <WhatsNew />
      <DownloadSection />
      <Specs />
      <Faq />
      <Support />
      <AdSlot />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLdGraph()) }} />
    </>
  );
}

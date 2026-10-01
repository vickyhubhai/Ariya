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

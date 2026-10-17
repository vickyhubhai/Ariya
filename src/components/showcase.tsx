import { GithubReleasesLink } from "@/components/links";
import { Reveal } from "@/components/reveal";
import { ScreenshotGallery } from "@/components/screenshot-gallery";
import { SectionHeading } from "@/components/ui";

export function Showcase() {
  return (
    <section
      id="showcase"
      className="section relative overflow-hidden"
      aria-labelledby="showcase-heading"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="aurora orb-violet" style={{ width: 480, height: 480, top: "8%", left: "-12%", opacity: 0.35 }} />
        <div className="aurora orb-blue" style={{ width: 420, height: 420, bottom: "2%", right: "-8%", opacity: 0.3 }} />
      </div>
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            id="showcase-heading"
            kicker="Showcase"
            title={
              <>
                A player that <span className="text-gradient">disappears into the music</span>
              </>
            }
          >
            In-app screenshots and interactive previews of Ariya’s core screens, plus the
            artwork published with official releases. Open anything for a larger, keyboard-navigable view.
          </SectionHeading>
        </Reveal>

        <div className="mt-10">
          <ScreenshotGallery />
        </div>

        <div className="mt-6 flex justify-center">
          <GithubReleasesLink label="Official release posts on GitHub" />
        </div>
      </div>
    </section>
  );
}

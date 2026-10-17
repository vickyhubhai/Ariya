import { FeatureExplorer } from "@/components/feature-explorer";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/ui";

export function FeaturesSection() {
  return (
    <section id="features" className="section relative" aria-labelledby="features-heading">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="features-heading"
            kicker="Verified capabilities"
            title={
              <>
                Everything you need to <span className="text-gradient-violet">listen properly</span>
              </>
            }
          >
            Every item below is implemented in the current Ariya release line. Filter by category to
            explore, or read straight through — features that depend on external sources are labelled
            honestly.
          </SectionHeading>
        </Reveal>

        <div className="mt-10">
          <FeatureExplorer />
        </div>
      </div>
    </section>
  );
}

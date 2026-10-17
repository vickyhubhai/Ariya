import Link from "next/link";
import { LatestReleaseCta } from "@/components/download";
import { BrandLogo } from "@/components/brand-logo";
import { IconArrowRight, IconGithub } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { links, site } from "@/lib/site";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden pb-8 pt-4" aria-labelledby="cta-heading">
      <div className="container-page">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(150deg,rgba(109,63,240,0.22),rgba(10,10,19,0.6)_45%,rgba(62,168,255,0.16))] p-7 sm:p-12">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="aurora orb-violet float-slow" style={{ width: 380, height: 380, top: "-40%", left: "8%" }} />
              <div className="aurora orb-blue float-slower" style={{ width: 320, height: 320, bottom: "-50%", right: "4%" }} />
              <div className="noise" />
            </div>
            <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-3">
                  <BrandLogo size={44} />
                  <p className="kicker">{site.tagline}</p>
                </div>
                <h2 id="cta-heading" className="h2 mt-5 text-[clamp(1.7rem,3.6vw,2.6rem)]">
                  Your next listening session starts here
                </h2>
                <p className="lede mt-3 text-sm">
                  Download the latest stable Ariya build for Android, or read the changelog first.
                  Everything is free, open source, and published by the project itself.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5 sm:max-w-xs">
                <LatestReleaseCta compact />
                <Link href="/news" className="btn btn-ghost btn-sm justify-start">
                  Read developer news <IconArrowRight size={13} />
                </Link>
                <a
                  href={links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm justify-start"
                >
                  <IconGithub size={14} /> Star Ariya on GitHub
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

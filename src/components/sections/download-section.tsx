import Link from "next/link";
import { BuildPicker } from "@/components/download";
import { IconAlert, IconAndroid, IconArrowRight, IconCheck, IconGithub, IconShield } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/ui";
import { installSteps, links, requirements } from "@/lib/site";

export function DownloadSection() {
  return (
    <section id="download" className="section relative" aria-labelledby="download-heading">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="aurora orb-blue" style={{ width: 520, height: 520, top: "10%", right: "-10%", opacity: 0.28 }} />
      </div>
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            id="download-heading"
            kicker="Download"
            title={
              <>
                Get the latest <span className="text-gradient">stable APK</span>
              </>
            }
          >
            Builds are pulled live from the GitHub Releases API. Nothing is re-hosted here, and every
            button points at its official <code className="rounded bg-white/8 px-1 py-0.5 text-[0.8em]">browser_download_url</code>.
          </SectionHeading>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal>
            <BuildPicker />
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={80}>
              <div className="glass card-radius p-5">
                <h2 className="text-sm font-semibold text-white/90">Installation in four steps</h2>
                <ol className="mt-4 space-y-4">
                  {installSteps.map((step, index) => (
                    <li key={step.title} className="flex gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-violet-300/30 bg-violet-400/10 text-[0.68rem] font-semibold text-violet-100">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white/85">{step.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-white/45">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="glass card-radius p-5">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white/90">
                  <IconAndroid size={16} /> Requirements
                </h2>
                <dl className="mt-3 divide-y divide-white/6 text-xs">
                  {requirements.map((row) => (
                    <div key={row.label} className="flex items-start justify-between gap-4 py-2">
                      <dt className="text-white/40">{row.label}</dt>
                      <dd className="break-words text-right text-white/75">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>

            <Reveal delay={180}>
              <div className="rounded-2xl border border-violet-300/15 bg-violet-500/6 p-4">
                <p className="flex items-start gap-2 text-xs leading-relaxed text-violet-100/80">
                  <IconShield size={15} className="mt-0.5 shrink-0" />
                  Only install APKs from the official Ariya GitHub releases. Builds are signed by the
                  project; this website cannot verify signatures on your device.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={links.repo} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm">
                    <IconGithub size={14} /> Source code
                  </a>
                  <Link href="/releases" className="btn btn-ghost btn-sm">
                    Full release history <IconArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={60}>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.7rem] text-white/35">
            <span className="inline-flex items-center gap-1.5"><IconCheck size={12} /> No account required</span>
            <span className="inline-flex items-center gap-1.5"><IconCheck size={12} /> No tracking scripts</span>
            <span className="inline-flex items-center gap-1.5"><IconCheck size={12} /> MIT licensed</span>
            <span className="inline-flex items-center gap-1.5"><IconAlert size={12} /> Sideloading is at your own risk</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

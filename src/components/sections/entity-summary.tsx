import Link from "next/link";
import { IconArrowRight, IconCheck, IconGithub, IconShield } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { entityFacts, links } from "@/lib/site";

/** Crawlable, self-contained answer block for answer engines (AEO/GEO). */
export function EntitySummary() {
  return (
    <section className="section-tight relative" id="about-ariya" aria-labelledby="summary-heading">
      <div className="container-page">
        <Reveal>
          <div className="glass glass-highlight card-radius relative overflow-hidden p-6 sm:p-9">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.32),transparent_70%)] blur-2xl"
            />
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <h2 id="summary-heading" className="h2 text-[clamp(1.5rem,3vw,2.1rem)]">
                  What is Ariya Music Player?
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-[0.95rem]">
                  <strong className="font-semibold text-white/90">Ariya</strong> is a free, open-source
                  music player for Android, built by Vicky and the Astrix Team. It combines playback
                  quality controls, synced lyrics, playlists, queue management and music discovery in a
                  dark, glass-styled interface. The app requires Android 8.0 (API 26) or newer and is
                  distributed as signed APKs through the official{" "}
                  <a
                    href={links.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-200 underline decoration-violet-300/40 underline-offset-2 hover:text-white"
                  >
                    vickyhubhai/Ariya
                  </a>{" "}
                  GitHub repository and this website.
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {[
                    "Android 8.0+ · ARM64 & Universal APKs",
                    "FLAC / lossless where the source allows",
                    "Synced lyrics with configurable providers",
                    "MIT licensed, public source code",
                  ].map((line) => (
                    <p key={line} className="flex items-start gap-2 text-xs text-white/55">
                      <IconCheck size={14} className="mt-0.5 shrink-0 text-emerald-300/80" />
                      {line}
                    </p>
                  ))}
                </div>
                <div className="actions actions-stack mt-6">
                  <Link href="/download" className="btn btn-primary btn-sm">
                    Download Ariya <IconArrowRight size={13} />
                  </Link>
                  <Link href="/about" className="btn btn-glass btn-sm">
                    About the project
                  </Link>
                  <a href={links.repo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                    <IconGithub size={14} /> Source
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  Entity facts
                </h3>
                <dl className="mt-3 divide-y divide-white/8 text-xs">
                  {entityFacts.map((fact) => (
                    <div key={fact.label} className="flex items-start justify-between gap-4 py-2">
                      <dt className="text-white/40">{fact.label}</dt>
                      <dd className="break-words text-right font-medium text-white/80">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/8 bg-white/3 p-3 text-[0.7rem] leading-relaxed text-white/40">
                  <IconShield size={14} className="mt-0.5 shrink-0" />
                  Independent project. Not affiliated with Spotify, YouTube, Google, Discord or any
                  other music service.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

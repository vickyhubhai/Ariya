"use client";

import Link from "next/link";
import { useRef } from "react";
import { DownloadButton } from "@/components/download";
import { IconAlert, IconAndroid, IconArrowRight, IconGithub, IconLossless, IconRefresh, IconShield, IconSparkles } from "@/components/icons";
import { ParticleField } from "@/components/particle-field";
import { PhoneMockup } from "@/components/phone-mockup";
import { useRelease } from "@/components/release-context";
import { formatCount } from "@/lib/format";
import { links, site } from "@/lib/site";

export function Hero() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const { release, error, isRefreshing, refresh } = useRelease();

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = stage.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty("--ry", `${-14 + px * 12}deg`);
    stage.style.setProperty("--rx", `${5 - py * 8}deg`);
  }

  function resetPointer() {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.removeProperty("--ry");
    stage.style.removeProperty("--rx");
  }

  return (
    <section className="relative overflow-hidden pt-[calc(var(--nav-height)+2.5rem)] pb-16 md:pb-24" id="top">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="aurora orb-violet float-slow" style={{ width: 640, height: 640, top: "-20%", left: "-14%" }} />
        <div className="aurora orb-blue float-slower" style={{ width: 560, height: 560, top: "6%", right: "-14%" }} />
        <div className="aurora orb-rose" style={{ width: 380, height: 380, bottom: "-10%", left: "38%", opacity: 0.3 }} />
        <div className="grid-floor" />
        <div className="noise" />
        <ParticleField className="opacity-70" density={54} />
      </div>

      <div className="container-page relative">
        <div className="grid items-center gap-10 sm:gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 xl:gap-12">
          <div className="relative z-10">
            <p className="kicker">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_10px_rgba(196,181,253,1)]" />
              Open source · Android music player
            </p>

            <h1 className="mt-6 text-[clamp(2.5rem,6.4vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-balance">
              <span className="block text-white/90">Ariya Music Player</span>
              <span className="text-gradient mt-2 block">Music Beyond Limits</span>
            </h1>

            <p className="lede mt-6 max-w-xl">
              A calm, lossless-ready Android player with synced lyrics, full queue control and a
              dark glass interface. Free, open source, and distributed straight from the official
              GitHub repository.
            </p>

            <div className="actions actions-stack mt-8">
              {release ? (
                <DownloadButton
                  variant={release.primary}
                  releaseTag={release.tag}
                  label={`Download v${release.version}`}
                />
              ) : error ? (
                <button type="button" className="btn btn-glass" onClick={() => void refresh()} disabled={isRefreshing}>
                  <IconRefresh size={16} className={isRefreshing ? "animate-spin" : ""} />
                  {isRefreshing ? "Retrying…" : "Retry release data"}
                </button>
              ) : (
                <span className="skeleton h-11 w-48" aria-label="Loading latest release" />
              )}
              <Link href="/releases" className="btn btn-glass">
                Explore releases
                <IconArrowRight size={15} />
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/45">
              <span className="inline-flex items-center gap-1.5">
                <IconAndroid size={14} /> Android 8.0+
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconShield size={14} /> MIT licensed
              </span>
              <a
                href={links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="tap tap-sm inline-flex items-center gap-1.5 transition hover:text-white/80"
              >
                <IconGithub size={14} /> Source on GitHub
              </a>
            </div>

            <dl className="mt-8 grid max-w-lg grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
              <div className="glass-soft rounded-2xl px-4 py-3">
                <dt className="text-[0.63rem] uppercase tracking-[0.16em] text-white/40">Latest stable</dt>
                <dd className="mt-1 text-sm font-semibold text-white/90">
                  {release ? `v${release.version}` : <span className="skeleton block h-4 w-14" />}
                </dd>
              </div>
              <div className="glass-soft rounded-2xl px-4 py-3">
                <dt className="text-[0.63rem] uppercase tracking-[0.16em] text-white/40">APK downloads</dt>
                <dd className="mt-1 text-sm font-semibold text-white/90">
                  {release ? formatCount(release.variants.reduce((total, variant) => total + variant.downloads, 0)) : <span className="skeleton block h-4 w-12" />}
                </dd>
              </div>
              <div className="glass-soft col-span-2 rounded-2xl px-4 py-3 sm:col-span-1">
                <dt className="text-[0.63rem] uppercase tracking-[0.16em] text-white/40">Builds</dt>
                <dd className="mt-1 text-sm font-semibold text-white/90">
                  {release ? `${release.variants.length} APKs` : <span className="skeleton block h-4 w-14" />}
                </dd>
              </div>
            </dl>

            {error ? (
              <p className="mt-4 flex items-start gap-2 text-xs text-amber-100/80" role="status">
                <IconAlert size={14} className="mt-0.5 shrink-0" />
                {error.message} You can still browse the{" "}
                <a
                  href={links.latestRelease}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-white"
                >
                  official GitHub release
                </a>
                .
              </p>
            ) : null}
          </div>

          <div
            ref={stageRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={resetPointer}
            className="stage-3d relative mx-auto w-full max-w-[430px] lg:max-w-none"
          >
            <div className="relative mt-4 lg:mt-0">
              <div
                aria-hidden="true"
                className="absolute -inset-10 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.32),transparent_65%)] blur-2xl"
              />
              <div className="relative mx-auto w-[min(248px,64vw)] sm:w-[278px] lg:w-[300px] xl:w-[318px]">
                <div className="phone-tilt">
                  <PhoneMockup variant="home" />
                </div>

                <div className="float-slow absolute -left-[46%] top-[13%] hidden w-[172px] rounded-2xl border border-white/12 bg-white/8 p-3 backdrop-blur-xl lg:block xl:-left-[52%] xl:w-[184px]">
                  <div className="flex items-center gap-2 text-[0.65rem] text-white/60">
                    <IconSparkles size={13} className="text-violet-200" />
                    Haze Glass
                  </div>
                  <p className="mt-1 text-[0.78rem] font-medium leading-snug text-white/90">
                    Real backdrop blur with adjustable glass opacity
                  </p>
                  <div className="mt-2 h-1 w-full rounded-full bg-white/15">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-violet-300 to-sky-300" />
                  </div>
                </div>

                <div className="float-slower absolute -right-[44%] top-[44%] hidden w-[164px] rounded-2xl border border-white/12 bg-white/8 p-3 backdrop-blur-xl lg:block xl:-right-[50%] xl:w-[176px]">
                  <div className="flex items-center gap-2 text-[0.65rem] text-white/60">
                    <IconLossless size={13} className="text-sky-200" />
                    Lossless ready
                  </div>
                  <p className="mt-1 text-[0.78rem] font-medium leading-snug text-white/90">
                    FLAC playback when the source supports it
                  </p>
                  <div className="mt-2 flex items-end gap-[3px]" aria-hidden="true">
                    {[6, 12, 8, 16, 10, 14, 7, 11, 5, 9].map((height, index) => (
                      <span
                        key={index}
                        className="w-[3px] rounded-full bg-gradient-to-t from-violet-400/50 to-sky-200"
                        style={{ height }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-2 text-center sm:mt-16">
          <p className="max-w-xl text-[0.7rem] leading-relaxed text-white/35">
            UI previews above are illustrative, built from Ariya’s documented interface —{" "}
            <a
              href={links.releases}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-white/20 underline-offset-2 hover:text-white/60"
            >
              see real release posts on GitHub
            </a>
            {" "}· {site.tagline}
          </p>
        </div>
      </div>
    </section>
  );
}

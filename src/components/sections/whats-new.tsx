import Link from "next/link";
import { DownloadButton } from "@/components/download";
import { IconAlert, IconArrowRight, IconExternal, IconGithub, IconRefresh } from "@/components/icons";
import { CompactReleaseTimeline } from "@/components/release-notes";
import { Reveal } from "@/components/reveal";
import { RefreshButton } from "@/components/refresh-button";
import { SectionHeading } from "@/components/ui";
import { Markdown } from "@/lib/markdown";
import { formatCount, formatDate } from "@/lib/format";
import type { ReleaseInfo } from "@/lib/github";
import { links } from "@/lib/site";

export function WhatsNewSection({
  release,
  releases,
  error,
  stale,
}: {
  release: ReleaseInfo | null;
  releases: ReleaseInfo[];
  error: { code: string; message: string } | null;
  stale?: boolean;
}) {
  return (
    <section id="whats-new" className="section relative" aria-labelledby="whats-new-heading">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionHeading
              align="left"
              id="whats-new-heading"
              kicker="What’s new"
              title={
                <>
                  The latest release, <span className="text-gradient-violet">straight from GitHub</span>
                </>
              }
            >
              Version numbers, publish dates, changelogs and APK metadata are read from the GitHub
              Releases API — never hardcoded.
            </SectionHeading>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/releases" className="btn btn-glass btn-sm">
                All releases <IconArrowRight size={13} />
              </Link>
              <a href={links.releases} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                <IconGithub size={14} /> GitHub
              </a>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
          <Reveal>
            <div className="glass glass-highlight card-radius h-full p-5 sm:p-7">
              {release ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="chip border-violet-300/30 bg-violet-400/10 text-violet-100">
                      v{release.version}
                    </span>
                    <span className="text-xs text-white/40">{formatDate(release.publishedAt)}</span>
                    {stale ? (
                      <span className="chip border-amber-300/25 text-amber-100/80">Cached snapshot</span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-[clamp(1.35rem,2.6vw,1.9rem)] font-semibold leading-tight tracking-[-0.025em] text-white">
                    {release.name}
                  </h3>
                  <div className="mt-4 max-h-[22rem] overflow-y-auto pr-2">
                    {release.body ? (
                      <Markdown markdown={release.body} />
                    ) : (
                      <p className="text-sm text-white/45">
                        This release has no written notes yet. See GitHub for the full changelog.
                      </p>
                    )}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/8 pt-4">
                    <DownloadButton
                      variant={release.primary}
                      releaseTag={release.tag}
                      size="sm"
                      label={`Get v${release.version}`}
                    />
                    <Link href={`/releases/${encodeURIComponent(release.tag)}`} className="btn btn-glass btn-sm">
                      Release details
                    </Link>
                    <a
                      href={release.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm"
                    >
                      GitHub <IconExternal size={12} />
                    </a>
                  </div>
                  <p className="mt-3 text-[0.68rem] text-white/30">
                    {release.variants.length} APK assets · {formatCount(release.downloads)} downloads across
                    those assets.
                  </p>
                </>
              ) : (
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-amber-100/90">
                    <IconAlert size={16} /> The latest release could not be loaded
                  </p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-white/50">
                    {error?.message ?? "GitHub did not return release data."} You can retry, or open the
                    official releases page directly — the download is always available there.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <RefreshButton label="Retry release data" />
                    <a href={links.latestRelease} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm">
                      <IconRefresh size={14} /> Open GitHub releases
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="glass card-radius h-full p-5">
              <h3 className="text-sm font-semibold text-white/85">Release history</h3>
              <p className="mt-1 text-xs text-white/40">
                Stable releases only. Pre-releases and drafts are excluded.
              </p>
              <div className="mt-5">
                {releases.length > 0 ? (
                  <CompactReleaseTimeline releases={releases.slice(0, 6)} />
                ) : (
                  <div className="space-y-3" aria-hidden="true">
                    {[0, 1, 2, 3].map((key) => (
                      <div key={key} className="space-y-1.5 border-l border-white/10 pl-4">
                        <span className="skeleton block h-3.5 w-20" />
                        <span className="skeleton block h-2.5 w-32" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href="/releases"
                className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-violet-200 transition hover:text-white"
              >
                Open the release explorer <IconArrowRight size={13} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

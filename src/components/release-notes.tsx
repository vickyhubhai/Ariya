"use client";

import Link from "next/link";
import { useState } from "react";
import { DownloadButton } from "@/components/download";
import { IconAlert, IconChevron, IconExternal, IconGithub } from "@/components/icons";
import { Markdown } from "@/lib/markdown";
import { formatCount, formatDate, formatShortDate } from "@/lib/format";
import type { ReleaseInfo } from "@/lib/github";

export function ReleaseBadge({ release }: { release: ReleaseInfo }) {
  return (
    <span className="chip">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.85)]" />
      v{release.version}
    </span>
  );
}

export function ReleaseCard({
  release,
  index,
  defaultOpen = false,
}: {
  release: ReleaseInfo;
  index: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `release-panel-${release.id}`;

  return (
    <article className="glass card-radius overflow-hidden">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <ReleaseBadge release={release} />
            {index === 0 ? (
              <span className="chip border-violet-300/30 bg-violet-400/10 text-violet-100">Latest stable</span>
            ) : null}
            <span className="text-xs text-white/35">{formatDate(release.publishedAt)}</span>
          </div>
          <h3 className="h3 mt-3">{release.name}</h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40">
            <span>{release.variants.length} APK{release.variants.length === 1 ? "" : "s"}</span>
            <span aria-hidden="true">·</span>
            <span>{formatCount(release.downloads)} asset downloads</span>
            <span aria-hidden="true">·</span>
            <span>tag {release.tag}</span>
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:shrink-0">
          <DownloadButton variant={release.primary} releaseTag={release.tag} size="sm" label="Download" />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={panelId}
            className="btn btn-glass btn-sm"
          >
            {open ? "Hide details" : "Release details"}
            <IconChevron size={14} className={`transition ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      <div id={panelId} hidden={!open} className="border-t border-white/8 px-5 py-5 sm:px-6">
        {release.body ? (
          <Markdown markdown={release.body} className="prose-ariya max-h-[32rem] overflow-y-auto pr-2" />
        ) : (
          <p className="text-sm text-white/45">
            This release has no written notes. Assets are still available on GitHub.
          </p>
        )}

        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
            APK assets in this release
          </h4>
          <ul className="mt-3 divide-y divide-white/6 rounded-2xl border border-white/8 bg-white/2">
            {release.variants.map((variant) => (
              <li key={variant.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="break-anywhere font-mono text-[0.72rem] text-white/70 sm:text-[0.74rem]">{variant.fileName}</p>
                  <p className="mt-0.5 text-[0.68rem] text-white/35">
                    {variant.label} · {variant.sizeLabel} · {formatCount(variant.downloads)} downloads
                  </p>
                </div>
                <DownloadButton variant={variant} releaseTag={release.tag} size="sm" label="APK" />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
            <IconGithub size={14} /> View on GitHub
            <IconExternal size={12} />
          </a>
          <Link href={`/releases/${encodeURIComponent(release.tag)}`} className="btn btn-ghost btn-sm">
            Release page on this site
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ReleaseExplorer({ releases }: { releases: ReleaseInfo[] }) {
  const [query, setQuery] = useState("");
  const [onlyWithAssets, setOnlyWithAssets] = useState(false);

  const filtered = releases.filter((release) => {
    const matchesQuery =
      !query ||
      release.version.toLowerCase().includes(query.toLowerCase()) ||
      release.name.toLowerCase().includes(query.toLowerCase()) ||
      release.body.toLowerCase().includes(query.toLowerCase());
    const matchesAssets = !onlyWithAssets || release.variants.length > 0;
    return matchesQuery && matchesAssets;
  });

  return (
    <div>
      <div className="glass card-radius flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition focus-within:border-violet-300/40 focus-within:bg-white/8">
          <span className="sr-only">Search releases by version or changelog text</span>
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-white/40" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search versions or changelog text"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-white/55">
            <input
              type="checkbox"
              checked={onlyWithAssets}
              onChange={(event) => setOnlyWithAssets(event.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/10 accent-violet-400"
            />
            Only releases with APKs
          </label>
          <span className="text-xs text-white/35">
            {filtered.length} / {releases.length}
          </span>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {filtered.length > 0 ? (
          filtered.map((release, index) => (
            <ReleaseCard
              key={release.id}
              release={release}
              index={releases.indexOf(release) === 0 ? 0 : index + 1}
              defaultOpen={release === filtered[0]}
            />
          ))
        ) : (
          <div className="glass card-radius p-8 text-center">
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-white/80">
              <IconAlert size={16} /> No releases match “{query}”.
            </p>
            <p className="mt-2 text-sm text-white/45">
              Clear the search to see every stable release published by the project.
            </p>
            <button type="button" className="btn btn-glass btn-sm mt-4" onClick={() => setQuery("")}>
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function CompactReleaseTimeline({ releases }: { releases: ReleaseInfo[] }) {
  return (
    <ol className="relative space-y-4 border-l border-white/10 pl-5">
      {releases.map((release, index) => (
        <li key={release.id} className="relative">
          <span
            aria-hidden="true"
            className={`absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full border ${
              index === 0 ? "border-violet-200 bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.9)]" : "border-white/30 bg-[#0a0a13]"
            }`}
          />
          <div className="flex flex-wrap items-baseline gap-2">
            <Link
              href={`/releases/${encodeURIComponent(release.tag)}`}
              className="text-sm font-semibold text-white/90 transition hover:text-violet-200"
            >
              v{release.version}
            </Link>
            <span className="text-[0.7rem] text-white/35">{formatShortDate(release.publishedAt)}</span>
          </div>
          <p className="mt-0.5 text-xs text-white/45">{release.name}</p>
        </li>
      ))}
    </ol>
  );
}

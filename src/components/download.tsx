"use client";

import { useId, useMemo, useState } from "react";
import { IconAlert, IconAndroid, IconArrowRight, IconCheck, IconCopy, IconDownload, IconRefresh, IconTv } from "@/components/icons";
import { useRelease } from "@/components/release-context";
import { formatBytes, formatCount, formatShortDate } from "@/lib/format";
import type { BuildDevice, BuildFlavor, BuildVariant } from "@/lib/github";

function isOfficialAsset(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "github.com" &&
      parsed.pathname.startsWith("/vickyhubhai/Ariya/releases/download/")
    );
  } catch {
    return false;
  }
}

export function DownloadButton({
  variant,
  releaseTag,
  size = "md",
  label,
  className = "",
}: {
  variant: BuildVariant | null;
  releaseTag?: string;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const [phase, setPhase] = useState<"idle" | "preparing" | "started">("idle");
  const id = useId();

  if (!variant || !isOfficialAsset(variant.url)) {
    return (
      <a
        href="https://github.com/vickyhubhai/Ariya/releases/latest"
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-glass ${size === "sm" ? "btn-sm" : ""} ${className}`}
      >
        <IconDownload size={16} />
        View releases on GitHub
      </a>
    );
  }

  return (
    <a
      href={variant.url}
      id={id}
      download
      rel="noopener noreferrer"
      referrerPolicy="no-referrer"
      aria-label={`Download ${variant.fileName}${releaseTag ? ` from release ${releaseTag}` : ""} (${variant.sizeLabel})`}
      onClick={() => {
        setPhase("preparing");
        window.setTimeout(() => setPhase("started"), 1800);
      }}
      className={`btn btn-primary ${size === "sm" ? "btn-sm" : ""} ${className}`}
    >
      {phase === "started" ? <IconCheck size={16} /> : <IconDownload size={16} />}
      {phase === "preparing"
        ? "Starting download…"
        : phase === "started"
          ? "Download started"
          : (label ?? "Download APK")}
      <span className="sr-only"> {variant.sizeLabel}</span>
    </a>
  );
}

export function CopyAssetLink({ url, fileName }: { url: string; fileName: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="btn btn-ghost btn-sm"
      aria-label={`Copy the official download link for ${fileName}`}
    >
      {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

/** Compact "latest stable" CTA used in the hero and headers. */
export function LatestReleaseCta({ compact = false }: { compact?: boolean }) {
  const { release, error, isRefreshing, refresh } = useRelease();

  if (!release) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center" aria-live="polite">
        {error ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip border-amber-300/25 text-amber-100/90">
              <IconAlert size={13} /> Release data unavailable
            </span>
            <button type="button" onClick={() => void refresh()} className="btn btn-glass btn-sm" disabled={isRefreshing}>
              <IconRefresh size={14} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Retrying…" : "Retry"}
            </button>
            <a
              href="https://github.com/vickyhubhai/Ariya/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              GitHub Releases
            </a>
          </div>
        ) : (
          <>
            <span className="skeleton h-11 w-44" />
            <span className="skeleton h-11 w-36" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="actions actions-stack flex-col sm:flex-row sm:items-center">
      <DownloadButton variant={release.primary} releaseTag={release.tag} label={`Download v${release.version}`} />
      <a href="#download" className="btn btn-glass">
        All builds &amp; sizes
        <IconArrowRight size={15} />
      </a>
      {!compact ? (
        <p className="text-xs leading-relaxed text-white/45">
          v{release.version} · {release.primary?.sizeLabel ?? formatBytes(0)} · {release.primary?.label}
        </p>
      ) : null}
    </div>
  );
}

function VariantRow({ variant, tag }: { variant: BuildVariant; tag: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <li className="flex flex-col gap-3 border-t border-white/8 py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="break-anywhere font-mono text-[0.76rem] text-white/85 sm:text-[0.78rem]">{variant.fileName}</span>
          {variant.recommended ? (
            <span className="chip border-violet-300/30 bg-violet-400/10 text-violet-100">Recommended</span>
          ) : null}
        </div>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.7rem] text-white/45 sm:text-xs">
          <span>{variant.label}</span>
          <span aria-hidden="true">·</span>
          <span>{formatBytes(variant.size)}</span>
          <span aria-hidden="true">·</span>
          <span>{formatCount(variant.downloads)} downloads</span>
        </p>
      </div>
      <div className="flex w-full flex-wrap items-center gap-1 sm:w-auto sm:shrink-0">
        <DownloadButton variant={variant} releaseTag={tag} size="sm" label="Download" />
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(variant.url);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 2000);
            } catch {
              setCopied(false);
            }
          }}
          className="btn btn-ghost btn-sm"
          aria-label={`Copy download URL for ${variant.fileName}`}
        >
          {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
        </button>
      </div>
    </li>
  );
}

export function BuildPicker({ heading = true }: { heading?: boolean }) {
  const { release, error, isRefreshing, refresh, stale, fetchedAt } = useRelease();
  const [flavor, setFlavor] = useState<"all" | BuildFlavor>("all");
  const [device, setDevice] = useState<"all" | BuildDevice>("all");

  const variants = useMemo(() => {
    if (!release) return [];
    return release.variants.filter(
      (variant) =>
        (flavor === "all" || variant.flavor === flavor) && (device === "all" || variant.device === device),
    );
  }, [release, flavor, device]);

  if (!release) {
    return (
      <div className="glass glass-highlight card-radius p-5 sm:p-6" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="h3">Choose your build</h3>
          <span className="chip">
            <span className="eq text-violet-300" aria-hidden="true"><span /><span /><span /><span /></span>
            Loading release data
          </span>
        </div>
        <div className="mt-5 space-y-3" aria-hidden="true">
          <span className="skeleton block h-4 w-2/3" />
          <span className="skeleton block h-12 w-full" />
          <span className="skeleton block h-12 w-full" />
        </div>
        {error ? (
          <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-400/5 p-4">
            <p className="flex items-center gap-2 text-sm text-amber-100/90">
              <IconAlert size={16} /> {error.message}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn btn-glass btn-sm" onClick={() => void refresh()} disabled={isRefreshing}>
                <IconRefresh size={14} className={isRefreshing ? "animate-spin" : ""} />
                {isRefreshing ? "Retrying…" : "Retry"}
              </button>
              <a
                href="https://github.com/vickyhubhai/Ariya/releases/latest"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost btn-sm"
              >
                Download from GitHub instead
              </a>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="glass glass-highlight card-radius p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {heading ? <h3 className="h3">Choose your build</h3> : null}
          <p className="mt-1.5 text-sm text-white/50">
            Latest stable: <span className="text-white/85">v{release.version}</span> · released{" "}
            {formatShortDate(release.publishedAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {stale ? <span className="chip border-amber-300/25 text-amber-100/85">Cached snapshot</span> : null}
          <button
            type="button"
            onClick={() => void refresh()}
            className="btn btn-ghost btn-sm"
            aria-label="Refresh release information from GitHub"
            disabled={isRefreshing}
          >
            <IconRefresh size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Refreshing" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-white/40">Flavour</legend>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter builds by flavour">
            {(["all", "GMS", "FOSS"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={flavor === option}
                onClick={() => setFlavor(option)}
                className={`btn btn-sm ${flavor === option ? "btn-primary" : "btn-glass"}`}
              >
                {option === "all" ? "All" : option}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-white/40">Device</legend>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter builds by device">
            {([
              { value: "all", label: "All", icon: null },
              { value: "Phone", label: "Phone", icon: <IconAndroid size={14} /> },
              { value: "TV", label: "TV", icon: <IconTv size={14} /> },
            ] as const).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={device === option.value}
                onClick={() => setDevice(option.value)}
                className={`btn btn-sm ${device === option.value ? "btn-primary" : "btn-glass"}`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-5">
        {variants.length > 0 ? (
          <ul>
            {variants.map((variant) => (
              <VariantRow key={`${variant.id}-${variant.fileName}`} variant={variant} tag={release.tag} />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/3 p-5 text-sm text-white/60">
            <p className="font-medium text-white/85">No APK matches these filters.</p>
            <p className="mt-1">
              This release publishes {release.variants.length} APK
              {release.variants.length === 1 ? "" : "s"}. Reset the filters or open the official
              release page to see every asset.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={() => {
                  setFlavor("all");
                  setDevice("all");
                }}
              >
                Reset filters
              </button>
              <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                Open GitHub release
              </a>
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-white/40">
        APK files and sizes come directly from the GitHub Releases API and are never re-hosted by this
        site. {release.primary?.sha256 ? `SHA-256 of the recommended APK: ${release.primary.sha256.slice(0, 16)}…` : ""}
        {fetchedAt ? ` Data fetched ${formatShortDate(fetchedAt)}.` : ""}
      </p>
    </div>
  );
}

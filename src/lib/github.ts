import { cachedJson } from "./cache";
import { formatBytes } from "./format";
import { repo } from "./site";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type ApiErrorCode =
  | "offline"
  | "timeout"
  | "network"
  | "not_found"
  | "rate_limit"
  | "forbidden"
  | "server_error"
  | "http"
  | "invalid_json"
  | "no_releases"
  | "no_assets";

export class GitHubApiError extends Error {
  code: ApiErrorCode;
  status?: number;

  constructor(message: string, code: ApiErrorCode, status?: number) {
    super(message);
    this.name = "GitHubApiError";
    this.code = code;
    this.status = status;
  }
}

export type BuildFlavor = "GMS" | "FOSS" | "Standard";
export type BuildArch = "ARM64" | "Universal" | "ARMv7" | "x64" | "Unknown";
export type BuildDevice = "Phone" | "TV";

export interface BuildVariant {
  id: number;
  fileName: string;
  url: string;
  flavor: BuildFlavor;
  arch: BuildArch;
  device: BuildDevice;
  label: string;
  size: number;
  sizeLabel: string;
  downloads: number;
  sha256: string | null;
  recommended: boolean;
  recommendation: string | null;
}

export interface ReleaseInfo {
  id: number;
  tag: string;
  version: string;
  name: string;
  body: string;
  publishedAt: string;
  htmlUrl: string;
  author: string;
  downloads: number;
  variants: BuildVariant[];
  primary: BuildVariant | null;
}

export interface ReleasesPayload {
  generatedAt: string;
  releases: ReleaseInfo[];
  latest: ReleaseInfo | null;
  totalDownloads: number;
}

export interface LatestPayload {
  generatedAt: string;
  release: ReleaseInfo | null;
}

export type ApiResult<T> =
  | { ok: true; data: T; stale: boolean; fetchedAt: string }
  | { ok: false; error: { code: ApiErrorCode; message: string } };

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const OWNER = repo.owner;
const REPO = repo.name;
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}`;
const DOWNLOAD_HOST = "github.com";
const DOWNLOAD_PREFIX = `/${OWNER}/${REPO}/releases/download/`;
const TTL = 5 * 60 * 1000;
const REQUEST_TIMEOUT = 9000;

/** Builds that must never be offered as a stable download. */
const UNSTABLE = /(alpha|beta|preview|nightly|canary|snapshot|debug|test|leak|leaked|dev|draft|sandbox)/i;

/* ------------------------------------------------------------------ */
/* Upstream fetch                                                     */
/* ------------------------------------------------------------------ */

async function githubFetch(path: string): Promise<unknown> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ariya-music-player-website",
  };
  // Optional, server-side only. Public requests work without a token, but a
  // token raises the rate limit in production. Never exposed to the browser.
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_ROOT}${path}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
  } catch (error) {
    const name = (error as { name?: string }).name;
    if (name === "TimeoutError" || name === "AbortError") {
      throw new GitHubApiError("GitHub took too long to respond.", "timeout");
    }
    throw new GitHubApiError("Could not reach the GitHub API.", "network");
  }

  if (response.status === 403 || response.status === 429) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    if (remaining === "0" || response.status === 429) {
      throw new GitHubApiError(
        "The GitHub API rate limit was reached. Try again in a few minutes.",
        "rate_limit",
        response.status,
      );
    }
    throw new GitHubApiError("GitHub refused the request.", "forbidden", response.status);
  }

  if (response.status === 404) {
    throw new GitHubApiError("This GitHub resource was not found.", "not_found", 404);
  }

  if (response.status >= 500) {
    throw new GitHubApiError("GitHub is currently unavailable.", "server_error", response.status);
  }

  if (!response.ok) {
    throw new GitHubApiError(`GitHub responded with HTTP ${response.status}.`, "http", response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new GitHubApiError("GitHub returned a malformed response.", "invalid_json");
  }
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                      */
/* ------------------------------------------------------------------ */

interface RawAsset {
  id?: number;
  name?: string;
  size?: number;
  state?: string;
  content_type?: string;
  download_count?: number;
  browser_download_url?: string;
  digest?: string | null;
}

interface RawRelease {
  id?: number;
  tag_name?: string;
  name?: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  published_at?: string | null;
  created_at?: string | null;
  html_url?: string;
  author?: { login?: string };
  assets?: RawAsset[];
}

function stripLeadingV(tag: string): string {
  return tag.replace(/^v/i, "");
}


/** Only accept links to the official Ariya release assets over HTTPS. */
export function isOfficialDownloadUrl(value: string | undefined): value is string {
  if (!value) return false;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return (
    parsed.protocol === "https:" &&
    parsed.hostname === DOWNLOAD_HOST &&
    parsed.pathname.startsWith(DOWNLOAD_PREFIX) &&
    !parsed.search &&
    !parsed.hash
  );
}

function classifyAsset(asset: RawAsset, tag: string): BuildVariant | null {
  const name = typeof asset.name === "string" ? asset.name : "";
  if (!name || !/\.apk$/i.test(name)) return null;
  if (asset.state && asset.state !== "uploaded") return null;
  if (!Number.isFinite(asset.size) || (asset.size ?? 0) <= 0) return null;
  if (UNSTABLE.test(name)) return null;

  const url = asset.browser_download_url;
  if (!isOfficialDownloadUrl(url)) return null;
  // The asset must belong to the release being rendered.
  if (!url.includes(`/download/${encodeURIComponent(tag)}/`) && !url.includes(`/download/${tag}/`)) {
    return null;
  }

  const flavor: BuildFlavor = /foss/i.test(name) ? "FOSS" : /gms/i.test(name) ? "GMS" : "Standard";
  const device: BuildDevice = /\btv\b|television/i.test(name) ? "TV" : "Phone";
  const arch: BuildArch = /arm64|aarch64/i.test(name)
    ? "ARM64"
    : /universal/i.test(name)
      ? "Universal"
      : /armv7|armeabi/i.test(name)
        ? "ARMv7"
        : /x86_64|x64/i.test(name)
          ? "x64"
          : "Unknown";

  const parts = [flavor === "Standard" ? "Standard" : flavor, arch === "Unknown" ? null : arch, device === "TV" ? "TV" : null]
    .filter(Boolean)
    .join(" · ");

  const digest = typeof asset.digest === "string" && asset.digest.startsWith("sha256:")
    ? asset.digest.slice(7)
    : null;

  return {
    id: asset.id ?? 0,
    fileName: name,
    url,
    flavor,
    arch,
    device,
    label: parts,
    size: asset.size ?? 0,
    sizeLabel: formatBytes(asset.size ?? 0),
    downloads: Math.max(0, asset.download_count ?? 0),
    sha256: digest,
    recommended: false,
    recommendation: null,
  };
}

function rank(variant: BuildVariant): number {
  const device = variant.device === "Phone" ? 0 : 10;
  const flavor = variant.flavor === "GMS" ? 0 : variant.flavor === "FOSS" ? 2 : 1;
  const arch =
    variant.arch === "ARM64" ? 0 : variant.arch === "Universal" ? 1 : variant.arch === "x64" ? 2 : 3;
  return device + flavor + arch / 10;
}

function normaliseRelease(raw: RawRelease): ReleaseInfo | null {
  const tag = typeof raw.tag_name === "string" ? raw.tag_name : "";
  if (!tag) return null;
  if (raw.draft || raw.prerelease) return null;
  if (UNSTABLE.test(tag)) return null;

  const assets = Array.isArray(raw.assets) ? raw.assets : [];
  const variants = assets
    .map((asset) => classifyAsset(asset, tag))
    .filter((variant): variant is BuildVariant => variant !== null)
    .sort((a, b) => rank(a) - rank(b));

  if (variants.length === 0) return null;

  // Recommendation: the phone build that fits the widest audience.
  const phone = variants.filter((variant) => variant.device === "Phone");
  const recommended =
    phone.find((v) => v.flavor === "GMS" && v.arch === "ARM64") ??
    phone.find((v) => v.arch === "Universal") ??
    phone[0] ??
    variants[0];

  const annotated = variants.map((variant) => {
    if (variant.id !== recommended.id) return variant;
    return {
      ...variant,
      recommended: true,
      recommendation:
        recommended.arch === "ARM64"
          ? "Recommended for most modern Android phones"
          : "Recommended if you are unsure which build to pick",
    };
  });

  const publishedAt = raw.published_at ?? raw.created_at ?? "";
  if (!publishedAt) return null;

  return {
    id: raw.id ?? 0,
    tag,
    version: stripLeadingV(tag),
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : `Ariya ${tag}`,
    body: typeof raw.body === "string" ? raw.body : "",
    publishedAt,
    htmlUrl:
      typeof raw.html_url === "string" && raw.html_url.startsWith(`https://github.com/${OWNER}/${REPO}/`)
        ? raw.html_url
        : `https://github.com/${OWNER}/${REPO}/releases/tag/${encodeURIComponent(tag)}`,
    author: raw.author?.login ?? OWNER,
    downloads: annotated.reduce((total, variant) => total + variant.downloads, 0),
    variants: annotated,
    primary: annotated.find((variant) => variant.recommended) ?? annotated[0] ?? null,
  };
}

function sortReleases(releases: ReleaseInfo[]): ReleaseInfo[] {
  return [...releases].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/* ------------------------------------------------------------------ */
/* Public API                                                         */
/* ------------------------------------------------------------------ */

export async function getReleases(): Promise<ApiResult<ReleasesPayload>> {
  try {
    const result = await cachedJson<ReleasesPayload>(
      "github:releases:v3",
      TTL,
      async () => {
        const raw = await githubFetch("/releases?per_page=30");
        if (!Array.isArray(raw)) {
          throw new GitHubApiError("Unexpected GitHub response.", "invalid_json");
        }
        const releases = sortReleases(
          raw
            .map((item) => normaliseRelease(item as RawRelease))
            .filter((item): item is ReleaseInfo => item !== null),
        );
        if (releases.length === 0) {
          throw new GitHubApiError("No stable releases were found.", "no_releases");
        }
        return {
          generatedAt: new Date().toISOString(),
          releases,
          latest: releases[0] ?? null,
          totalDownloads: releases.reduce((total, release) => total + release.downloads, 0),
        };
      },
    );
    return { ok: true, data: result.data, stale: result.stale, fetchedAt: new Date(result.fetchedAt).toISOString() };
  } catch (error) {
    const normalised = toApiFailure(error);
    return { ok: false, error: normalised };
  }
}

export async function getLatestRelease(): Promise<ApiResult<LatestPayload>> {
  try {
    const result = await cachedJson<LatestPayload>(
      "github:latest:v3",
      TTL,
      async () => {
        // `/releases/latest` is the canonical endpoint for the newest stable
        // release; fall back to the full list if it is unavailable.
        let release: ReleaseInfo | null = null;
        try {
          const raw = await githubFetch("/releases/latest");
          release = normaliseRelease(raw as RawRelease);
        } catch (error) {
          if (
            error instanceof GitHubApiError &&
            (error.code === "not_found" || error.code === "no_assets")
          ) {
            release = null;
          } else {
            throw error;
          }
        }

        if (!release) {
          const list = await getReleases();
          if (!list.ok)

            throw new GitHubApiError(list.error.message, list.error.code);
          release = list.data.latest;
        }

        if (!release) {
          throw new GitHubApiError("No stable release with APK assets is available.", "no_releases");
        }

        return { generatedAt: new Date().toISOString(), release };
      },
    );
    return { ok: true, data: result.data, stale: result.stale, fetchedAt: new Date(result.fetchedAt).toISOString() };
  } catch (error) {
    return { ok: false, error: toApiFailure(error) };
  }
}

export function toApiFailure(error: unknown): { code: ApiErrorCode; message: string } {
  if (error instanceof GitHubApiError) {
    return { code: error.code, message: error.message };
  }
  return {
    code: "network",
    message: "Could not load live release data. Please try again.",
  };
}

export const retryableCodes: ApiErrorCode[] = [
  "offline",
  "timeout",
  "network",
  "rate_limit",
  "server_error",
  "http",
];

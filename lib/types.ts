/** Shared domain types for the release / news / Discord data layer. */

export type AssetCode =
  | 'offline'
  | 'timeout'
  | 'network'
  | 'not_found'
  | 'rate_limit'
  | 'forbidden'
  | 'server_error'
  | 'http'
  | 'invalid_json'
  | 'invalid_release'
  | 'no_releases';

/** Error carrying the same `code` strings the static site used for branching. */
export class ApiError extends Error {
  code: AssetCode;

  constructor(message: string, code: AssetCode) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

export interface ApkAsset {
  name: string;
  size: number;
  url: string;
  contentType: string;
}

export interface Release {
  version: string;
  name: string;
  body: string;
  publishedAt: string;
  createdAt: string;
  htmlUrl: string;
  author: string;
  draft: boolean;
  prerelease: boolean;
  assets: ApkAsset[];
  apk: ApkAsset | null;
}

export interface NewsItem {
  id: string;
  Title?: string;
  title?: string;
  Description?: string;
  description?: string;
  Author?: string;
  author?: string;
  /** Unix seconds or milliseconds, or an ISO date string. */
  Date?: number | string;
  date?: number | string;
  ImageURL?: string | string[];
  [key: string]: unknown;
}

export interface ChangelogResult {
  found: boolean;
  item: NewsItem | null;
  url: string;
  markdown: string;
}

export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ToastPayload {
  id: number;
  message: string;
  actions: ToastAction[];
}

export type DownloadPhase = 'idle' | 'preparing' | 'downloading' | 'done' | 'error';

export type BuildFlavor = 'GMS' | 'FOSS';
export type BuildArch = 'ARM64' | 'ARMv7' | 'x86_64' | 'Universal';

export interface VariantInfo {
  flavor: BuildFlavor;
  arch: BuildArch;
}

export type DeviceTier = 'low' | 'high';

export type NotesView = 'release' | 'changelog';

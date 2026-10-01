import type { ApkAsset, VariantInfo } from './types';

/** Numeric clamp used by the 3D rig, loader and progress bars. */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function formatSize(bytes: number | undefined | null): string {
  if (!bytes) return 'Unknown';
  const mb = bytes / (1024 * 1024);
  return `~${mb.toFixed(1)} MB`;
}

export function formatDate(iso: string | undefined | null): string {
  if (!iso) return 'Unknown';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/** localStorage read that is safe during SSR and in private mode. */
export function storageGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storageSet(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota or private mode - the site keeps working without it */
  }
}

/**
 * Allows only the schemes a link is allowed to use, mirroring
 * `GitHub.safeUrl` from the static site (also rejects control characters).
 */
export function safeUrl(url: unknown, schemes: string[]): string | null {
  const u = String(url == null ? '' : url).trim();
  if (!u) return null;
  if (/[\u0000-\u001f]/.test(u)) return null;
  for (const scheme of schemes) {
    if (scheme === '#') {
      if (u.startsWith('#')) return u;
    } else if (u.toLowerCase().startsWith(scheme)) {
      return u;
    }
  }
  return null;
}

export function normalizeVersion(v: unknown): string {
  return String(v == null ? '' : v)
    .trim()
    .replace(/^v/i, '');
}

interface ParsedVersion {
  nums: number[];
  prerelease: string;
}

export function parseVersion(v: unknown): ParsedVersion {
  let s = normalizeVersion(v);
  const plus = s.indexOf('+');
  if (plus !== -1) s = s.slice(0, plus);
  let prerelease = '';
  const dash = s.indexOf('-');
  if (dash !== -1) {
    prerelease = s.slice(dash + 1);
    s = s.slice(0, dash);
  }
  const nums = s.split('.').map((part) => {
    const n = parseInt(part, 10);
    return Number.isFinite(n) ? n : 0;
  });
  return { nums, prerelease };
}

function comparePrerelease(a: string, b: string): number {
  const pa = a.split('.');
  const pb = b.split('.');
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    if (pa[i] === undefined) return -1;
    if (pb[i] === undefined) return 1;
    if (pa[i] === pb[i]) continue;
    const na = /^\d+$/.test(pa[i]);
    const nb = /^\d+$/.test(pb[i]);
    if (na && nb) return parseInt(pa[i], 10) < parseInt(pb[i], 10) ? -1 : 1;
    if (na && !nb) return -1;
    if (!na && nb) return 1;
    return pa[i] < pb[i] ? -1 : 1;
  }
  return 0;
}

/** Semver-ish comparison (same algorithm as the original `GitHub.compareVersions`). */
export function compareVersions(a: string, b: string): number {
  const sa = normalizeVersion(a);
  const sb = normalizeVersion(b);
  if (sa === sb) return 0;

  const va = parseVersion(a);
  const vb = parseVersion(b);
  const len = Math.max(va.nums.length, vb.nums.length);
  for (let i = 0; i < len; i++) {
    const x = va.nums[i] || 0;
    const y = vb.nums[i] || 0;
    if (x !== y) return x < y ? -1 : 1;
  }

  if (va.prerelease === vb.prerelease) return 0;
  if (!va.prerelease) return 1;
  if (!vb.prerelease) return -1;
  return comparePrerelease(va.prerelease, vb.prerelease);
}

/** Classifies an APK asset name into GMS/FOSS + architecture, as the picker did. */
export function variantInfo(name: string): VariantInfo {
  const n = String(name || '').toLowerCase();
  const flavor = n.includes('foss') ? 'FOSS' : 'GMS';
  const arch = n.includes('arm64') || n.includes('aarch64') ? 'ARM64'
    : n.includes('armv7') || n.includes('armeabi') ? 'ARMv7'
    : n.includes('x86_64') ? 'x86_64'
    : 'Universal';
  return { flavor: flavor as VariantInfo['flavor'], arch: arch as VariantInfo['arch'] };
}

export function variantDesc({ flavor, arch }: VariantInfo): string {
  const flavorNote = flavor === 'FOSS' ? 'No Google services' : 'With Google services support';
  const archNote = arch === 'Universal' ? 'Works on every Android device'
    : arch === 'ARM64' ? 'Smaller build for most modern phones'
    : arch === 'ARMv7' ? 'For older 32-bit devices'
    : arch === 'x86_64' ? 'For emulators and x86_64 devices'
    : String(arch);
  return `${flavorNote} \u00b7 ${archNote}`;
}

export function isRecommendedAsset(asset: ApkAsset): boolean {
  const { flavor, arch } = variantInfo(asset.name);
  return flavor === 'GMS' && arch === 'ARM64';
}

/** requestIdleCallback with a timeout fallback (used to defer non-critical work). */
export function whenIdle(cb: () => void, timeout = 2000): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & {
    requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number;
  };
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(() => cb(), { timeout });
  } else {
    window.setTimeout(cb, Math.min(300, timeout));
  }
}

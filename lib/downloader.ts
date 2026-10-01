import { ApiError, type ApkAsset } from './types';

export type ProgressCallback = (receivedBytes: number, totalBytes: number | null) => void;

export interface DownloadResult {
  /** 'streamed' = fetched with progress then saved; 'direct' = plain browser download. */
  mode: 'streamed' | 'direct';
  filename: string;
  bytes?: number;
}

interface DownloadOptions {
  /** Off on low-power devices: reading a ~30 MB APK into memory is not worth it. */
  stream?: boolean;
  onProgress?: ProgressCallback;
  signal?: AbortSignal;
}

/** Triggers a browser save for any object/link URL. */
function triggerSave(href: string, filename: string, revoke = false): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename || 'Ariya.apk';
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (revoke) setTimeout(() => URL.revokeObjectURL(href), 60_000);
}

/**
 * Downloads the selected APK.
 *
 * The static site simply clicked an anchor, which works but cannot report
 * progress. Here we stream the file so the button can show real percentages,
 * then save the blob. If streaming is impossible (CORS, offline, abort, very
 * large file on a low-power device) we fall back to the original anchor
 * behaviour, so the download itself can never regress.
 */
export async function downloadAsset(asset: ApkAsset, options: DownloadOptions = {}): Promise<DownloadResult> {
  const filename = asset.name || 'Ariya.apk';
  const stream = options.stream !== false;

  if (!stream || typeof window === 'undefined') {
    triggerSave(asset.url, filename);
    return { mode: 'direct', filename };
  }

  let res: Response;
  try {
    res = await fetch(asset.url, {
      signal: options.signal,
      redirect: 'follow',
      credentials: 'omit',
    });
    if (!res.ok) throw new ApiError(`Download failed (HTTP ${res.status}).`, 'http');
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    // Cross-origin blocked or network hiccup: hand the URL to the browser.
    triggerSave(asset.url, filename);
    return { mode: 'direct', filename };
  }

  const headerTotal = Number(res.headers.get('content-length') || 0);
  const total = headerTotal > 0 ? headerTotal : asset.size > 0 ? asset.size : null;

  if (!res.body) {
    const blob = await res.blob();
    triggerSave(URL.createObjectURL(blob), filename, true);
    options.onProgress?.(blob.size, blob.size);
    return { mode: 'streamed', filename, bytes: blob.size };
  }

  const reader = res.body.getReader();
  const chunks: BlobPart[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value as unknown as BlobPart);
      received += value.byteLength;
      options.onProgress?.(received, total);
    }
  }

  const blob = new Blob(chunks, { type: asset.contentType || 'application/vnd.android.package-archive' });
  triggerSave(URL.createObjectURL(blob), filename, true);
  options.onProgress?.(received, total ?? received);

  return { mode: 'streamed', filename, bytes: received };
}

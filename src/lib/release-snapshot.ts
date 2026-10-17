import type { ApiErrorCode, ApiResult, LatestPayload, ReleaseInfo } from "@/lib/github";

/**
 * Serializable release state shared between the server layout and the client
 * provider. Kept outside the `"use client"` module so server components can
 * build the initial snapshot without importing client code.
 */
export interface ReleaseSnapshot {
  release: ReleaseInfo | null;
  stale: boolean;
  fetchedAt: string | null;
  error: { code: ApiErrorCode; message: string; retryable?: boolean } | null;
}

export function snapshotFromResult(result: ApiResult<LatestPayload>): ReleaseSnapshot {
  if (result.ok) {
    return {
      release: result.data.release,
      stale: Boolean(result.stale),
      fetchedAt: result.fetchedAt ?? result.data.generatedAt,
      error: null,
    };
  }
  return {
    release: null,
    stale: false,
    fetchedAt: null,
    error: { ...result.error, retryable: true },
  };
}

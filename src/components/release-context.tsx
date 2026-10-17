"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { ApiErrorCode, ReleaseInfo } from "@/lib/github";
import type { ReleaseSnapshot } from "@/lib/release-snapshot";

export type { ReleaseSnapshot } from "@/lib/release-snapshot";

interface ReleaseContextValue extends ReleaseSnapshot {
  isRefreshing: boolean;
  refresh: () => Promise<void>;
}

const ReleaseContext = createContext<ReleaseContextValue | null>(null);

export function ReleaseProvider({
  initial,
  children,
}: {
  initial: ReleaseSnapshot;
  children: ReactNode;
}) {
  const [snapshot, setSnapshot] = useState<ReleaseSnapshot>(initial);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsRefreshing(true);
    try {
      const response = await fetch("/api/release/latest", {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(12_000),
      });
      const payload = (await response.json()) as
        | { ok: true; release: ReleaseInfo | null; stale: boolean; fetchedAt: string }
        | { ok: false; error: { code: ApiErrorCode; message: string; retryable?: boolean } };

      if (!response.ok || !payload.ok) {
        const error = "error" in payload ? payload.error : { code: "http" as ApiErrorCode, message: "Unexpected response." };
        setSnapshot((current) => ({
          release: current.release,
          stale: current.release !== null,
          fetchedAt: current.fetchedAt,
          error,
        }));
        return;
      }

      setSnapshot({
        release: payload.release,
        stale: Boolean(payload.stale),
        fetchedAt: payload.fetchedAt,
        error: payload.release ? null : { code: "no_releases", message: "No stable release is published yet.", retryable: true },
      });
    } catch (error) {
      const code: ApiErrorCode =
        (error as { name?: string }).name === "TimeoutError" ? "timeout" : "network";
      setSnapshot((current) => ({
        release: current.release,
        stale: current.release !== null,
        fetchedAt: current.fetchedAt,
        error: {
          code,
          message: "Could not reach the release service. Check your connection and retry.",
          retryable: true,
        },
      }));
    } finally {
      setIsRefreshing(false);
      inFlight.current = false;
    }
  }, []);

  // If the server render could not reach GitHub, retry once from the browser.
  useEffect(() => {
    if (!initial.error || initial.release) return;
    const timer = window.setTimeout(() => void refresh(), 1200);
    return () => window.clearTimeout(timer);
  }, [initial.error, initial.release, refresh]);

  const value = useMemo<ReleaseContextValue>(
    () => ({ ...snapshot, isRefreshing, refresh }),
    [snapshot, isRefreshing, refresh],
  );

  return <ReleaseContext.Provider value={value}>{children}</ReleaseContext.Provider>;
}

export function useRelease(): ReleaseContextValue {
  const value = useContext(ReleaseContext);
  if (!value) {
    throw new Error("useRelease must be used inside a ReleaseProvider");
  }
  return value;
}


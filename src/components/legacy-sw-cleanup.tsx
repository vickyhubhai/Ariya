"use client";

import { useEffect } from "react";

/**
 * Purges orphaned service-worker registrations left on visitors' browsers by
 * the earlier deployment of this site (the one that shipped `public/sw.js`).
 *
 * The current site intentionally has no service worker: nothing in this app
 * registers one, and `manifest.ts` references no scripts. A stale registration
 * keeps serving cached JS chunks and assets, which produces phantom bugs such
 * as React hydration mismatches against fresh server HTML and `GET /sw.js`
 * 404s on every load. Unregistering on mount lets the browser fall back to the
 * network; the caches are dropped so nothing stale survives the reload.
 *
 * Renders nothing and runs once per document. Safe to keep permanently: after
 * the legacy workers are gone, `getRegistrations()` returns an empty list.
 */
export function LegacyServiceWorkerCleanup() {
  useEffect(() => {
    // Purge Cache Storage entries even after the registrations themselves are
    // gone: the legacy worker left named caches (e.g. download caches) that
    // nothing in the current app ever reads or removes. This site does not use
    // the Cache API, so every entry found here is orphaned.
    if (typeof caches !== "undefined") {
      void caches
        .keys()
        .then((names) => Promise.allSettled(names.map((name) => caches.delete(name))))
        .catch(() => {});
    }
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        if (registrations.length === 0) return;
        void Promise.allSettled(registrations.map((registration) => registration.unregister()));
      })
      .catch(() => {
        // Cleanup is best-effort; a denied or failed lookup must never break the page.
      });
  }, []);

  return null;
}

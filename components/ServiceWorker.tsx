'use client';

import { useEffect } from 'react';

/**
 * Replaces the `serviceWorker.register('/sw.js')` block at the bottom of
 * `js/app.js`: same timing (after load), same silence on failure. The cache
 * strategy itself lives in `public/sw.js`.
 *
 * Development is deliberately cache-free: a precached shell would serve stale
 * HTML/CSS from `localhost:3000` and make a reload look like a broken build,
 * so the worker is unregistered there instead of registered.
 */
export default function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((registration) => void registration.unregister()))
        .catch(() => {});
      return;
    }

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* Private mode / disabled / offline: the site works without the cache. */
      });
    };

    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });

    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}

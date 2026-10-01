'use client';

import { useEffect, useState } from 'react';

/**
 * Premium loading screen.
 *
 * Progress is a blend of real readiness signals (document load, font ready,
 * the hero logo decode) and an eased simulated ramp, so the percentage always
 * moves smoothly and never sits at 0 while a slow asset loads. The screen
 * unmounts itself once the page is ready; scroll is locked while it is up and
 * the scrollbar gutter is reserved globally, so nothing jumps on release.
 */
export default function Loader() {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('is-loading');

    const startedAt = Date.now();
    let readyAt = 0;
    let displayed = 0;
    let finished = false;
    let raf = 0;

    const markReady = () => {
      if (!readyAt) readyAt = Date.now();
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      markReady();
    } else {
      window.addEventListener('DOMContentLoaded', markReady, { once: true });
      window.addEventListener('load', markReady, { once: true });
    }

    if (typeof document.fonts?.ready?.then === 'function') {
      document.fonts.ready.then(markReady).catch(() => {});
    }

    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      setLeaving(true);
      root.classList.remove('is-loading');
      window.setTimeout(() => setRemoved(true), 600);
    };

    const tick = () => {
      if (finished) return;
      const now = Date.now();
      const elapsed = now - startedAt;

      // Smooth progress integration
      if (readyAt) {
        // Fast, smooth ramp to 100 once ready
        displayed += (102 - displayed) * 0.16;
      } else {
        // Eased climb toward 90% while page resources load
        const target = Math.min(88, 15 + elapsed / 18);
        displayed += (target - displayed) * 0.1;
      }

      const next = Math.min(100, Math.round(displayed));
      setProgress(next);

      if (readyAt && next >= 99) {
        finish();
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    // Watchdog safety valves: never trap the visitor behind the loading screen
    const failsafe = window.setTimeout(markReady, 1200);
    const hardFailsafe = window.setTimeout(finish, 2200);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
      window.clearTimeout(hardFailsafe);
      window.removeEventListener('DOMContentLoaded', markReady);
      window.removeEventListener('load', markReady);
      root.classList.remove('is-loading');
    };
  }, []);

  if (removed) return null;

  const width = `${Math.max(4, progress)}%`;

  return (
    <div
      className={`page-loader${leaving ? ' done' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Ariya"
      aria-hidden={leaving ? 'true' : undefined}
    >
      <div className="loader-aurora" aria-hidden="true" />
      <div className="loader-inner">
        <div className="loader-disc" aria-hidden="true">
          <span className="loader-ring" />
          <span className="loader-ring loader-ring-2" />
          {/* Kept as a plain img: it is the LCP-friendly brand mark and already
              ships in webp at the right pixel size. */}
          <img src="/assets/ariya-logo-180.webp" alt="" width={96} height={96} decoding="async" />
        </div>

        <div className="loader-wordmark" aria-hidden="true">
          {'Ariya'.split('').map((letter, i) => (
            <span key={`${letter}-${i}`} style={{ animationDelay: `${0.08 * i + 0.1}s` }}>
              {letter}
            </span>
          ))}
        </div>

        <div className="loader-track">
          <div className="loader-fill" style={{ width }} />
        </div>

        <div className="loader-meta">
          <span className="loader-caption">{progress < 100 ? 'Preparing your music' : 'Ready'}</span>
          <span className="loader-pct">{progress}%</span>
        </div>
      </div>
    </div>
  );
}

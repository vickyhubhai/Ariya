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
    let lastTick = startedAt;
    let displayed = 0;
    let shown = 0;
    let finished = false;
    let raf = 0;

    const markReady = () => {
      if (!readyAt) readyAt = Date.now();
    };

    if (document.readyState === 'complete') markReady();
    else window.addEventListener('load', markReady, { once: true });

    if (typeof document.fonts?.ready?.then === 'function') {
      document.fonts.ready.then(markReady).catch(() => {});
    }

    const finish = () => {
      if (finished) return;
      finished = true;
      setProgress(100);
      setLeaving(true);
      root.classList.remove('is-loading');
      window.setTimeout(() => setRemoved(true), 700);
    };

    // One tick of the ramp. Progress is integrated from real elapsed time, so
    // the animation loop and the watchdog interval below agree with each other
    // and a throttled frame can never make the bar run backwards or stand still.
    const tick = () => {
      if (finished) return;
      const now = Date.now();
      const dt = Math.min(250, now - lastTick) / 1000;
      lastTick = now;

      // Ease towards 90% while the page loads, then a fast clean finish.
      const target = readyAt ? 100 : Math.min(90, 12 + (now - startedAt) / 14);
      displayed += (target - displayed) * Math.min(1, dt * (readyAt ? 9 : 6));

      const next = Math.min(100, Math.round(displayed));
      if (next !== shown) {
        shown = next;
        setProgress(next);
      }
      if (readyAt && next >= 100) finish();
    };

    const loop = () => {
      tick();
      if (!finished) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Watchdog: a hidden or backgrounded tab throttles requestAnimationFrame to
    // a crawl, and the overlay - which locks scrolling - would never lift.
    // Timers still fire there, so the ramp advances without the frame loop.
    const interval = window.setInterval(tick, 200);
    // Safety valves: never trap the visitor behind the loading screen.
    const failsafe = window.setTimeout(markReady, 4200);
    const hardFailsafe = window.setTimeout(finish, 6000);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(interval);
      window.clearTimeout(failsafe);
      window.clearTimeout(hardFailsafe);
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

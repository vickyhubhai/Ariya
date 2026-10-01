'use client';

import { useEffect, useRef } from 'react';
import { siteConfig } from '@/lib/config';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * AdSense placement.
 *
 * The <ins> is created inside an effect instead of being rendered by React.
 * AdSense rewrites that element in place once the ad fills (it adds
 * data-adsbygoogle-status / data-ad-status and an iframe child), and React
 * then compares that mutated DOM against its own tree on the next client-side
 * segment render - which surfaces as a "Hydration failed" error. A React-owned
 * empty shell can never disagree, and the shell reserves the same 90px so the
 * layout still does not shift while the ad loads.
 *
 * The unit is only pushed when it scrolls near the viewport, exactly like the
 * inline script this replaces; blocked or missing ads leave the empty band.
 */
export default function AdSlot() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.style.minHeight = '90px';
    ins.setAttribute('data-ad-client', siteConfig.googleAdsense.client);
    ins.setAttribute('data-ad-slot', siteConfig.googleAdsense.slot);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    host.appendChild(ins);

    let pushed = false;
    const push = () => {
      if (pushed) return;
      pushed = true;
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        /* AdSense blocked or not loaded: the reserved space stays empty. */
      }
    };

    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === 'undefined') {
      window.addEventListener('load', push, { once: true });
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            observer?.disconnect();
            push();
          }
        },
        { rootMargin: '200px' },
      );
      observer.observe(ins);
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener('load', push);
      // AdSense keeps the node as its own container; detaching it stops the
      // slot from being re-requested when the route mounts this section again.
      if (ins.parentNode === host) host.removeChild(ins);
    };
  }, []);

  return (
    <div className="container ad-slot" style={{ paddingBottom: 60, textAlign: 'center' }}>
      <div ref={hostRef} style={{ width: '100%', minHeight: 90 }} />
    </div>
  );
}

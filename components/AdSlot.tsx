'use client';
 
import { memo, useEffect, useRef } from 'react';
import { siteConfig } from '@/lib/config';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * AdSense placement.
 *
 * AdSense and ad blockers (Brave Shields, uBlock) dynamically manipulate and rewrite
 * DOM nodes in place. We use `dangerouslySetInnerHTML={{ __html: '' }}` on the host element
 * so React's reconciler completely skips diffing its children during hydration and re-renders,
 * and wrap the component in `memo` so parent state changes never trigger re-renders.
 */
function AdSlotComponent() {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Reset host content to cleanly support React StrictMode double invocation
    host.innerHTML = '';

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
      if (host) {
        host.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="container ad-slot" style={{ paddingBottom: 60, textAlign: 'center' }} suppressHydrationWarning>
      <div
        ref={hostRef}
        style={{ width: '100%', minHeight: 90 }}
        dangerouslySetInnerHTML={{ __html: '' }}
        suppressHydrationWarning
      />
    </div>
  );
}

export default memo(AdSlotComponent);

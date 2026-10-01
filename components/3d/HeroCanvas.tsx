'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePointerParallax, usePrefersReducedMotion } from '@/lib/hooks';
import { useRelease } from '@/lib/release-context';
import { whenIdle } from '@/lib/utils';

const HeroScene = dynamic(() => import('./HeroScene'), { ssr: false, loading: () => null });

/**
 * Gate for the hero 3D layer.
 *
 * Nothing is created until the device tier says the GPU has headroom (low tier
 * also covers reduced motion, save-data, coarse pointers and no WebGL), the
 * bundle is fetched only once the main thread is idle, and the render loop is
 * parked as soon as the hero scrolls out of view.
 */
export default function HeroCanvas() {
  const { tier } = useRelease();
  const reducedMotion = usePrefersReducedMotion();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pointer = usePointerParallax(true);

  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(true);

  const enabled = tier === 'high' && !reducedMotion;

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    // Never compete with the hero paint / LCP image decode.
    whenIdle(() => {
      if (!cancelled) setMounted(true);
    }, 900);
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    const el = hostRef.current;
    if (!mounted || !el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => setInView(entries[0]?.isIntersecting ?? true), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [mounted]);

  if (!enabled) return null;

  return (
    <div ref={hostRef} className={`hero-canvas${ready ? ' ready' : ''}`} aria-hidden="true">
      {mounted ? <HeroScene pointer={pointer} frameloop={inView ? 'always' : 'never'} onReady={() => setReady(true)} /> : null}
    </div>
  );
}

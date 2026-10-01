'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePointerParallax, usePrefersReducedMotion } from '@/lib/hooks';
import { useRelease } from '@/lib/release-context';
import { whenIdle } from '@/lib/utils';
import type { SceneQuality } from './HeroScene';

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
  const [quality, setQuality] = useState<SceneQuality>('high');

  const enabled = tier === 'high' && !reducedMotion;

  // Park the observer on the host from the first client render, independent of
  // mounting, so the canvas only initialises while the hero is actually seen.
  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => setInView(entries[0]?.isIntersecting ?? true), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !inView || mounted) return;
    let cancelled = false;
    // Never compete with the hero paint / LCP image decode.
    whenIdle(() => {
      if (cancelled) return;
      // Narrower viewports get the simplified scene (fewer instances/particles).
      setQuality(window.innerWidth < 1100 ? 'medium' : 'high');
      setMounted(true);
    }, 900);
    return () => {
      cancelled = true;
    };
  }, [enabled, inView, mounted]);

  if (!enabled) return null;

  return (
    <div ref={hostRef} className={`hero-canvas${ready ? ' ready' : ''}`} aria-hidden="true">
      {mounted ? <HeroScene pointer={pointer} frameloop={inView ? 'always' : 'never'} quality={quality} onReady={() => setReady(true)} /> : null}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type { DeviceTier } from './types';
import { clamp } from './utils';

/** True once the component is hydrated (guards SSR-only rendering). */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

/**
 * Coarse device capability guess used to decide how much 3D to render.
 * "low" covers phones/small screens, few cores, data-saver and software that
 * asked for reduced motion - those get the CSS-only hero instead of a canvas.
 */
export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>('high');

  useEffect(() => {
    const nav = window.navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const smallOrCoarse = window.matchMedia('(max-width: 860px)').matches || !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const weakCpu = typeof nav.hardwareConcurrency === 'number' && nav.hardwareConcurrency <= 4;
    const weakMemory = typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4;
    const saveData = nav.connection?.saveData === true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noGl = !hasWebGL();

    setTier(smallOrCoarse || weakCpu || weakMemory || saveData || reduced || noGl ? 'low' : 'high');
  }, []);

  return tier;
}

export function useIsIOS(): boolean {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent || '';
    setIsIOS(/iPad|iPhone|iPod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1));
  }, []);

  return isIOS;
}

/** Normalised document scroll progress (0 at top, 1 at bottom), rAF-throttled. */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? clamp(window.scrollY / max) : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}

/**
 * Adds `visible` to an element the first time it scrolls into view - the React
 * version of the `.reveal` IntersectionObserver in the old `js/app.js`.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.1): { ref: RefObject<T | null>; visible: boolean } {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/** Pointer-driven parallax offsets, shared by the hero and the 3D rig. */
export function usePointerParallax(enabled: boolean) {
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  return target;
}

/** Runs `cb` when the browser is idle, falling back to a short timeout. */
export function useIdleCallback(cb: () => void, delay = 200): void {
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) cb();
    };
    const w = window as Window & { requestIdleCallback?: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number };
    if (typeof w.requestIdleCallback === 'function') w.requestIdleCallback(run, { timeout: 3000 });
    else window.setTimeout(run, delay);
    return () => {
      cancelled = true;
    };
  }, [cb, delay]);
}

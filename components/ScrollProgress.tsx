'use client';

import { useEffect, useRef } from 'react';
import { clamp } from '@/lib/utils';

/**
 * Reading-progress hairline under the header. Written straight to a CSS custom
 * property (no React state), so scrolling costs one attribute update per frame.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty('--progress', String(max > 0 ? clamp(window.scrollY / max) : 0));
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

  return <div className="scroll-progress" ref={ref} aria-hidden="true" />;
}

'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface TiltProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Max rotation in degrees. */
  yaw?: number;
  pitch?: number;
  /** Lift applied while hovering. */
  lift?: number;
  /** Clear the inline transform on leave (`.release-card` did this). */
  resetOnLeave?: boolean;
  /**
   * Fold in the scroll entrance so a card can be a tilt target and a reveal
   * target with one DOM node, exactly like the static markup.
   */
  reveal?: boolean;
  delay?: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Cursor-driven 3D tilt, ported from the `attachTilt` helper in `js/app.js`.
 * Only runs on precise pointers with motion allowed, and writes the transform
 * directly to the node so React never re-renders on mousemove.
 */
export default function Tilt({
  children,
  className = '',
  id,
  yaw = 8,
  pitch = 8,
  lift = 8,
  resetOnLeave = false,
  reveal = false,
  delay,
}: TiltProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const canTilt =
      window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canTilt) return;

    let pending = false;
    let last: PointerEvent | null = null;

    const apply = () => {
      pending = false;
      if (!last) return;
      const r = el.getBoundingClientRect();
      const x = (last.clientX - r.left) / r.width - 0.5;
      const y = (last.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * yaw}deg) rotateX(${-y * pitch}deg) translateY(-${lift}px)`;
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (pending) return;
      pending = true;
      requestAnimationFrame(apply);
    };

    const onLeave = () => {
      last = null;
      el.style.transform = resetOnLeave
        ? ''
        : 'perspective(800px) rotateY(0) rotateX(0) translateY(0)';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [lift, pitch, resetOnLeave, yaw]);

  // Scroll entrance on the same node, so a card stays a single DOM element.
  useEffect(() => {
    const el = ref.current;
    if (!el || !reveal) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reveal]);

  const classes = [
    className,
    reveal ? 'reveal' : '',
    reveal && delay ? `reveal-delay-${delay}` : '',
    reveal && visible ? 'visible' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} id={id} className={classes || undefined}>
      {children}
    </div>
  );
}

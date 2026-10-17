"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

/**
 * Progressive-enhancement scroll reveal.
 *
 * Content is fully visible in the server HTML. Animation is applied by toggling
 * a class directly on the DOM node (no React state, no re-renders), and is
 * skipped entirely when the user prefers reduced motion.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  id,
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches || typeof IntersectionObserver === "undefined") {
      node.classList.add("is-visible");
      return;
    }

    // Already on screen (above the fold): show immediately, never fade out.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.94) {
      return;
    }

    node.classList.add("reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(node);

    // Safety net: never leave content invisible if the observer misbehaves.
    const fallback = window.setTimeout(() => node.classList.add("is-visible"), 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      id={id}
      ref={ref}
      className={className}
      data-reveal=""
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}

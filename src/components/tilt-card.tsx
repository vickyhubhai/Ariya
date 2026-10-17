"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";

/**
 * Pointer-driven 3D tilt. Only attached on hover-capable pointers ≥ 1024px,
 * and disabled entirely when the user prefers reduced motion.
 */
export function TiltCard({
  children,
  className = "",
  intensity = 7,
  style,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;

    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    node.style.transform = `perspective(900px) rotateX(${(0.5 - py) * intensity}deg) rotateY(${
      (px - 0.5) * intensity
    }deg) translateY(-4px)`;
    node.style.setProperty("--pointer-x", `${px * 100}%`);
    node.style.setProperty("--pointer-y", `${py * 100}%`);
  }

  function reset() {
    const node = ref.current;
    if (!node) return;
    node.style.transform = "";
  }

  return (
    <div
      ref={ref}
      className={`tilt relative ${className}`}
      style={style}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <span className="tilt-glow" aria-hidden="true" />
      {children}
    </div>
  );
}

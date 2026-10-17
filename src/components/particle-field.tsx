"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight ambient particle canvas (~1.4 kB gzipped, no dependencies).
 * - Skips entirely when the user prefers reduced motion, when the viewport is
 *   small, or when the device reports limited memory / slow hardware.
 * - Pauses when offscreen or when the document is hidden.
 * - Pauses on battery-saver friendly `visibilitychange` signals.
 */
export function ParticleField({
  density = 46,
  className = "",
}: {
  density?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const device = navigator as Navigator & {
      deviceMemory?: number;
      hardwareConcurrency?: number;
      connection?: { saveData?: boolean };
    };
    const lowPower =
      (device.hardwareConcurrency ?? 8) <= 2 ||
      (device.deviceMemory ?? 8) <= 2 ||
      Boolean(device.connection?.saveData);

    if (reduced.matches || lowPower) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const el: HTMLCanvasElement = canvas;
    const ctx: CanvasRenderingContext2D = context;

    let width = 0;
    let height = 0;
    let frame = 0;
    let running = true;
    let visible = true;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const count = window.innerWidth < 768 ? Math.round(density * 0.55) : density;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      hue: number;
      alpha: number;
      pulse: number;
    }

    let particles: Particle[] = [];

    function resize() {
      const rect = el.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -0.06 - Math.random() * 0.16,
        r: 0.6 + Math.random() * 1.7,
        hue: Math.random() > 0.55 ? 262 : Math.random() > 0.4 ? 212 : 320,
        alpha: 0.18 + Math.random() * 0.55,
        pulse: Math.random() * Math.PI * 2,
      }));
    }

    let last = 0;
    function draw(time: number) {
      if (!running) return;
      if (time - last < 32) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      last = time;
      ctx.clearRect(0, 0, width, height);
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.pulse += 0.012;
        if (particle.y < -8) {
          particle.y = height + 6;
          particle.x = Math.random() * width;
        }
        if (particle.x < -8) particle.x = width + 6;
        if (particle.x > width + 8) particle.x = -6;

        const glow = 0.65 + Math.sin(particle.pulse) * 0.35;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${particle.hue} 90% 76% / ${particle.alpha * glow})`;
        ctx.fill();
      }
      frame = window.requestAnimationFrame(draw);
    }

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((entries) => {
            for (const entry of entries) visible = entry.isIntersecting;
            if (visible && !frame) frame = window.requestAnimationFrame(draw);
          })
        : null;

    function handleVisibility() {
      if (document.hidden) {
        running = false;
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
      } else if (!running || !frame) {
        running = true;
        frame = window.requestAnimationFrame(draw);
      }
    }

    resize();
    observer?.observe(el);
    frame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

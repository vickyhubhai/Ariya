"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Ariya-branded first-paint experience.
 *
 * The overlay is `pointer-events-none` and auto-dismisses via CSS animation
 * even if JavaScript never runs, so it can never block the site shell. It is
 * skipped for users who prefer reduced motion and after the first view in a
 * session. No data is stored beyond a sessionStorage flag in this tab.
 */
export function BrandLoader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem("ariya:intro-seen") === "1";
      window.sessionStorage.setItem("ariya:intro-seen", "1");
    } catch {
      seen = false;
    }
    if (reduced || seen) {
      window.setTimeout(() => setHidden(true), 0);
      return;
    }
    const timer = window.setTimeout(() => setHidden(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-[#05050a]"
      style={{ animation: "ariyaLoaderOut 0.45s ease 0.75s forwards" }}
      aria-hidden="true"
    >
      <div className="pointer-events-none flex flex-col items-center">
        <div className="relative h-[136px] w-[136px]">
          <span className="absolute inset-[-14px] animate-pulse rounded-full bg-violet-500/20 blur-2xl" />
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
            style={{
              background: [
                "repeating-radial-gradient(circle at center, rgba(255,255,255,0.05) 0 1px, transparent 1px 6px)",
                "conic-gradient(from 0deg, rgba(255,255,255,0.10), transparent 25%, rgba(139,92,246,0.14) 50%, transparent 75%, rgba(255,255,255,0.10))",
                "radial-gradient(circle at 50% 38%, #1a1628, #0b0a12 72%)",
              ].join(", "),
              animation: "ariyaVinylSpin 1.2s linear infinite",
            }}
          />
          <Image
            src="/assets/ariya_logo.png"
            alt=""
            width={62}
            height={62}
            priority
            className="absolute left-1/2 top-1/2 h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 rounded-[26%] border border-white/10"
          />
        </div>
        <p className="mt-5 text-[0.62rem] font-medium uppercase tracking-[0.4em] text-white/40">
          Music Beyond Limits
        </p>
      </div>
      <style>{`
        @keyframes ariyaLoaderOut { to { opacity: 0; visibility: hidden; } }
        @keyframes ariyaVinylSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

/** Small inline spinner for route-level loading states. */
export function RouteSkeleton({ label = "Loading Ariya" }: { label?: string }) {
  return (
    <div className="container-page section" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="skeleton h-9 w-9 rounded-xl" />
        <span className="skeleton h-4 w-40" />
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((key) => (
          <div key={key} className="glass card-radius p-5">
            <span className="skeleton block h-3 w-24" />
            <span className="skeleton mt-3 block h-6 w-3/4" />
            <span className="skeleton mt-3 block h-20 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

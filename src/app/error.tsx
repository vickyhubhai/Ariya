"use client";

import Link from "next/link";
import { useEffect } from "react";
import { IconArrowRight, IconRefresh } from "@/components/icons";

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the console useful without shipping error data anywhere.
    console.error("Ariya page error:", error.message);
  }, [error]);

  return (
    <section className="relative overflow-hidden pt-[calc(var(--nav-height)+4rem)] pb-24">
      <div className="container-page relative flex flex-col items-center text-center">
        <p className="kicker">Something went wrong</p>
        <h1 className="h2 mt-4 max-w-xl">This page hit a wrong note</h1>
        <p className="lede mt-3 max-w-lg text-sm">
          A section failed to render. You can retry, return to the homepage, or download directly from
          the official GitHub releases page — the download never depends on this page.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn btn-primary" onClick={reset}>
            <IconRefresh size={15} /> Try again
          </button>
          <Link href="/" className="btn btn-glass">
            Back to home <IconArrowRight size={14} />
          </Link>
          <a
            href="https://github.com/vickyhubhai/Ariya/releases/latest"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost"
          >
            GitHub releases
          </a>
        </div>
      </div>
    </section>
  );
}

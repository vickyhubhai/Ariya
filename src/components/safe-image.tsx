"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Image with a graceful failure state.
 *
 * News artwork is proxied from third parties; if an upstream asset disappears
 * or exceeds the proxy limits, the card keeps its layout and shows a branded
 * gradient instead of a broken-image icon.
 */
export function SafeImage({
  src,
  alt,
  sizes,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(145deg,#2a1a55,#0d1b3a_60%,#0a0a13)]"
      >
        <span className="text-3xl">🎵</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

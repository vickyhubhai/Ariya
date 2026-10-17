import Image from "next/image";

/**
 * The official Ariya brand logo (`public/assets/ariya_logo.png`).
 * It is displayed at its native 1:1 aspect ratio and is never recoloured,
 * cropped or distorted — only scaled and given a cosmetic glow.
 */
export function BrandLogo({
  size = 64,
  priority = false,
  className = "",
  glow = true,
}: {
  size?: number;
  priority?: boolean;
  className?: string;
  glow?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow ? (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-[28%] bg-[radial-gradient(circle,rgba(139,92,246,0.55),transparent_70%)] blur-md"
        />
      ) : null}
      <Image
        src="/assets/ariya_logo.png"
        alt="Ariya Music Player logo"
        width={size}
        height={size}
        priority={priority}
        sizes={`${size}px`}
        className="relative h-full w-full rounded-[24%] object-contain"
        style={{ width: size, height: size }}
      />
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="text-[1.02rem] font-semibold tracking-[0.02em] text-white">ARIYA</span>
      <span className="mt-1 text-[0.58rem] font-medium uppercase tracking-[0.28em] text-white/45">
        Music Player
      </span>
    </span>
  );
}

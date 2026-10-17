import type { ReactNode } from "react";

/**
 * Ariya interface preview, rendered as an HTML/CSS device mockup.
 *
 * These are illustrative UI previews built from the layout described in the
 * official release notes (Haze Glass shell, floating mini-player, synced
 * lyrics). They are decorative and never presented as captured screenshots —
 * real device captures live in the GitHub release posts that this site links to.
 */

const artStyles = [
  "linear-gradient(145deg,#6d3ff0 0%,#a855f7 40%,#f472b6 100%)",
  "linear-gradient(145deg,#0ea5e9 0%,#3b82f6 45%,#8b5cf6 100%)",
  "linear-gradient(145deg,#f43f5e 0%,#8b5cf6 60%,#1e1b4b 100%)",
  "linear-gradient(145deg,#22d3ee 0%,#6366f1 55%,#312e81 100%)",
];

export type ScreenVariant = "home" | "player" | "lyrics";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 text-[9px] font-medium text-white/70">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="inline-block h-2 w-2.5 rounded-[2px] border border-white/50" />
        <span className="inline-block h-2 w-3 rounded-[2px] border border-white/50" />
        <span className="inline-block h-2 w-4 rounded-[2px] bg-white/60" />
      </span>
    </div>
  );
}

function ArtTile({ style, size = "md" }: { style: string; size?: "sm" | "md" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-[0_10px_24px_-10px_rgba(0,0,0,0.8)] ${
        size === "sm" ? "h-10 w-10" : "aspect-square w-full"
      }`}
      style={{ background: style }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(255,255,255,0.45),transparent_55%)]" />
      <div className="absolute inset-0 opacity-35 [background-image:repeating-linear-gradient(115deg,transparent_0_7px,rgba(255,255,255,0.18)_7px_8px)]" />
      {size === "md" ? (
        <svg viewBox="0 0 24 24" className="absolute inset-0 m-auto h-8 w-8 text-white/80" fill="currentColor" aria-hidden="true">
          <path d="M12 3v12.4a3.1 3.1 0 1 0 1.6 2.7V7.6l5-1.5v7.3a3.1 3.1 0 1 0 1.6 2.7V3.6L12 5.4V3Z" />
        </svg>
      ) : null}
    </div>
  );
}

function MiniPlayer() {
  return (
    <div className="absolute inset-x-3 bottom-16 z-10 flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 p-2.5 backdrop-blur-md">
      <ArtTile style={artStyles[0]} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-semibold text-white">Red Moon</p>
        <p className="truncate text-[9px] text-white/55">Ariya Sessions</p>
        <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-violet-300 to-sky-300" />
        </div>
      </div>
      <span className="grid h-7 w-7 place-items-center rounded-full bg-white/15">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor" aria-hidden="true">
          <path d="M7 4.8v14.4L19 12 7 4.8Z" />
        </svg>
      </span>
    </div>
  );
}

function BottomNav() {
  const items = ["Home", "Search", "Library"];
  return (
    <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between rounded-2xl border border-white/15 bg-black/35 px-4 py-2.5 backdrop-blur-md">
      {items.map((label, index) => (
        <span
          key={label}
          className={`text-[8px] font-medium ${index === 0 ? "text-white" : "text-white/45"}`}
        >
          {label}
        </span>
      ))}
      <span className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-300 to-sky-300 opacity-90" />
    </div>
  );
}

function HomeScreen() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <StatusBar />
      <div className="px-4 pt-4">
        <p className="text-[8px] uppercase tracking-[0.22em] text-white/45">Good evening</p>
        <p className="mt-0.5 text-[15px] font-semibold tracking-tight text-white">Music Beyond Limits</p>
        <div className="mt-2.5 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur">
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-white/60" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 4 4" />
          </svg>
          <span className="text-[9px] text-white/50">Songs, artists, albums…</span>
        </div>
        <div className="mt-2.5 flex gap-1.5">
          {["Made for you", "Charts", "Lossless"].map((chip, index) => (
            <span
              key={chip}
              className={`rounded-full px-2 py-1 text-[8px] ${
                index === 0 ? "bg-white text-black" : "border border-white/15 bg-white/8 text-white/65"
              }`}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-3 px-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-white/90">Made for you</p>
          <span className="text-[8px] text-white/40">See all</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {artStyles.slice(0, 3).map((style, index) => (
            <div key={index}>
              <ArtTile style={style} />
              <p className="mt-1 truncate text-[8px] font-medium text-white/80">
                {["Daily Mix 1", "Night Drive", "Afterglow"][index]}
              </p>
              <p className="truncate text-[7px] text-white/40">Ariya</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/6 p-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-400/80 to-sky-400/70 text-[9px] text-black">
            ⚡
          </span>
          <div>
            <p className="text-[9px] font-medium text-white/85">Lossless available</p>
            <p className="text-[7px] text-white/45">FLAC when the source supports it</p>
          </div>
        </div>
      </div>
      <MiniPlayer />
      <BottomNav />
    </div>
  );
}

function PlayerScreen() {
  return (
    <div className="absolute inset-0 flex flex-col">
      <StatusBar />
      <div className="flex items-center justify-between px-5 pt-4 text-white/60">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
        <span className="text-[8px] uppercase tracking-[0.2em]">Now playing</span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </div>
      <div className="relative mx-5 mt-5">
        <div
          className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-[0_24px_50px_-18px_rgba(0,0,0,0.9)]"
          style={{ background: "linear-gradient(145deg,#8b5cf6 0%,#f472b6 45%,#312e81 100%)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_55%)]" />
          <div className="absolute inset-0 opacity-25 [background-image:repeating-linear-gradient(115deg,transparent_0_9px,rgba(255,255,255,0.25)_9px_10px)]" />
          <div className="absolute inset-0 grid place-items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full border border-white/30 bg-white/15 backdrop-blur">
              <span className="eq text-white" aria-hidden="true"><span /><span /><span /><span /></span>
            </span>
          </div>
        </div>
      </div>
      <div className="mt-4 px-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[13px] font-semibold leading-tight text-white">Red Moon</p>
            <p className="text-[9px] text-white/50">Ariya Sessions · Lossless</p>
          </div>
          <span className="mt-0.5 rounded-full border border-white/20 px-2 py-0.5 text-[7px] uppercase tracking-wider text-white/70">
            FLAC
          </span>
        </div>
        <div className="mt-3">
          <div className="relative h-[3px] w-full rounded-full bg-white/15">
            <div className="absolute inset-y-0 left-0 w-[46%] rounded-full bg-gradient-to-r from-violet-200 to-sky-300" />
            <span className="absolute -top-[3px] left-[46%] h-[9px] w-[9px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]" />
          </div>
          <div className="mt-1.5 flex justify-between text-[7px] text-white/40">
            <span>1:48</span>
            <span>3:52</span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between px-8 text-white/80">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M3.5 7h3.2l3.6 5M3.5 17h3.2l9-10h3.4" />
          <path d="m16 4.5 3 2.5-3 2.5M16 14.5l3 2.5-3 2.5" />
        </svg>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M18 5.2v13.6L8 12l10-6.8ZM7 5H5v14h2V5Z" />
        </svg>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-black shadow-[0_10px_24px_-8px_rgba(255,255,255,0.6)]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M9 5v14M15 5v14" />
          </svg>
        </span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M6 5.2v13.6L16 12 6 5.2ZM17 5h2v14h-2V5Z" />
        </svg>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M6 6h10.5a3 3 0 0 1 3 3v1.5M18 18H7.5a3 3 0 0 1-3-3v-1.5" />
          <path d="m14 3 2.5 3L14 9M10 15l-2.5 3L10 21" />
        </svg>
      </div>
      <div className="mx-4 mt-4 rounded-2xl border border-white/12 bg-white/8 p-2.5 backdrop-blur">
        <p className="text-[7px] uppercase tracking-[0.18em] text-white/40">Lyrics</p>
        <p className="mt-1 text-[9px] leading-relaxed text-white/55">
          Under the red moon, we drift…
        </p>
        <p className="text-[9px] font-semibold leading-relaxed text-white">
          Every limit fades away
        </p>
      </div>
    </div>
  );
}

function LyricsScreen() {
  const lines = [
    { text: "City lights are fading slow", active: false },
    { text: "Static humming on the radio", active: false },
    { text: "Every limit fades away", active: true },
    { text: "Under a red moon we will stay", active: false },
    { text: "Turn the haze up, let it glow", active: false },
  ];
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 opacity-70"
        style={{ background: "linear-gradient(160deg,#4c1d95 0%,#1e1b4b 55%,#0a0a13 100%)" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(139,92,246,0.5),transparent_60%)]" />
      <div className="relative flex h-full flex-col">
        <StatusBar />
        <div className="flex items-center justify-between px-5 pt-4">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m6 9 6 6 6-6" />
          </svg>
          <span className="text-[8px] uppercase tracking-[0.2em] text-white/60">Lyrics</span>
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[7px] text-white/60">Synced</span>
        </div>
        <div className="mx-5 mt-4 flex items-center gap-2.5">
          <ArtTile style={artStyles[2]} size="sm" />
          <div>
            <p className="text-[10px] font-semibold text-white">Red Moon</p>
            <p className="text-[8px] text-white/50">Ariya Sessions</p>
          </div>
        </div>
        <div className="mt-5 flex-1 space-y-2.5 px-6">
          {lines.map((line) => (
            <p
              key={line.text}
              className={
                line.active
                  ? "text-[12px] font-semibold leading-snug text-white drop-shadow-[0_0_18px_rgba(196,181,253,0.65)]"
                  : "text-[10px] leading-snug text-white/40"
              }
            >
              {line.text}
            </p>
          ))}
        </div>
        <div className="mx-4 mb-4 rounded-2xl border border-white/15 bg-black/35 p-2.5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[7px] uppercase tracking-[0.16em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Provider settings
            </span>
            <span className="text-[7px] text-white/35">Fallback order</span>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-white/8 px-2 py-1.5">
            <span className="font-mono text-[8px] text-white/60">••••••••••••</span>
            <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[7px] text-white/70">Veiled</span>
          </div>
        </div>
        <MiniPlayer />
      </div>
    </div>
  );
}

const screens: Record<ScreenVariant, () => ReactNode> = {
  home: HomeScreen,
  player: PlayerScreen,
  lyrics: LyricsScreen,
};

export function PhoneMockup({
  variant = "home",
  className = "",
  showReflection = true,
  glow = true,
}: {
  variant?: ScreenVariant;
  className?: string;
  showReflection?: boolean;
  glow?: boolean;
}) {
  const Screen = screens[variant];
  return (
    <div
      className={`phone-body ${glow ? "glow-ring" : ""} ${className}`}
      role="img"
      aria-label={`Ariya ${
        variant === "home" ? "home" : variant === "player" ? "now playing" : "synced lyrics"
      } interface preview`}
    >
      <div className="phone-screen aspect-[9/19.2] w-full">
        <span className="phone-notch" aria-hidden="true" />
        <Screen />
        {showReflection ? <span className="phone-reflection" aria-hidden="true" /> : null}
      </div>
    </div>
  );
}

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    focusable: false as const,
    ...props,
  };
}

export function IconPlay(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 4.8v14.4a1 1 0 0 0 1.53.85l11-7.2a1 1 0 0 0 0-1.7l-11-7.2A1 1 0 0 0 7 4.8Z" />
    </svg>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5" />
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function IconGithub(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={0} fill="currentColor">
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.67.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.32-3.79-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.68.08-.68 1.12.08 1.72 1.15 1.72 1.15 1 1.72 2.63 1.22 3.27.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.24 1.15-3.03-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.1 1.15a10.6 10.6 0 0 1 5.64 0c2.15-1.45 3.1-1.15 3.1-1.15.61 1.54.23 2.68.11 2.96.71.79 1.14 1.8 1.14 3.03 0 4.33-2.63 5.28-5.14 5.56.4.35.76 1.03.76 2.08v3.09c0 .3.2.65.78.54a11.26 11.26 0 0 0 7.68-10.67C23.25 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14m0 0-5.5-5.5M19 12l-5.5 5.5" />
    </svg>
  );
}

export function IconArrowUpRight(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

export function IconLyrics(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 6h14M5 10h10M5 14h12M5 18h7" />
      <path d="M18.5 13.5v4.2a1.8 1.8 0 1 0 1.5 1.78" />
    </svg>
  );
}

export function IconQueue(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h11M4 12h11M4 18h7" />
      <path d="M19 10v8.2a1.8 1.8 0 1 0 1.5 1.78" />
      <circle cx="18" cy="8" r="1.5" />
    </svg>
  );
}

export function IconLossless(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 14v-4m4 8V6m4 12V6m4 8v-4m4 6V8" />
    </svg>
  );
}

export function IconQuality(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 12a8 8 0 0 1 16 0" />
      <path d="M7.5 15.5a5 5 0 0 1 9 0" />
      <circle cx="12" cy="18.5" r="1.4" />
      <path d="M4 12h2.5M17.5 12H20" />
    </svg>
  );
}

export function IconPlaylist(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="3" />
      <path d="M7.5 9h6M7.5 13h9M7.5 17h5" />
    </svg>
  );
}

export function IconDiscord(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={0} fill="currentColor">
      <path d="M19.5 5.34A16.3 16.3 0 0 0 15.5 4l-.35.68a13 13 0 0 1 3.2 1.02 12 12 0 0 0-4.35-.77 12 12 0 0 0-4.35.77 13 13 0 0 1 3.2-1.02L12.5 4a16.3 16.3 0 0 0-4 1.34C5.9 9.4 5.3 12.6 5.5 16a16.5 16.5 0 0 0 5 2.5l.7-1.1a10 10 0 0 1-1.7-.8l.4-.32a11.6 11.6 0 0 0 8.2 0l.4.32a10 10 0 0 1-1.7.8l.7 1.1a16.5 16.5 0 0 0 5-2.5c.25-3.9-.5-7.1-2.5-10.66ZM9.9 14a1.5 1.5 0 0 1-1.4-1.6A1.5 1.5 0 0 1 9.9 10.8a1.5 1.5 0 0 1 1.4 1.6A1.5 1.5 0 0 1 9.9 14Zm4.2 0a1.5 1.5 0 0 1-1.4-1.6 1.5 1.5 0 0 1 1.4-1.6 1.5 1.5 0 0 1 1.4 1.6A1.5 1.5 0 0 1 14.1 14Z" />
    </svg>
  );
}

export function IconSparkles(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3.5l1.6 4.2 4.2 1.6-4.2 1.6L12 15.1l-1.6-4.2L6.2 9.3l4.2-1.6L12 3.5Z" />
      <path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2Z" />
    </svg>
  );
}

export function IconDevice(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.6" />
      <path d="M10.8 5.5h2.4" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

export function IconShield(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3 5 5.8v5.5c0 4.4 2.9 7.6 7 9.7 4.1-2.1 7-5.3 7-9.7V5.8L12 3Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}

export function IconAndroid(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 9.5h11a1 1 0 0 1 1 1v5a3 3 0 0 1-3 3h-7a3 3 0 0 1-3-3v-5a1 1 0 0 1 1-1Z" />
      <path d="M8.5 9.5 6.8 5.7M15.5 9.5l1.7-3.8" />
      <path d="M3.8 11.5v5M20.2 11.5v5" />
      <circle cx="9.6" cy="13" r=".7" fill="currentColor" stroke="none" />
      <circle cx="14.4" cy="13" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTv(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
      <path d="M8.5 21h7" />
    </svg>
  );
}

export function IconCpu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="6.5" y="6.5" width="11" height="11" rx="2.2" />
      <path d="M10 10h4v4h-4z" />
      <path d="M4 10h2.5M4 14h2.5M17.5 10H20M17.5 14H20M10 4v2.5M14 4v2.5M10 17.5V20M14 17.5V20" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M20 11a8 8 0 1 0-2.6 6.4" />
      <path d="M20 4.5V11h-6.2" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4.5 12.5 5 5L19.5 7" />
    </svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 4.5 3.5 19h17L12 4.5Z" />
      <path d="M12 10v4.2M12 16.6v.4" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconChevron(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconExternal(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 13.5V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V7.5A1.5 1.5 0 0 1 5 6h5.5" />
    </svg>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M15 6.5A2.5 2.5 0 0 0 12.5 4H6.5A2.5 2.5 0 0 0 4 6.5v6A2.5 2.5 0 0 0 6.5 15" />
    </svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M9 5v14M15 5v14" />
    </svg>
  );
}

export function IconNext(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={0} fill="currentColor">
      <path d="M6 5.2v13.6L16 12 6 5.2ZM17 5h2v14h-2V5Z" />
    </svg>
  );
}

export function IconPrev(props: IconProps) {
  return (
    <svg {...base(props)} strokeWidth={0} fill="currentColor">
      <path d="M18 5.2v13.6L8 12l10-6.8ZM7 5H5v14h2V5Z" />
    </svg>
  );
}

export function IconShuffle(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 7h3.2l3.6 5M3.5 17h3.2l9-10h3.4" />
      <path d="m16 4.5 3 2.5-3 2.5M16 14.5l3 2.5-3 2.5" />
      <path d="M15.5 12H14" />
    </svg>
  );
}

export function IconRepeat(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 6h10.5a3 3 0 0 1 3 3v1.5M18 18H7.5a3 3 0 0 1-3-3v-1.5" />
      <path d="m14 3 2.5 3L14 9M10 15l-2.5 3L10 21" />
    </svg>
  );
}

export function IconHome(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="m4 10.5 8-6 8 6V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z" />
      <path d="M9.5 20.5v-6h5v6" />
    </svg>
  );
}

export function IconLibrary(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 5v14M8.5 5v14M13 5v14" />
      <path d="m16.5 6.5 4 12" />
    </svg>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 21c3.6 0 6-2.4 6-5.6 0-4-4-5.9-4.5-11.4-2.5 1.4-4 3.9-4 6.2 0 1.4-.8 2-1.6 1.4-.7-.6-1-1.5-1-2.6C5.6 10.6 6 12.4 6 15.4 6 18.6 8.4 21 12 21Z" />
    </svg>
  );
}

export function IconEqualizer(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4v16M12 4v16M18 4v16" />
      <circle cx="6" cy="9" r="1.8" fill="#0a0a13" />
      <circle cx="12" cy="15" r="1.8" fill="#0a0a13" />
      <circle cx="18" cy="8" r="1.8" fill="#0a0a13" />
    </svg>
  );
}

export const featureIcons = {
  play: IconPlay,
  search: IconSearch,
  lyrics: IconLyrics,
  queue: IconQueue,
  lossless: IconLossless,
  quality: IconQuality,
  playlist: IconPlaylist,
  discord: IconDiscord,
  sparkles: IconSparkles,
  device: IconDevice,
} as const;

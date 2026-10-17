/**
 * Central brand, navigation and copy configuration.
 *
 * Everything factual here is derived from the official Ariya GitHub repository
 * (README, releases) and the official Ariya_news repository. Release versions,
 * dates, APK names, sizes and download URLs are NEVER defined here — they are
 * fetched live from the GitHub API (see `src/lib/github.ts`).
 */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ariyamusic.us.ci"
).replace(/\/$/, "");

export const site = {
  name: "Ariya Music Player",
  shortName: "Ariya",
  tagline: "Music Beyond Limits",
  description:
    "Ariya is a free and open-source Android music player with synced lyrics, FLAC lossless playback, multiple audio sources, playlists and full queue control. Android 8.0+.",
  url: SITE_URL,
  locale: "en_US",
  themeColor: "#7c5cfc",
  developer: "Vicky",
  studio: "Astrix Team",
  license: "MIT License",
  minAndroid: "Android 8.0 (API 26) or newer",
  logo: "/assets/ariya_logo.png",
  logoMark: "/assets/ariya-logo-240.png",
  icon: "/assets/icon-512.png",
  ogImage:
    "/api/news/artwork?src=https%3A%2F%2F6ab968ee57212ca6e1e98063.imgix.net%2Fsandbox%2F1000394318.png&w=1200",
  ogImageAlt: "Ariya v1.2.0 “Red Moon” release artwork with the Ariya logo",
} as const;

export const repo = {
  owner: "vickyhubhai",
  name: "Ariya",
  newsOwner: "vickyhubhai",
  newsName: "Ariya_news",
} as const;

export const links = {
  repo: `https://github.com/${repo.owner}/${repo.name}`,
  issues: `https://github.com/${repo.owner}/${repo.name}/issues`,
  releases: `https://github.com/${repo.owner}/${repo.name}/releases`,
  latestRelease: `https://github.com/${repo.owner}/${repo.name}/releases/latest`,
  license: `https://github.com/${repo.owner}/${repo.name}/blob/main/LICENSE`,
  readme: `https://github.com/${repo.owner}/${repo.name}#readme`,
  newsRepo: `https://github.com/${repo.owner}/${repo.newsName}`,
  newsContent: `https://github.com/${repo.owner}/${repo.newsName}/tree/main/content`,
  developer: `https://github.com/${repo.owner}`,
  compareChangelog: `https://github.com/${repo.owner}/${repo.name}/compare`,
} as const;

export const navLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#showcase", label: "Showcase" },
  { href: "/#whats-new", label: "What’s New" },
  { href: "/releases", label: "Releases" },
  { href: "/news", label: "News" },
  { href: "/guide", label: "Guide" },
  { href: "/about", label: "About" },
] as const;

export const footerGroups = [
  {
    title: "Product",
    links: [
      { href: "/#features", label: "Features" },
      { href: "/#showcase", label: "Interface showcase" },
      { href: "/#whats-new", label: "What’s new" },
      { href: "/download", label: "Download" },
      { href: "/releases", label: "Release history" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: "/news", label: "Developer news" },
      { href: "/guide", label: "User guide" },
      { href: "/about", label: "About Ariya" },
      { href: "/developer", label: "About the developer" },
      { href: "/#faq", label: "FAQ" },
      { href: links.repo, label: "GitHub repository", external: true },
      { href: links.newsContent, label: "News source", external: true },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: links.releases, label: "GitHub Releases", external: true },
      { href: links.issues, label: "Report an issue", external: true },
      { href: links.license, label: "MIT License", external: true },
      { href: "/llms.txt", label: "llms.txt", external: true },
      { href: "/sitemap.xml", label: "Sitemap", external: true },
    ],
  },
] as const;

export type FeatureIcon =
  | "play"
  | "search"
  | "lyrics"
  | "queue"
  | "lossless"
  | "quality"
  | "playlist"
  | "discord"
  | "sparkles"
  | "device";

export interface Feature {
  icon: FeatureIcon;
  title: string;
  description: string;
  meta: string;
}

/** Verified capabilities, sourced from the official README and release notes. */
export const features: Feature[] = [
  {
    icon: "play",
    title: "Gapless, crossfade playback",
    description:
      "Smooth audio playback with gapless and crossfade transitions, background playback and media controls, so albums and DJ sets never break.",
    meta: "Playback",
  },
  {
    icon: "search",
    title: "Music discovery",
    description:
      "Search songs, artists, albums and playlists through multiple supported sources and play them straight from the results.",
    meta: "Discovery",
  },
  {
    icon: "lyrics",
    title: "Synced lyrics",
    description:
      "Follow the current line in time with the music. Lyrics come from supported providers, with configurable fallback ordering.",
    meta: "Lyrics",
  },
  {
    icon: "lossless",
    title: "FLAC & lossless",
    description:
      "When a source offers lossless audio, Ariya can play FLAC. Availability depends on the source and the specific track.",
    meta: "Audio",
  },
  {
    icon: "quality",
    title: "Audio quality control",
    description:
      "Pick from low, normal, high and ultra-high quality, with lossless where available, plus a parametric EQ in the v1.2.0 release line.",
    meta: "Audio",
  },
  {
    icon: "queue",
    title: "Full queue management",
    description:
      "Reorder, remove, play next, shuffle and repeat. UID-based queue operations keep drag-and-drop reliable.",
    meta: "Controls",
  },
  {
    icon: "playlist",
    title: "Playlists & library",
    description:
      "Build and manage personal playlists, browse your library, and revisit recently played tracks and local songs.",
    meta: "Library",
  },
  {
    icon: "discord",
    title: "Discord Rich Presence",
    description:
      "Optionally show what you are listening to on Discord through the app’s Discord integration.",
    meta: "Integration",
  },
  {
    icon: "sparkles",
    title: "Haze Glass design system",
    description:
      "A dark-first interface with real backdrop blur, configurable blur radius and glass opacity, and fluid morphing controls.",
    meta: "Design",
  },
  {
    icon: "device",
    title: "Built for Android",
    description:
      "Native Jetpack Compose UI, ARM64 and universal builds, plus TV-oriented APKs published alongside phone releases.",
    meta: "Platform",
  },
];

/** Interface preview screens rendered as HTML/CSS mockups, not captures. */
export const showcaseScreens = [
  {
    id: "home",
    label: "Home",
    blurb:
      "Discovery shelves, quick picks and a floating Haze Glass mini-player — the layout described in the v1.2.0 release notes.",
  },
  {
    id: "player",
    label: "Player",
    blurb:
      "Full-screen artwork, queue controls and synced lyrics that follow the current line while you listen.",
  },
  {
    id: "lyrics",
    label: "Lyrics",
    blurb:
      "Synced lyrics from supported providers, with a configurable provider order and API-key dialog for opt-in providers.",
  },
] as const;

export const requirements = [
  { label: "Platform", value: "Android" },
  { label: "Minimum version", value: "Android 8.0 (API 26) or newer" },
  { label: "Architecture", value: "ARM64, ARMv7, x86 and x86_64 (build dependent)" },
  { label: "Storage", value: "Approximately 30 MB, plus cached audio" },
  { label: "Network", value: "Required for discovery and streaming" },
  { label: "Price", value: "Free, open source (MIT License)" },
];

export const installSteps = [
  {
    title: "Pick the right build",
    body: "Choose a GMS or FOSS build and the architecture that matches your device. If you are unsure, the Universal APK is the safest choice.",
  },
  {
    title: "Download from GitHub Releases",
    body: "Every download link on this site points at the official browser_download_url of a stable GitHub release. No mirrors, no re-hosting.",
  },
  {
    title: "Allow installation",
    body: "Open the downloaded APK. Android may ask you to allow installs from your browser or file manager. That permission is managed by Android.",
  },
  {
    title: "Launch Ariya",
    body: "Open Ariya and start browsing. Updates ship as new APKs; install a newer release over the previous one.",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faq: FaqItem[] = [
  {
    question: "What is Ariya Music Player?",
    answer:
      "Ariya is a free, open-source music player for Android. It focuses on playback quality, synced lyrics, playlists, queue control and a dark-first glass interface. It is developed by Vicky and the Astrix Team and distributed through the official vickyhubhai/Ariya GitHub repository.",
  },
  {
    question: "Which platforms does Ariya support?",
    answer:
      "Ariya runs on Android 8.0 (API 26) and newer. Release assets include ARM64 and Universal phone APKs and TV-oriented universal APKs, with both GMS (Google Mobile Services) and FOSS flavours. The project does not publish an iOS, Windows or macOS build.",
  },
  {
    question: "How do I download and install Ariya?",
    answer:
      "Open the latest stable release on this site or on GitHub Releases, download the APK that matches your device, open the file, allow installation when Android asks, and launch Ariya. The Universal APK works when you are unsure about the CPU architecture.",
  },
  {
    question: "What is the difference between GMS and FOSS builds?",
    answer:
      "GMS builds are intended for devices with Google Mobile Services. FOSS builds are published for setups that prefer a free-software flavour. Both are produced from the same public repository and both are listed as assets on the same stable release, so the version and changelog always match.",
  },
  {
    question: "Is Ariya free and open source?",
    answer:
      "Yes. Ariya is released under the MIT License and the full source code is public on GitHub. You can read the code, open issues and review every release.",
  },
  {
    question: "Where do the APK files come from?",
    answer:
      "Every APK is published by the Ariya project on GitHub Releases. This website only links to those official release assets; it does not re-host, modify or sign them.",
  },
  {
    question: "Does Ariya support lossless audio and lyrics?",
    answer:
      "Ariya supports FLAC playback and multiple quality levels, and it displays synced lyrics. Both depend on the source and the specific track, so availability is not guaranteed for every song.",
  },
  {
    question: "Does this website collect my personal data?",
    answer:
      "This website does not ask you to sign in, does not use advertising trackers and does not store personal profiles. Release and news metadata is fetched server-side from the public GitHub API and cached briefly to stay inside GitHub rate limits.",
  },
  {
    question: "How do I report a bug or request a feature?",
    answer:
      "Use the official GitHub issue tracker at github.com/vickyhubhai/Ariya/issues. Include your device model, Android version, the Ariya build you installed and clear reproduction steps.",
  },
  {
    question: "Is Ariya affiliated with Spotify, YouTube or Discord?",
    answer:
      "No. Ariya is an independent project. It is not affiliated with or endorsed by Spotify, YouTube, Google, Discord or any other third-party music service.",
  },
];

export const entityFacts = [
  { label: "Product", value: "Ariya Music Player" },
  { label: "Category", value: "Android music player (software)" },
  { label: "Developer", value: "Vicky — Astrix Team" },
  { label: "First stable release", value: "v1.0.0 (2026)" },
  { label: "License", value: "MIT License" },
  { label: "Distribution", value: "GitHub Releases (APK)" },
  { label: "Official site", value: "ariyamusic.us.ci" },
  { label: "Source code", value: "github.com/vickyhubhai/Ariya" },
];

/* ------------------------------------------------------------------ */
/* Gallery: genuine in-app screenshots + genuine release artwork        */
/* ------------------------------------------------------------------ */

export interface GalleryItem {
  id: string;
  kind: "interface" | "artwork";
  label: string;
  title: string;
  description: string;
  screen?: "home" | "player" | "lyrics";
  image?: string;
  width?: number;
  height?: number;
  sourceHref?: string;
  sourceLabel?: string;
}

/**
 * `interface` items are genuine in-app screenshots captured with the Ariya
 * Android app (sources in `public/assets/screenshots/`). `artwork` items are the
 * genuine images published with the official Ariya_news posts, served
 * same-origin through the validated artwork proxy (`/api/news/artwork`).
 */
export const galleryItems: GalleryItem[] = [
  {
    id: "home",
    kind: "interface",
    label: "Home",
    title: "Home & discovery",
    description:
      "Discovery shelves, a Haze Glass search pill and the floating mini-player described in the v1.2.0 release notes.",
    screen: "home",
  },
  {
    id: "player",
    kind: "interface",
    label: "Player",
    title: "Now playing",
    description:
      "Full-screen artwork, lossless labelling, queue controls and synced-lyric preview in one player surface.",
    screen: "player",
    image: "/assets/screenshots/fullplayer.png",
    width: 1080,
    height: 2400,
  },
  {
    id: "lyrics",
    kind: "interface",
    label: "Lyrics",
    title: "Synced lyrics",
    description:
      "Lyrics follow the current line, with configurable provider ordering and an opt-in API-key dialog for protected providers.",
    screen: "lyrics",
    image: "/assets/screenshots/lyrics_screen.png",
    width: 1080,
    height: 2400,
  },
  {
    id: "queue",
    kind: "interface",
    label: "Queue",
    title: "Queue control",
    description:
      "Reorder, remove, play next, shuffle and repeat — the full queue surface as shipped in the app.",
    image: "/assets/screenshots/queue.png",
    width: 1080,
    height: 2400,
  },
  {
    id: "artist",
    kind: "interface",
    label: "Artist",
    title: "Artist experience",
    description:
      "Artist bio, track and album counts, plus library, shuffle, radio and subscribe controls — the redesigned artist experience from the v1.2.0 release line.",
    image: "/assets/screenshots/artist_screen.png",
    width: 1080,
    height: 2400,
  },
  {
    id: "artwork-red-moon",
    kind: "artwork",
    label: "Release artwork",
    title: "Ariya v1.2.0 “Red Moon”",
    description:
      "Official artwork published with the v1.2.0 announcement in the Ariya_news repository.",
    image:
      "/api/news/artwork?src=https%3A%2F%2F6ab968ee57212ca6e1e98063.imgix.net%2Fsandbox%2F1000394318.png&w=900",
    width: 900,
    height: 900,
    sourceHref: "https://github.com/vickyhubhai/Ariya_news/blob/main/content/ariya-v1-2-0-release.md",
    sourceLabel: "v1.2.0 announcement",
  },
  {
    id: "artwork-v1-1-0",
    kind: "artwork",
    label: "Release artwork",
    title: "Ariya v1.1.0",
    description:
      "Official artwork published with the v1.1.0 announcement, alongside the Glass/Haze redesign notes.",
    image:
      "/api/news/artwork?src=https%3A%2F%2F6ab968ee57212ca6e1e98063.imgix.net%2Fsandbox%2FAriya-v1.1.0.png&w=900",
    width: 900,
    height: 507,
    sourceHref: "https://github.com/vickyhubhai/Ariya_news/blob/main/content/ariya-v1-1-0-release.md",
    sourceLabel: "v1.1.0 announcement",
  },
  {
    id: "artwork-v1-0-1",
    kind: "artwork",
    label: "Release artwork",
    title: "Ariya v1.0.1",
    description:
      "Official artwork from the v1.0.1 announcement covering stability and Music Together fixes.",
    image:
      "/api/news/artwork?src=https%3A%2F%2F6ab3936c49b4a3698ffee691.imgix.net%2Fsandbox%2FAriya%2520v1.0.1.png&w=900",
    width: 900,
    height: 507,
    sourceHref: "https://github.com/vickyhubhai/Ariya_news/blob/main/content/ariya-v1-0-1-release.md",
    sourceLabel: "v1.0.1 announcement",
  },
];

/** Feature categories, derived from the verified feature list. */
export const featureCategories = [
  "All",
  "Playback",
  "Discovery",
  "Lyrics",
  "Audio",
  "Controls",
  "Library",
  "Integration",
  "Design",
  "Platform",
] as const;

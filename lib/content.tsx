import type { ReactNode } from 'react';
import { discordConfig, newsConfig, repoUrls } from './config';

export interface NavItem {
  href: string;
  label: string;
  external?: boolean;
}

export interface Feature {
  icon: string;
  title: string;
  text: string;
}

export interface Spec {
  icon: string;
  label: string;
  value: string;
}

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

export interface AboutPanel {
  title: string;
  text: string;
}

export interface AboutSection {
  id: string;
  title: string;
  subtitle?: string;
  paragraphs?: string[];
  bullets?: string[];
}

/** Header links. `/about` used to be a directory index on the static host. */
export const NAV_LINKS: NavItem[] = [
  { href: '#features', label: 'Features' },
  { href: '#whats-new', label: "What's New" },
  { href: '#download', label: 'Download' },
  { href: '#faq', label: 'FAQ' },
  { href: '#support', label: 'Support' },
  { href: '/about', label: 'About' },
  { href: repoUrls.repo, label: 'GitHub', external: true },
];

export const ABOUT_NAV_LINKS: NavItem[] = [
  { href: '/#features', label: 'Features' },
  { href: '/#whats-new', label: "What's New" },
  { href: '/#download', label: 'Download' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#support', label: 'Support' },
  { href: '/about', label: 'About' },
  { href: repoUrls.repo, label: 'GitHub', external: true },
];

export const FOOTER_LINKS: NavItem[] = [
  { href: '/#features', label: 'Features' },
  { href: '/#whats-new', label: "What's New" },
  { href: '/#download', label: 'Download' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#support', label: 'Support' },
];

export const HERO = {
  tagline: 'Modern music. Beautifully simple.',
  description:
    'A modern, free and open-source Android music player built for a beautiful and seamless listening experience. Discover music, enjoy high-quality playback, synced lyrics, powerful queue controls, playlists, and more.',
  android: 'Android 8.0+',
};

export const FEATURES: Feature[] = [
  { icon: '▶', title: 'Music Playback', text: 'Smooth, high-quality audio playback with gapless and crossfade support for an uninterrupted listening experience.' },
  { icon: '🔍', title: 'Music Discovery', text: 'Search and discover music through multiple audio sources. Explore trending tracks, new releases, artists, albums, playlists, and your listening history.' },
  { icon: '♫', title: 'Lyrics', text: 'Follow along with synced lyrics while you listen. Configurable lyrics API support with fallback sources and improved lyrics processing.' },
  { icon: '🎵', title: 'Playlists', text: 'Create and manage your own playlists. Organize your music your way with easy playlist management.' },
  { icon: '♬', title: 'FLAC Support', text: 'Enjoy lossless audio with FLAC support. Auto-check for the best available audio quality including hi-res sources.' },
  { icon: '⚙', title: 'Audio Quality', text: 'Choose from multiple audio quality options from low to ultra-high. Codec and bitrate details with high-quality audio source selection.' },
  { icon: '♩', title: 'Queue & Controls', text: 'Full queue management with drag-to-reorder, play next, shuffle, repeat, safer UID-based queue operations, and seamless track transitions.' },
  { icon: '🌐', title: 'Multiple Sources', text: 'Access music from multiple audio sources. Find the best version of any song across different providers.' },
  { icon: '💬', title: 'Discord Integration', text: "Share what you're listening to with your Discord community through rich presence that shows your currently playing music." },
  { icon: '✨', title: 'Glass / Haze UI', text: 'A modern Glass/Haze visual design with adaptive glass surfaces and borders, smooth transitions and animations, and configurable glass opacity and blur.' },
  { icon: '⏬', title: 'Advanced Player', text: 'Full-screen and mini-player experience with dynamic artwork and backgrounds, gapless playback, crossfade, and media-session integrated playback controls.' },
  { icon: '🎛', title: 'Settings & Customization', text: 'Customizable appearance with glass opacity and blur controls, audio and playback preferences, and an improved settings interface.' },
  { icon: '🔄', title: 'Updates', text: "GitHub-based release updates with in-app update checking and release changelog support, so you always know what's new." },
];

export const SPECS: Spec[] = [
  { icon: '📱', label: 'OS', value: 'Android 8.0 (Oreo) or later' },
  { icon: '💾', label: 'Storage', value: '~30 MB free space' },
  { icon: '📶', label: 'Architecture', value: 'arm64, armv7, x86, x86_64' },
  { icon: '🌐', label: 'Network', value: 'Internet for streaming and discovery' },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What is Ariya?',
    answer: (
      <p>
        Ariya is a free, modern Android music player with a beautiful interface. It supports synced lyrics, FLAC lossless audio,
        playlists, queue controls, crossfade, gapless playback, and music discovery from multiple sources.
      </p>
    ),
  },
  {
    question: 'Is Ariya free to download?',
    answer: (
      <p>
        Yes. Ariya is free and open source. You can download the latest APK from the{' '}
        <a href={repoUrls.releases} target="_blank" rel="noopener noreferrer">
          official GitHub releases page
        </a>
        .
      </p>
    ),
  },
  {
    question: 'Which Android versions does Ariya support?',
    answer: (
      <p>Ariya requires Android 8.0 (Oreo) or later and supports arm64, armv7, x86, and x86_64 architectures. It needs about 30 MB of free storage.</p>
    ),
  },
  {
    question: 'Does Ariya support FLAC and lyrics?',
    answer: (
      <p>
        Yes. Ariya supports FLAC lossless audio and synced lyrics that follow along with playback. Audio quality can be selected from low to
        ultra-high depending on the source.
      </p>
    ),
  },
  {
    question: 'Is Ariya available on iOS?',
    answer: <p>No. Ariya is currently available for Android only. iOS support is not available at this time.</p>,
  },
  {
    question: 'How do I report a bug or get support?',
    answer: (
      <p>
        Join the Ariya{' '}
        <a href={discordConfig.supportUrl} target="_blank" rel="noopener noreferrer">
          Discord support server
        </a>
        , or use the <a href="#support">Report a Bug form</a> on the Support section. Reports go straight to the team.
      </p>
    ),
  },
  {
    question: 'Is Ariya open source?',
    answer: (
      <p>
        Yes. Ariya is open source and its code is publicly available on{' '}
        <a href={repoUrls.repo} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{' '}
        under the MIT license.
      </p>
    ),
  },
];

export const SUPPORT = {
  title: 'Support & Feedback',
  subtitle: 'Join our Discord for help, or report a bug right from the site',
  discordTitle: 'Discord Support Server',
  discordText: 'Get help, report issues, and talk to the Ariya community. Fastest way to reach us.',
  bugTitle: 'Report a Bug',
  bugText: 'Found a problem? Tell us here — reports go straight to our team.',
  successTitle: 'Report sent!',
  successText: 'Thanks — our team has been notified. For faster help, join the Discord server.',
};

/**
 * First-paint release notes, shown until the GitHub API answers.
 * Byte-identical to the markup that shipped inside `#notes-body`.
 */
export const RELEASE_NOTES_FALLBACK_HTML = `<strong>v1.1.0 — A major Glass/Haze redesign and stability release</strong>
  • Full Glass/Haze redesign across the app
  • Rebuilt activity/app shell architecture
  • Improved player and queue with safer UID-based operations
  • Improved lyrics handling with API configuration and fallback
  • Improved album artwork fallback
  • Improved networking and Spotify locale handling
  • Improved Settings UI
  • Improved Artist, Home, Playlist, Album, and History screens
  • Stability and lifecycle improvements`;

export const ABOUT = {
  hero: {
    title: 'Ariya',
    tagline: 'Your music, your way.',
    description:
      'Ariya is a modern, free and open-source Android music player focused on a beautiful interface, powerful playback controls, high-quality audio, lyrics, discovery, and a smooth listening experience.',
  },
  whatIs: {
    title: 'What is Ariya?',
    paragraphs: [
      'Ariya is a modern, free and open-source Android music player focused on a beautiful interface, powerful playback controls, high-quality audio, lyrics, discovery, and a smooth listening experience.',
      'Instead of locking your music behind accounts, subscriptions, and cluttered screens, Ariya puts listening first: a Glass/Haze visual design, fluid navigation, and every playback tool you need — from a full-screen player and synced lyrics to queue management and multi-source discovery — in one clean app.',
    ],
  },
  why: {
    title: 'Why Ariya?',
    subtitle: 'Designed around the way you actually listen',
    panels: [
      { title: 'Free & Open Source', text: 'No paywalls and no feature gates. Ariya is MIT-licensed and fully open for anyone to inspect, build, and contribute to.' },
      { title: 'Beautiful by Design', text: 'A full Glass/Haze redesign with adaptive glass surfaces, backdrop blur, smooth transitions, and configurable opacity — a look that stays consistent across every screen.' },
      { title: 'Built for Listening', text: 'Gapless playback, crossfade, high-quality audio source selection, and a player that keeps full-screen and mini-player states in sync.' },
      { title: 'Community Driven', text: 'Feedback and bug reports flow straight to the team through Discord and the website, and every release ships through public GitHub changelogs.' },
    ] as AboutPanel[],
  },
  keyFeatures: {
    title: 'Key Features',
    subtitle: 'Everything Ariya can do, at a glance',
    items: [
      { icon: '✨', title: 'Glass / Haze UI', text: 'Modern Glass/Haze design with adaptive glass surfaces and borders, smooth transitions, and configurable glass opacity and blur.' },
      { icon: '⏬', title: 'Advanced Player', text: 'Full-screen and mini-player experience with dynamic artwork and backgrounds, gapless playback, crossfade, and media-session integration.' },
      { icon: '♩', title: 'Queue Management', text: 'Drag-to-reorder queue, play next, shuffle and repeat, safer UID-based queue operations, and seamless track transitions.' },
      { icon: '♫', title: 'Lyrics', text: 'Synced lyrics with lyrics API configuration, fallback support, and improved lyrics/content processing.' },
      { icon: '♬', title: 'Audio Quality', text: 'FLAC and lossless playback, multiple quality levels, codec and bitrate information, and high-quality audio source selection.' },
      { icon: '🔍', title: 'Music Discovery', text: 'Search and discover music, browse trending and new releases across multiple sources, artists, albums, playlists and history.' },
      { icon: '💬', title: 'Discord Integration', text: 'Discord Rich Presence that shows your currently playing music to your friends.' },
      { icon: '🎛', title: 'Settings & Customization', text: 'Customizable appearance, glass opacity and blur controls, audio and playback preferences, and an improved settings interface.' },
      { icon: '🔄', title: 'Updates', text: 'GitHub-based release updates, in-app update checking, and release changelog support.' },
    ] as Feature[],
  },
  deepDives: [
    {
      id: 'audio-playback',
      title: 'Audio & Playback',
      subtitle: 'Serious audio, without the fuss',
      paragraphs: ['Ariya is built around a modern playback engine that keeps your listening uninterrupted and sounds its best.'],
      bullets: [
        'FLAC and lossless playback where the source provides it',
        'Multiple audio quality levels — from low to ultra-high',
        'Codec and bitrate information, with high-quality audio source selection',
        'Gapless playback and crossfade for smooth transitions between tracks',
        'Full playback controls with media-session integration for lock screen, notifications, and headphones',
        'Full-screen player and mini-player with dynamic artwork and backgrounds',
      ],
    },
    {
      id: 'lyrics',
      title: 'Lyrics',
      subtitle: 'Never miss a word',
      paragraphs: ['Ariya keeps lyrics in sync with playback so you can follow along as you listen.'],
      bullets: [
        'Synced lyrics that scroll with the current line',
        'Configurable lyrics API support for more reliable lookups',
        'Lyrics fallback support when the primary source has nothing',
        'Improved lyrics and content processing for cleaner results',
      ],
    },
    {
      id: 'discovery',
      title: 'Music Discovery',
      subtitle: 'Find your next favorite track',
      paragraphs: ['Ariya connects to multiple music sources so you can search, explore, and play without switching apps.'],
      bullets: [
        'Search and discover songs, artists, albums, and playlists',
        'Trending and new releases to keep your feed fresh',
        'Multiple music sources to find the best version of any track',
        "History browsing of what you've been listening to",
        'Improved Artist, Home, Playlist, Album, and History screens',
      ],
    },
    {
      id: 'queue-playlists',
      title: 'Queue & Playlists',
      subtitle: 'Your listening, under your control',
      paragraphs: ['Build the perfect session and keep it exactly the way you want it.'],
      bullets: [
        'Drag-to-reorder queue with play next, shuffle, and repeat',
        'Safer UID-based queue operations for reliable reorders and moves',
        'Seamless track transitions with no lost position',
        'Create and manage your own playlists',
        'Organize your music your way — local library included',
      ],
    },
    {
      id: 'privacy',
      title: 'Privacy & Open Source',
      paragraphs: [
        'Ariya does not require a traditional account or mandatory sign-up to use the core music player experience. Some optional integrations may require their own authentication.',
        'Ariya is fully open source under the MIT license — the code is public, auditable, and open to contributions. You can read every change in the public changelog and release notes before you install.',
      ],
    },
  ] as AboutSection[],
  community: {
    title: 'Community & Support',
    subtitle: 'Ariya is built in the open, together with its community',
    paragraph:
      'Have an idea, found a bug, or just want to talk about music? Join the Discord server for the fastest help, report issues straight to the team from the website, or dive into the source code on GitHub and open a pull request.',
  },
};

export const CHANGELOG_BROWSE_URL = newsConfig.contentBrowseUrl;

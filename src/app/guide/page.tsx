import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/breadcrumbs";
import {
  IconAlert,
  IconArrowRight,
  IconCheck,
  IconDiscord,
  IconDownload,
  IconEqualizer,
  IconExternal,
  IconGithub,
  IconLyrics,
  IconPlay,
  IconQuality,
  IconQueue,
  IconRefresh,
  IconSearch,
  IconShield,
} from "@/components/icons";
import { FinalCta } from "@/components/sections/cta";
import { JsonLd } from "@/components/ui";
import { breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { installSteps, links, requirements, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Ariya User Guide — Install, Playback, Lyrics & Audio Quality",
  description:
    "The complete Ariya Music Player guide: installing the right APK, playback and queue controls, music discovery, synced lyrics, audio quality and FLAC, Discord presence, updates and troubleshooting.",
  path: "/guide",
  keywords: [
    "Ariya user guide",
    "how to use Ariya",
    "Ariya install guide",
    "Ariya lyrics",
    "Ariya audio quality",
    "Ariya queue controls",
  ],
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Guide", path: "/guide" },
];

function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <IconCheck size={14} className="mt-0.5 shrink-0 text-emerald-300/80" />
      <span>{children}</span>
    </li>
  );
}

interface GuideSection {
  id: string;
  title: string;
  icon: ReactNode;
  body: ReactNode;
}

const sections: GuideSection[] = [
  {
    id: "getting-started",
    title: "Install and first run",
    icon: <IconDownload size={18} />,
    body: (
      <>
        <p className="mt-2 text-sm leading-relaxed text-white/50">
          Ariya is distributed as signed APK files through the official GitHub Releases page of the
          project. This website only links there — no mirrors, no re-hosting.
        </p>
        <ol className="mt-4 space-y-3">
          {installSteps.map((step, index) => (
            <li key={step.title} className="flex gap-3 text-sm">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-violet-300/30 bg-violet-400/10 text-[0.62rem] font-semibold text-violet-100">
                {index + 1}
              </span>
              <div>
                <p className="font-medium text-white/85">{step.title}</p>
                <p className="mt-0.5 leading-relaxed text-white/45">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <dl className="mt-5 divide-y divide-white/8 text-xs">
          {requirements.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4 py-2">
              <dt className="text-white/40">{row.label}</dt>
              <dd className="break-words text-right text-white/75">{row.value}</dd>
            </div>
          ))}
        </dl>
        <Link href="/download" className="btn btn-glass btn-sm mt-5">
          Download Ariya <IconArrowRight size={13} />
        </Link>
      </>
    ),
  },
  {
    id: "playback",
    title: "Playback",
    icon: <IconPlay size={18} />,
    body: (
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        <Bullet>
          <strong className="font-semibold text-white/85">Basic controls.</strong> Play, pause, skip
          and seek from the player, with previous and next track buttons.
        </Bullet>
        <Bullet>
          <strong className="font-semibold text-white/85">Crossfade and gapless.</strong> Smooth
          transitions between tracks, including albums and DJ sets that run continuously.
        </Bullet>
        <Bullet>
          <strong className="font-semibold text-white/85">Background playback.</strong> Music keeps
          playing when you leave the app, with media controls in the notification and on the lock
          screen.
        </Bullet>
        <Bullet>
          <strong className="font-semibold text-white/85">Mini-player.</strong> A floating Haze Glass
          mini-player keeps the current track and quick controls within reach while you browse.
        </Bullet>
      </ul>
    ),
  },
  {
    id: "queue",
    title: "Queue management",
    icon: <IconQueue size={18} />,
    body: (
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        <Bullet>Add songs to the queue or send them straight to “play next”.</Bullet>
        <Bullet>
          Reorder, remove tracks and clear the queue. Queue operations are UID-based, which keeps
          drag-and-drop reliable while tracks change.
        </Bullet>
        <Bullet>Shuffle and repeat modes, plus automatic next-track playback.</Bullet>
      </ul>
    ),
  },
  {
    id: "discovery",
    title: "Discovery and library",
    icon: <IconSearch size={18} />,
    body: (
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        <Bullet>Search songs, artists, albums and playlists through the supported sources.</Bullet>
        <Bullet>Open and play results directly, or add them to the queue while you keep browsing.</Bullet>
        <Bullet>Recommendations based on your listening experience.</Bullet>
        <Bullet>
          Build and manage personal playlists, browse your library and revisit recently played
          tracks and local songs.
        </Bullet>
      </ul>
    ),
  },
  {
    id: "lyrics",
    title: "Synced lyrics",
    icon: <IconLyrics size={18} />,
    body: (
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        <Bullet>Lyrics follow the current line in time with playback.</Bullet>
        <Bullet>Lyrics come from supported providers, with a configurable fallback order.</Bullet>
        <Bullet>
          Some protected providers are opt-in and ask for your own API key through the in-app
          dialog.
        </Bullet>
        <Bullet>
          Availability depends on the track and the provider — not every song ships with lyrics.
        </Bullet>
      </ul>
    ),
  },
  {
    id: "audio-quality",
    title: "Audio quality and FLAC",
    icon: <IconEqualizer size={18} />,
    body: (
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        <Bullet>
          Quality levels from <strong className="font-semibold text-white/85">low</strong> to{" "}
          <strong className="font-semibold text-white/85">ultra-high</strong>, with lossless where
          available.
        </Bullet>
        <Bullet>
          Ariya uses the highest quality actually available from the selected source instead of
          simply showing a higher quality label.
        </Bullet>
        <Bullet>
          FLAC playback is supported when a source offers lossless audio. Availability depends on
          the source and the specific track.
        </Bullet>
        <Bullet> The v1.2.0 release line adds a parametric equalizer.</Bullet>
      </ul>
    ),
  },
  {
    id: "discord",
    title: "Discord presence",
    icon: <IconDiscord size={18} />,
    body: (
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        <Bullet>
          Optionally show what you are listening to on Discord through the app’s Discord
          integration.
        </Bullet>
        <Bullet>
          The integration uses the official Discord application/client configuration where
          applicable.
        </Bullet>
        <Bullet>Entirely optional — the player works without it.</Bullet>
      </ul>
    ),
  },
  {
    id: "updates",
    title: "Updates and versions",
    icon: <IconRefresh size={18} />,
    body: (
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        <Bullet>
          New stable versions are published as APKs on GitHub Releases. This site reads version
          numbers, dates and sizes live from that API — nothing is hardcoded.
        </Bullet>
        <Bullet>Install a newer stable APK over your current one to update.</Bullet>
        <Bullet>Versions follow semantic versioning: MAJOR.MINOR.PATCH.</Bullet>
      </ul>
    ),
  },
  {
    id: "privacy",
    title: "Privacy and accounts",
    icon: <IconShield size={18} />,
    body: (
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        <Bullet>The core player needs no account or mandatory sign-up.</Bullet>
        <Bullet>Some optional integrations may require their own authentication.</Bullet>
        <Bullet>
          Third-party services keep their own terms and privacy policies; Ariya claims no ownership
          of third-party content.
        </Bullet>
        <Bullet>
          This website stores no personal data —{" "}
          <Link href="/about#privacy" className="text-violet-200 transition hover:text-white">
            see the privacy notes
          </Link>
          .
        </Bullet>
      </ul>
    ),
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: <IconAlert size={18} />,
    body: (
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        <Bullet>
          <strong className="font-semibold text-white/85">Android blocks the install.</strong>{" "}
          Android asks you to allow installs from your browser or file manager; that permission is
          managed by Android itself.
        </Bullet>
        <Bullet>
          <strong className="font-semibold text-white/85">A track has no lyrics.</strong> Lyrics
          depend on the provider and the track — not every song is covered. Provider order is
          configurable.
        </Bullet>
        <Bullet>
          <strong className="font-semibold text-white/85">Quality is lower than expected.</strong>{" "}
          Quality and FLAC depend on what the selected source offers for that specific track.
        </Bullet>
        <Bullet>
          <strong className="font-semibold text-white/85">Something else.</strong> Open an issue on
          the official tracker with your device model, Android version, the Ariya build you
          installed and clear reproduction steps.
        </Bullet>
        <Bullet>
          Quick answers to the most common questions live in the{" "}
          <Link href="/faq" className="text-violet-200 transition hover:text-white">
            FAQ
          </Link>
          .
        </Bullet>
      </ul>
    ),
  },
];

export default function GuidePage() {
  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          {
            "@type": "WebPage",
            name: "Ariya Music Player — user guide",
            description:
              "Installation, playback, queue, discovery, lyrics, audio quality, Discord presence, updates and troubleshooting for Ariya Music Player.",
            url: `${site.url}/guide`,
            mainEntity: { "@id": `${site.url}/#software` },
            publisher: { "@id": `${site.url}/#organization` },
          },
        ])}
      />
      <PageHeader
        eyebrow="User guide"
        title="Everything you need to use Ariya"
        intro="From picking the right APK to queue management, synced lyrics and lossless playback — this guide mirrors the official Ariya documentation so you always know what the app does and where its limits are."
        crumbs={crumbs}
        meta={
          <>
            <span className="chip">Android 8.0+</span>
            <span className="chip">Free &amp; open source</span>
            <span className="chip">MIT License</span>
          </>
        }
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            {sections.map((section) => (
              <article key={section.id} id={section.id} className="glass card-radius p-6 sm:p-7">
                <h2 className="h3 flex items-center gap-2">
                  {section.icon} {section.title}
                </h2>
                {section.body}
              </article>
            ))}
            <p className="px-1 text-[0.68rem] leading-relaxed text-white/30">
              Steps and capabilities on this page are taken from the official README and release
              notes of the Ariya project. Features marked “where available” depend on the selected
              source and the specific track. Ariya is not affiliated with Spotify, YouTube, Google
              or Discord.
            </p>
          </div>

          <aside className="space-y-5 self-start lg:sticky lg:top-[calc(var(--nav-height)+1.25rem)]">
            <nav aria-label="On this page" className="glass card-radius p-5">
              <h2 className="text-sm font-semibold text-white/85">On this page</h2>
              <ul className="mt-3 space-y-1.5 text-xs">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="tap tap-sm inline-flex items-center gap-2 break-anywhere text-white/60 transition hover:text-white"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="glass card-radius p-5">
              <h2 className="text-sm font-semibold text-white/85">Quick links</h2>
              <ul className="mt-3 space-y-1.5 text-xs">
                <li>
                  <Link
                    href="/download"
                    className="tap tap-sm inline-flex items-center gap-2 text-white/60 transition hover:text-white"
                  >
                    <IconDownload size={13} /> Download Ariya
                  </Link>
                </li>
                <li>
                  <Link
                    href="/releases"
                    className="tap tap-sm inline-flex items-center gap-2 text-white/60 transition hover:text-white"
                  >
                    <IconRefresh size={13} /> Release history
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="tap tap-sm inline-flex items-center gap-2 text-white/60 transition hover:text-white"
                  >
                    <IconSearch size={13} /> FAQ
                  </Link>
                </li>
                <li>
                  <a
                    href={links.issues}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap tap-sm inline-flex items-center gap-2 break-anywhere text-white/60 transition hover:text-white"
                  >
                    <IconAlert size={13} /> Report an issue <IconExternal size={11} />
                  </a>
                </li>
                <li>
                  <a
                    href={links.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap tap-sm inline-flex items-center gap-2 break-anywhere text-white/60 transition hover:text-white"
                  >
                    <IconGithub size={13} /> Source code <IconExternal size={11} />
                  </a>
                </li>
              </ul>
            </div>

            <div className="glass glass-highlight card-radius p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white/85">
                <IconQuality size={16} /> Best first step
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-white/50">
                Not sure where to start? Download the Universal APK from the latest stable release —
                it installs on any supported device.
              </p>
              <Link href="/download" className="btn btn-primary btn-sm mt-4">
                Get Ariya <IconArrowRight size={13} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

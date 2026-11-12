import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/breadcrumbs";
import { IconExternal, IconGithub, IconShield } from "@/components/icons";
import { FinalCta } from "@/components/sections/cta";
import { JsonLd } from "@/components/ui";
import { breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { links, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy — Ariya Music Player",
  description:
    "What the Ariya Android app stores on your device, what it sends to external services when you use specific features, GMS vs FOSS differences, permissions, retention and security — verified against the app source code.",
  path: "/privacy",
  keywords: [
    "Ariya privacy policy",
    "Ariya data safety",
    "Ariya permissions",
    "Ariya Firebase",
    "Ariya third-party services",
  ],
});

const EFFECTIVE_DATE = "2026-11-12";
const UPDATED_DATE = "2026-11-12";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Privacy Policy", path: "/privacy" },
];

interface Row {
  term: string;
  description: string;
}

function DataTable({ rows }: { rows: Row[] }) {
  return (
    <dl className="mt-4 divide-y divide-white/8 text-xs sm:text-sm">
      {rows.map((row) => (
        <div key={row.term} className="grid gap-1 py-3 sm:grid-cols-[minmax(11rem,0.42fr)_1fr] sm:gap-4">
          <dt className="font-semibold text-white/80">{row.term}</dt>
          <dd className="leading-relaxed text-white/55">{row.description}</dd>
        </div>
      ))}
    </dl>
  );
}

interface Section {
  id: string;
  title: string;
  children: React.ReactNode;
}

const sections: Section[] = [
  {
    id: "overview",
    title: "1. Overview",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          This policy describes how <strong>Ariya Music Player</strong>, an Android application
          developed by {site.developer} ({site.studio}), and the official website{" "}
          <code>{site.url.replace(/^https:\/\//, "")}</code> handle data. It covers both surfaces:
          the app you install and this website you are reading.
        </p>
        <p>
          It is written from the actual app source code, build configuration and Android manifest.
          Where a capability depends on an external service, that dependency is named. Ariya is
          distributed in two flavours: <strong>GMS</strong> builds (with Google Mobile Services
          integration) and <strong>FOSS</strong> builds (Firebase-free). Differences are called out
          where they matter.
        </p>
        <p>
          <strong>Short version:</strong> Ariya has no user accounts and no servers that receive
          your personal data. Your library, history, playlists, settings and integrations live on
          your device. When you use an online feature, the app contacts that feature&apos;s own
          service and sends only what the feature needs. This website stores no visitor data.
        </p>
      </div>
    ),
  },
  {
    id: "local-data",
    title: "2. Data processed locally on your device",
    children: (
      <>
        <div className="prose-ariya mt-3">
          <p>
            The following is stored in the app&apos;s private sandbox storage on your device to make
            playback, library, search, lyrics and customisation work. It is not transmitted to the
            project or to any server operated by the project.
          </p>
        </div>
        <DataTable
          rows={[
            {
              term: "Library and playback",
              description:
                "Songs, artists, albums, playlists, like states, download states, play counts and audio format metadata — used for library management and playback.",
            },
            {
              term: "Search and lyrics",
              description:
                "Search history entries, cached lyrics and romanisation maps — used for search history and offline lyrics display.",
            },
            {
              term: "Listening history",
              description:
                "Playback event records (song ID, timestamp, play time) — used for statistics and history features. Recording can be paused in settings.",
            },
            {
              term: "Settings",
              description:
                "Language, content region, interface, audio, cache, history-pause, proxy and integration preferences.",
            },
            {
              term: "Optional session data",
              description:
                "If you sign in to YouTube/YouTube Music inside the app: account name, email, channel handle, visitor data, sync identifiers, cookies and PO token values. If you enable optional integrations: Spotify, Qobuz, Last.fm, ListenBrainz and Discord tokens, plus your own API keys for opt-in providers.",
            },
            {
              term: "Cached files",
              description:
                "Streaming cache, downloaded audio, resolved stream URLs and album artwork — used for faster playback and offline use.",
            },
          ]}
        />
      </>
    ),
  },
  {
    id: "external",
    title: "3. Data sent to external services when you use features",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Ariya contacts third-party services only when you use the corresponding feature. Each
          service processes your data under its own privacy policy. Requests from your device go
          directly to the service concerned; the project operates no proxy that sees this traffic.
        </p>
      </div>
    ),
  },
  {
    id: "external-table",
    title: "3.1 Service details",
    children: (
      <>
        <DataTable
        rows={[
          {
            term: "YouTube / YouTube Music",
            description:
              "Search terms, playback and stream requests, playlist or library operations and, when you use the in-app sign-in, session values (visitor data, sync identifiers, cookies, tokens). Used for discovery, streaming and playlist sync.",
          },
          {
            term: "JioSaavn",
            description:
              "Search queries and stream URL requests. Used for search results and as the optional playback fallback when a YouTube stream is unavailable.",
          },
          {
            term: "Spotify",
            description:
              "Library sync and track-matching requests, like/unlike calls and your Spotify OAuth tokens. Only when Spotify playlist/library sync or Canvas features are enabled.",
          },
          {
            term: "Qobuz",
            description:
              "Track search queries, playback stream requests and your Qobuz credentials/token. Only when lossless FLAC playback or downloading is active.",
          },
          {
            term: "Lyrics providers",
            description:
              "Song title, artist name, duration and album identifiers sent to lyrics services such as LRCLIB (lrclib.net) and the Paxsenix lyrics APIs (including its Apple Music, Musixmatch and Spotify lyrics endpoints). Some providers are opt-in and use an API key you enter yourself.",
          },
          {
            term: "Track recognition",
            description:
              "Short audio fingerprint samples and acoustic hashes sent to ShazamKit / Apple Music services. Only when you actively use in-app track recognition.",
          },
          {
            term: "Visualizer services",
            description:
              "Song and artist names or album identifiers sent to public canvas/artwork services. Only when animated canvas or artwork visualisers are enabled.",
          },
          {
            term: "Last.fm / Libre.fm",
            description:
              "Now-playing and scrobble metadata plus your Last.fm session. Only when scrobbling is enabled.",
          },
          {
            term: "ListenBrainz",
            description:
              "Playback history / scrobble metadata and your ListenBrainz token. Only when ListenBrainz sync is enabled.",
          },
          {
            term: "Discord Rich Presence",
            description:
              "Current track, artist, album and elapsed time, plus your Discord OAuth tokens. Only when Rich Presence is enabled.",
          },
          {
            term: "GitHub",
            description:
              "Update-check requests and requests for release metadata, changelogs and contributor information from api.github.com and raw.githubusercontent.com. No personal data is sent.",
          },
          {
            term: "Together rooms",
            description:
              "Display name, client ID, session code, playback state and queue actions sent to the Together session backend so other participants can share the room. Only when you host or join a room.",
          },
          {
            term: "AI text services",
            description:
              "Text you submit for AI-powered features is sent to the AI provider you configure yourself (e.g. Anthropic, OpenAI, OpenRouter or Gemini) using your own API key and endpoint. Off and unused until you configure it.",
          },
        ]}
      />
      <div className="prose-ariya mt-4">
        <p>
          Other public web endpoints (for example artwork mirrors, stream resolvers or additional
          lyrics mirrors) may be contacted for specific features. They receive only the identifiers
          needed for that feature — never your library, history or credentials.
        </p>
      </div>
      </>
    ),
  },
  {
    id: "gms-foss",
    title: "4. GMS and FOSS builds — notifications",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          <strong>GMS builds</strong> include Firebase Cloud Messaging (Google). At startup they
          subscribe to a general announcement topic (<code>ariya_all</code>) so the project can send
          release and news notifications to everyone who installed a GMS build. The FCM registration
          token is generated and managed by Google&apos;s infrastructure; the app does not send it
          to the project, and the project runs no backend that receives it. Notifications you
          receive can be dismissed, and Android&apos;s notification permission can be revoked.
        </p>
        <p>
          <strong>FOSS builds</strong> contain no Firebase code and use no push service. Both
          flavours produce playback and download notifications locally on the device.
        </p>
        <p>
          Neither flavour sends app usage telemetry to the project. The GMS build bundles the
          Firebase Analytics library as a transitive dependency, but the app code does not
          initialise it, no Google services configuration for analytics is shipped, and no usage
          events are recorded or uploaded by the app.
        </p>
      </div>
    ),
  },
  {
    id: "api-keys",
    title: "5. Optional user-provided API keys and accounts",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Some providers are opt-in and require credentials only you can supply — a Paxsenix API
          key, an AI provider key, or sign-in to Spotify, Qobuz, YouTube or Discord. These values
          are stored locally in the app&apos;s sandbox and are sent only to the service they belong
          to. They are never sent to the project, to the website, or to any other third party.
        </p>
        <p>
          Ariya&apos;s core features require no account. The project never asks for your passwords
          for third-party services.
        </p>
      </div>
    ),
  },
  {
    id: "permissions",
    title: "6. Android permissions",
    children: (
      <>
        <DataTable
        rows={[
          {
            term: "INTERNET",
            description: "Connect to the streaming sources, lyrics, integrations and update endpoints listed above.",
          },
          {
            term: "POST_NOTIFICATIONS",
            description: "Show playback, download and (GMS) announcement notifications.",
          },
          {
            term: "ACCESS_NETWORK_STATE",
            description: "Detect connectivity and adapt caching behaviour.",
          },
          {
            term: "READ_MEDIA_AUDIO",
            description: "Read local audio files on Android 13+ so your own library can be played.",
          },
          {
            term: "READ_EXTERNAL_STORAGE",
            description: "Same purpose on Android 12 and below (declared with maxSdkVersion 32).",
          },
          {
            term: "RECORD_AUDIO",
            description: "Capture audio for the optional track-recognition feature (ShazamKit). Used only while recognition is running.",
          },
          {
            term: "MODIFY_AUDIO_SETTINGS, BLUETOOTH_CONNECT",
            description: "Audio output configuration and integration with Bluetooth audio devices and hardware playback controls.",
          },
          {
            term: "FOREGROUND_SERVICE (+ MEDIA_PLAYBACK, DATA_SYNC, MICROPHONE)",
            description: "Keep playback, stream resolution, sync and recognition running reliably while the app is in the background.",
          },
          {
            term: "RECEIVE_BOOT_COMPLETED, WAKE_LOCK, VIBRATE",
            description: "Restore playback-related behaviour after restart and keep the device awake during playback.",
          },
        ]}
      />
        <div className="prose-ariya mt-4">
          <p>
            The manifest does not request location, contacts, camera, calendar, SMS, call log or
            phone-state permissions.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "retention",
    title: "7. Data retention and deletion",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Because app data lives on your device, retention is under your control:
        </p>
        <ul>
          <li>
            Delete individual items (history entries, searches, playlists, downloads) inside the
            app.
          </li>
          <li>Clear all app storage via Android system settings, or uninstall the app.</li>
          <li>
            The app offers a manual backup export that writes a ZIP archive of settings and
            databases only when you trigger it. That file is yours to keep or delete.
          </li>
          <li>
            Android&apos;s automatic backup / device-transfer may copy part of the local data per
            your system settings. Backup rules exclude streaming caches and download directories;
            caches are also cleared by the app&apos;s own cache settings.
          </li>
          <li>
            Data sent to third-party services is subject to those services&apos; own retention
            practices — for example a scrobble stays on Last.fm under Last.fm&apos;s rules. The
            project cannot delete data from third-party systems on your behalf.
          </li>
        </ul>
        <p>
          The project operates no server that stores app-user data, so there is nothing for the
          project to delete on request. The website&apos;s server-side cache is described in
          section 9.
        </p>
      </div>
    ),
  },
  {
    id: "security",
    title: "8. Security practices and limitations",
    children: (
      <div className="prose-ariya mt-3">
        <ul>
          <li>
            Connections to public services use HTTPS whenever the endpoint supports it. The app
            manifest permits cleartext traffic to support the local playback proxy, self-hosted or
            community streaming endpoints and custom network setups — those specific connections
            are not TLS-protected.
          </li>
          <li>
            Databases, tokens and settings are stored in Android&apos;s per-app sandbox. The app
            does not add custom encryption-at-rest on top of the platform sandbox.
          </li>
          <li>
            The app contains no advertising SDKs, no crash-reporting SDKs and no third-party
            analytics SDKs that are initialised or used.
          </li>
          <li>
            APK downloads are published only through official GitHub Releases; verify builds against
            the repository rather than mirrors.
          </li>
          <li>
            No software can promise absolute security. If you believe a release is unsafe, report it
            via the repository issue tracker.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "children",
    title: "9. Children",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Ariya is a general-audience music player. It has no accounts, no age gate and no
          server-side user records, and it does not knowingly collect personal information from
          anyone, including children under 13. Because data stays on the device, a parent or
          guardian controls it with the device&apos;s own tools.
        </p>
      </div>
    ),
  },
  {
    id: "website",
    title: "10. This website",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          The official website <code>ariyamusic.us.ci</code> is static informational content served
          over HTTPS. It:
        </p>
        <ul>
          <li>has no accounts, no sign-in, no contact forms and no cookies;</li>
          <li>runs no advertising and no visitor analytics or tracking scripts;</li>
          <li>
            stores only one non-personal value in your browser: a short-lived{" "}
            <code>sessionStorage</code> flag that prevents the intro animation from replaying in the
            same tab;
          </li>
          <li>
            fetches public release and news metadata server-side from the GitHub API and caches that
            public metadata briefly in a server database to respect GitHub&apos;s rate limits — the
            cache contains no visitor information;
          </li>
          <li>
            applies strict security headers (CSP, HSTS, frame protection, permissions policy);
          </li>
          <li>
            links downloads directly to <code>github.com</code>; once you follow such a link,
            GitHub&apos;s privacy policy applies.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "third-parties",
    title: "11. Third-party services and their roles",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Third-party services act as independent controllers of the data you send them while using
          the matching feature. Their own policies govern that processing. Notable services include
          YouTube/Google (streaming and, in GMS builds, Firebase notifications), JioSaavn and
          community JioSaavn API endpoints, Spotify, Qobuz, LRCLIB, Paxsenix, ShazamKit/Apple,
          Last.fm, ListenBrainz, Discord and GitHub. Ariya is an independent project and is not
          affiliated with, endorsed by or sponsored by any of them; trademarks belong to their
          respective owners.
        </p>
      </div>
    ),
  },
  {
    id: "changes",
    title: "12. Changes to this policy",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          This policy is updated when the app&apos;s data practices or distribution channels change
          — for example when integrations are added or removed. The revision date at the top of this
          page always reflects the latest version. Material changes are also announced through the
          project&apos;s release notes.
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    title: "13. Contact",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          The project does not publish a public email inbox; the official support and privacy
          contact is the repository issue tracker. Open an issue marked &ldquo;privacy&rdquo; and it
          will be handled by the maintainer. See the{" "}
          <Link href="/contact">contact page</Link> for details.
        </p>
      </div>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          {
            "@type": "WebPage",
            name: "Ariya Music Player — Privacy Policy",
            description:
              "Source-verified privacy policy for the Ariya Android app and the official Ariya website.",
            url: `${site.url}/privacy`,
            datePublished: EFFECTIVE_DATE,
            dateModified: UPDATED_DATE,
            mainEntity: { "@id": `${site.url}/#software` },
            publisher: { "@id": `${site.url}/#organization` },
          },
        ])}
      />
      <PageHeader
        eyebrow="Privacy Policy"
        title="Your data, described exactly"
        intro="What Ariya stores on your device, what leaves it when you use an online feature, and what this website does — verified against the app source code and build configuration."
        crumbs={crumbs}
        meta={
          <>
            <span className="chip">
              <IconShield size={13} /> Effective {EFFECTIVE_DATE}
            </span>
            <span className="chip">Last updated {UPDATED_DATE}</span>
            <a href={links.repo} target="_blank" rel="noopener noreferrer" className="chip hover:text-white">
              <IconGithub size={13} /> Read the source <IconExternal size={11} />
            </a>
          </>
        }
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            {sections.map((section) => (
              <article key={section.id} id={section.id} className="glass card-radius p-6 sm:p-7">
                <h2 className="h3">{section.title}</h2>
                {section.children}
              </article>
            ))}
            <p className="px-1 text-[0.68rem] leading-relaxed text-white/30">
              This policy describes the Ariya Android application and the official website as
              published in the vickyhubhai/Ariya repository. Service availability and behaviour can
              vary by build flavour, version and configuration; when they do, this page is revised.
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
                      {section.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="glass glass-highlight card-radius p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white/85">
                <IconShield size={16} /> At a glance
              </h2>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-white/55">
                <li>No accounts, no sign-up, no tracking on this site or in the app.</li>
                <li>Library, history and settings stay on your device.</li>
                <li>Online features talk directly to their own services.</li>
                <li>Push notifications: GMS builds only, via Firebase (Google).</li>
                <li>No ad SDKs, no crash-reporting SDKs, no analytics code paths.</li>
              </ul>
              <Link href="/contact" className="btn btn-glass btn-sm mt-4">
                Questions? Contact <IconExternal size={11} />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

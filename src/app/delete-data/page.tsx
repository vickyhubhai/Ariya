import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/breadcrumbs";
import { IconAlert, IconExternal, IconGithub, IconShield } from "@/components/icons";
import { FinalCta } from "@/components/sections/cta";
import { JsonLd } from "@/components/ui";
import { breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { links, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Delete Your Data — Ariya Music Player",
  description:
    "How to delete the data Ariya stores on your device, how to remove third-party account data, and how to request help with deletion. Ariya has no user accounts and no servers that store your data.",
  path: "/delete-data",
  keywords: [
    "Ariya delete data",
    "Ariya data deletion",
    "Ariya clear app data",
    "Ariya privacy",
  ],
});

const UPDATED_DATE = "2026-11-12";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Delete your data", path: "/delete-data" },
];

interface Step {
  title: string;
  body: string;
}

const localSteps: Step[] = [
  {
    title: "Delete items inside the app",
    body: "Remove individual songs, playlists, search-history entries, listening-history entries and downloads from the library and history screens. Deleted items are removed from your device immediately.",
  },
  {
    title: "Clear caches from settings",
    body: "In Settings you can clear the streaming cache, download cache and lyrics cache. This removes cached audio, artwork and resolved stream URLs without touching your library.",
  },
  {
    title: "Clear all app data",
    body: "Android system settings → Apps → Ariya → Storage → Clear data. This erases the library, playlists, history, settings and every stored token in one step.",
  },
  {
    title: "Uninstall the app",
    body: "Uninstalling removes the app and all of its private data from the device. Nothing remains on any Ariya server afterwards, because the project runs no servers that hold your data.",
  },
];

const thirdPartySteps: Step[] = [
  {
    title: "Spotify",
    body: "Remove the Ariya integration's access from your Spotify account page (account settings → apps), or disconnect it in Ariya's settings.",
  },
  {
    title: "YouTube / YouTube Music",
    body: "Sign out inside Ariya, and manage connected access from your Google account's security settings.",
  },
  {
    title: "Discord, Last.fm, ListenBrainz, Qobuz",
    body: "Disconnect each integration in Ariya's settings, then revoke the app's access on the service's own website. Scrobbles already stored by those services are governed by their deletion tools.",
  },
  {
    title: "API keys you entered",
    body: "Remove provider keys (for example a Paxsenix or AI provider key) in the matching settings screen. Keys were only ever stored on your device and sent to the provider you configured.",
  },
];

export default function DeleteDataPage() {
  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          {
            "@type": "WebPage",
            name: "Ariya Music Player — Delete your data",
            description:
              "How to delete data Ariya stores on your device and how to remove third-party account access.",
            url: `${site.url}/delete-data`,
            dateModified: UPDATED_DATE,
            mainEntity: { "@id": `${site.url}/#software` },
            publisher: { "@id": `${site.url}/#organization` },
          },
        ])}
      />
      <PageHeader
        eyebrow="Data deletion"
        title="Delete your data"
        intro="Ariya has no user accounts and the project runs no servers that store your personal data. Everything the app keeps lives on your device — which means deletion is in your hands, using the steps below."
        crumbs={crumbs}
        meta={
          <>
            <span className="chip">
              <IconShield size={13} /> Last updated {UPDATED_DATE}
            </span>
            <Link href="/privacy" className="chip hover:text-white">
              Full Privacy Policy
            </Link>
          </>
        }
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">1. What Ariya stores, and where</h2>
              <div className="prose-ariya mt-3">
                <p>
                  The app stores your library, playlists, listening history, search history, cached
                  lyrics and audio, settings, and — only if you enabled them — session tokens for
                  optional integrations. All of it is kept in the app&apos;s private storage on your
                  device. It is not uploaded to the project, and the official website stores no
                  visitor data at all.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">2. Deleting data from your device</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Use the option that matches how much you want gone:
              </p>
              <ol className="mt-4 space-y-3">
                {localSteps.map((step, index) => (
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
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">3. Deleting data held by third-party services</h2>
              <div className="prose-ariya mt-3">
                <p>
                  If you enabled an optional integration, that service holds its own copy of the
                  connection. The Ariya project cannot delete data on their systems — revoke access
                  directly with each service:
                </p>
              </div>
              <ul className="mt-4 space-y-2">
                {thirdPartySteps.map((item) => (
                  <li key={item.title} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300/80" />
                    <span>
                      <strong className="font-semibold text-white/85">{item.title}.</strong>{" "}
                      {item.body}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">4. Requesting help with deletion</h2>
              <div className="prose-ariya mt-3">
                <p>
                  There is no data held on Ariya servers to request deletion of — nothing about you
                  is stored outside your device and the third-party services you connected. If you
                  cannot find a setting, believe data was stored somewhere unexpected, or want a
                  deletion question answered, open an issue on the official tracker marked
                  &ldquo;data deletion&rdquo;:
                </p>
                <p>
                  <a href={links.issues} target="_blank" rel="noopener noreferrer">
                    github.com/vickyhubhai/Ariya/issues
                  </a>
                </p>
                <p>
                  Do not include credentials or API keys in your request —{" "}
                  <Link href="/contact">see the contact page</Link> for what to include and what to
                  leave out.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7 border border-amber-300/15">
              <h2 className="h3 flex items-center gap-2 text-amber-100">
                <IconAlert size={18} /> Before clearing everything
              </h2>
              <div className="prose-ariya mt-3">
                <p>
                  Clearing app data or uninstalling is irreversible: playlists, history and local
                  settings cannot be restored by the project. If you want to keep anything, use the
                  app&apos;s manual backup export first — it writes a ZIP archive of your settings
                  and databases that you control, and you can delete that file whenever you like.
                </p>
              </div>
            </article>
          </div>

          <aside className="space-y-5 self-start lg:sticky lg:top-[calc(var(--nav-height)+1.25rem)]">
            <div className="glass glass-highlight card-radius p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white/85">
                <IconShield size={16} /> At a glance
              </h2>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-white/55">
                <li>No accounts, no sign-up — nothing tied to an identity.</li>
                <li>No Ariya servers hold your data; deletion is device-side.</li>
                <li>This website stores no visitor data.</li>
                <li>Third-party integrations are revoked with each service.</li>
              </ul>
              <a
                href={links.issues}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass btn-sm mt-4"
              >
                <IconGithub size={14} /> Ask a deletion question <IconExternal size={11} />
              </a>
            </div>

            <div className="glass card-radius p-5">
              <h2 className="text-sm font-semibold text-white/85">Related</h2>
              <ul className="mt-3 space-y-1.5 text-xs">
                <li>
                  <Link href="/privacy" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    Contact / Support
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    User guide
                  </Link>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

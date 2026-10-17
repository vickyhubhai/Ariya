import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/breadcrumbs";
import { IconExternal, IconGithub, IconShield, IconSparkles } from "@/components/icons";
import { FinalCta } from "@/components/sections/cta";
import { JsonLd } from "@/components/ui";
import { breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { links, site } from "@/lib/site";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Developer", path: "/developer" },
];

export const metadata: Metadata = pageMetadata({
  title: "Ariya Developer — Vicky & the Astrix Team",
  description:
    "Who develops Ariya Music Player, where the source code and release announcements are published, how builds reach GitHub Releases, and how to report a bug or request a feature.",
  path: "/developer",
  keywords: ["Ariya developer", "who made Ariya", "Astrix Team", "Ariya GitHub"],
});

const facts = [
  { label: "Developer", value: site.developer },
  { label: "Studio", value: site.studio },
  { label: "Project", value: site.name },
  { label: "License", value: site.license },
  { label: "Distribution", value: "GitHub Releases (APK)" },
  { label: "Official site", value: "ariyamusic.us.ci" },
];

const profiles = [
  { label: "GitHub profile — vickyhubhai", href: links.developer },
  { label: "Source repository — vickyhubhai/Ariya", href: links.repo },
  { label: "Release announcements — Ariya_news", href: links.newsRepo },
  { label: "Issue tracker", href: links.issues },
  { label: "MIT License text", href: links.license },
];

export default function DeveloperPage() {
  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          {
            "@type": "ProfilePage",
            name: "Developer of Ariya Music Player",
            description:
              "Who develops Ariya Music Player, where the work is published, and how to reach the project.",
            url: `${site.url}/developer`,
            mainEntity: {
              "@type": "Person",
              name: site.developer,
              url: links.developer,
              affiliation: { "@type": "Organization", name: site.studio },
            },
            isPartOf: { "@id": `${site.url}/#website` },
          },
        ])}
      />
      <PageHeader
        eyebrow="The developer"
        title="Vicky & the Astrix Team"
        intro="Ariya is an independent, open-source project built by Vicky with the Astrix Team. Here is who develops it, where the work is published, and how to reach the project."
        crumbs={crumbs}
        meta={
          <>
            <a href={links.developer} target="_blank" rel="noopener noreferrer" className="chip hover:text-white">
              <IconGithub size={13} /> github.com/vickyhubhai <IconExternal size={11} />
            </a>
            <span className="chip">
              <IconSparkles size={13} /> {site.studio}
            </span>
            <span className="chip">
              <IconShield size={13} /> {site.license}
            </span>
          </>
        }
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">Who develops Ariya</h2>
              <div className="prose-ariya mt-3">
                <p>
                  Ariya is developed by <strong>{site.developer}</strong> with the{" "}
                  <strong>{site.studio}</strong>. It is an independent, open-source project released
                  under the MIT License and is not affiliated with or endorsed by Spotify, YouTube,
                  Google, Discord or any other third-party music service.
                </p>
                <p>
                  The project&rsquo;s source code, every published build and this website live under{" "}
                  <a href={links.repo} target="_blank" rel="noopener noreferrer">
                    github.com/vickyhubhai
                  </a>
                  . Release announcements and developer news are written in the same account&rsquo;s{" "}
                  <a href={links.newsRepo} target="_blank" rel="noopener noreferrer">
                    Ariya_news
                  </a>{" "}
                  repository and mirrored on the <Link href="/news">news page</Link>.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">How builds and news are published</h2>
              <div className="prose-ariya mt-3">
                <p>
                  Stable builds are produced and published as APK files on GitHub Releases. Draft
                  builds and pre-releases are excluded from this website, and every version number,
                  date, changelog and file size shown here is read live from the public GitHub API —
                  nothing is hardcoded.
                </p>
                <p>
                  When a new version ships, the <Link href="/download">download</Link>,{" "}
                  <Link href="/releases">releases</Link> and <Link href="/news">news</Link> pages
                  update from that same public data. Release artwork is served through this
                  site&rsquo;s validated proxy rather than embedded from third-party hosts.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">Report a bug or request a feature</h2>
              <div className="prose-ariya mt-3">
                <p>
                  The official channel for bug reports and feature requests is the GitHub issue
                  tracker. Include your device model, Android version, the exact Ariya build you
                  installed and clear reproduction steps, so the report can be reproduced and acted
                  on quickly.
                </p>
              </div>
              <a
                href={links.issues}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass btn-sm mt-4"
              >
                <IconGithub size={14} /> Open the issue tracker <IconExternal size={12} />
              </a>
            </article>
          </div>

          <aside className="space-y-5">
            <div className="glass glass-highlight card-radius p-5">
              <h2 className="text-sm font-semibold text-white/85">At a glance</h2>
              <dl className="mt-3 divide-y divide-white/8 text-xs">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex items-start justify-between gap-4 py-2">
                    <dt className="text-white/40">{fact.label}</dt>
                    <dd className="text-right font-medium text-white/80">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="glass card-radius p-5">
              <h2 className="text-sm font-semibold text-white/85">Official links</h2>
              <ul className="mt-2 space-y-1 text-xs">
                {profiles.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tap tap-sm inline-flex items-center gap-1.5 break-anywhere text-white/60 transition hover:text-white"
                    >
                      {item.label} <IconExternal size={11} />
                    </a>
                  </li>
                ))}
              </ul>
              <Link href="/download" className="btn btn-glass btn-sm mt-4">
                Get Ariya
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

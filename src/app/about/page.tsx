import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/breadcrumbs";
import { BrandLogo } from "@/components/brand-logo";
import { IconAndroid, IconArrowRight, IconCheck, IconExternal, IconGithub, IconShield, IconSparkles } from "@/components/icons";
import { FinalCta } from "@/components/sections/cta";
import { JsonLd } from "@/components/ui";
import { getLatestRelease } from "@/lib/github";
import { breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { entityFacts, features, links, requirements, site } from "@/lib/site";

export const dynamic = "force-dynamic";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

export const metadata: Metadata = pageMetadata({
  title: "About Ariya Music Player — Open Source Android Player",
  description:
    "Who builds Ariya, what the app actually does, which licence it uses, and how this website handles release data, privacy and security.",
  path: "/about",
  keywords: ["about Ariya", "Ariya developer", "Ariya open source", "Ariya MIT license"],
});

export default async function AboutPage() {
  const latest = await getLatestRelease();
  const release = latest.ok ? latest.data.release : null;

  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          {
            "@type": "AboutPage",
            name: "About Ariya Music Player",
            description:
              "Background, verified capabilities, licence and website privacy practices for Ariya Music Player.",
            url: `${site.url}/about`,
            mainEntity: { "@id": `${site.url}/#software` },
            publisher: { "@id": `${site.url}/#organization` },
          },
        ])}
      />
      <PageHeader
        eyebrow="About the project"
        title="Music Beyond Limits — without the noise"
        intro="Ariya is an independent, open-source Android music player focused on playback quality, synced lyrics and a calm interface. This page documents what it does, how it is distributed, and how this website treats your data."
        crumbs={crumbs}
        meta={
          <>
            <span className="chip">By {site.developer} · {site.studio}</span>
            <span className="chip"><IconShield size={13} /> MIT License</span>
            <a href={links.repo} target="_blank" rel="noopener noreferrer" className="chip hover:text-white">
              <IconGithub size={13} /> Source repository <IconExternal size={11} />
            </a>
          </>
        }
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">What Ariya is</h2>
              <div className="prose-ariya mt-3">
                <p>
                  Ariya is a music player application for Android, written with a native Jetpack
                  Compose interface and distributed as signed APK files through GitHub Releases. Its
                  stated goal, in the project’s own words, is to make listening to music feel
                  effortless.
                </p>
                <p>
                  The app brings discovery, playback, lyrics, playlists, queue management, multiple
                  audio sources and lossless playback where available into a single interface. A
                  Discord integration can optionally display what you are listening to. Ariya is free
                  and released under the MIT License.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3 flex items-center gap-2">
                <IconSparkles size={18} /> Verified feature set
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                These capabilities are documented in the official README and release notes. Anything
                that depends on an external source is labelled as such, and nothing beyond this list
                is claimed anywhere on this site.
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-2 text-xs text-white/60">
                    <IconCheck size={14} className="mt-0.5 shrink-0 text-emerald-300/80" />
                    <span>
                      <strong className="font-semibold text-white/85">{feature.title}.</strong>{" "}
                      {feature.description}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">Design language</h2>
              <div className="prose-ariya mt-3">
                <p>
                  Ariya’s recent release line introduced the <strong>Haze Glass</strong> design system:
                  real backdrop blur on the navigation toolbar, search pill and mini-player, adjustable
                  blur radius and glass opacity, and fluid morphing controls. The app is dark-first,
                  with dynamic glass tinting derived from blur intensity.
                </p>
                <p>
                  This website follows the same language — layered translucent surfaces, restrained
                  purple, blue and pink lighting, and motion that never fights the content.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7" id="privacy">
              <h2 className="h3 flex items-center gap-2">
                <IconShield size={18} /> Privacy on this website
              </h2>
              <div className="prose-ariya mt-3">
                <p>
                  This site has no accounts, no advertising trackers, no analytics scripts and no
                  contact forms. It does not set marketing cookies and does not store personal data.
                  The only browser storage it uses is a short-lived <code>sessionStorage</code> flag
                  that prevents the intro animation from replaying in the same tab.
                </p>
                <p>
                  Release and news metadata is fetched <strong>server-side</strong> from the public
                  GitHub API and raw GitHub content, then cached briefly in a PostgreSQL table on the
                  server to respect GitHub’s rate limits. That cache contains only public release and
                  news metadata — never visitor information.
                </p>
                <p>
                  Download buttons link straight to <code>github.com</code>. Once you leave this site,
                  GitHub’s own privacy policy applies.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7" id="security">
              <h2 className="h3">Security notes &amp; deployment requirements</h2>
              <div className="prose-ariya mt-3">
                <p>
                  Download URLs are validated twice — on the server while normalising release data and
                  again in the browser — and must be HTTPS URLs on <code>github.com</code> inside the
                  project’s official release path. Drafts, pre-releases and builds whose names look like
                  debug, test, canary or leaked artifacts are excluded.
                </p>
                <p>
                  Changelogs and news posts are rendered from Markdown into React nodes. Raw HTML from
                  upstream content is never executed, and external links are restricted to an allowlist
                  of HTTPS hosts.
                </p>
                <p>
                  The app enforces security headers (CSP, HSTS, <code>X-Content-Type-Options</code>,
                  <code>Referrer-Policy</code>, frame protection and a permissions policy). HTTPS and
                  HSTS at the edge depend on the hosting provider; enable “force HTTPS” in production.
                  No site can promise absolute security, and APKs downloaded from anywhere other than
                  the official repository are outside the project’s control.
                </p>
              </div>
            </article>
          </div>

          <aside className="space-y-5">
            <div className="glass glass-highlight card-radius p-5">
              <div className="flex items-center gap-3">
                <BrandLogo size={56} />
                <div>
                  <p className="text-base font-semibold text-white">{site.name}</p>
                  <p className="text-xs text-white/45">{site.tagline}</p>
                </div>
              </div>
              <dl className="mt-4 divide-y divide-white/8 text-xs">
                {entityFacts.map((fact) => (
                  <div key={fact.label} className="flex items-start justify-between gap-4 py-2">
                    <dt className="text-white/40">{fact.label}</dt>
                    <dd className="text-right font-medium text-white/80">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[0.68rem] text-white/35">
                Latest stable detected:{" "}
                {release ? (
                  <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-violet-200 hover:text-white">
                    {release.tag}
                  </a>
                ) : (
                  "unavailable right now"
                )}
              </p>
            </div>

            <div className="glass card-radius p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white/85">
                <IconAndroid size={16} /> Platform
              </h2>
              <dl className="mt-2 space-y-1 text-xs">
                {requirements.slice(0, 4).map((row) => (
                  <div key={row.label}>
                    <dt className="text-white/35">{row.label}</dt>
                    <dd className="text-white/75">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/download" className="btn btn-glass btn-sm mt-4">
                Download guide <IconArrowRight size={13} />
              </Link>
            </div>

            <div className="glass card-radius p-5">
              <h2 className="text-sm font-semibold text-white/85">Project links</h2>
              <ul className="mt-2 space-y-1 text-xs">
                {[
                  { label: "Source code (vickyhubhai/Ariya)", href: links.repo },
                  { label: "Developer news (Ariya_news)", href: links.newsRepo },
                  { label: "Release history", href: "/releases" },
                  { label: "MIT License", href: links.license },
                  { label: "Issue tracker", href: links.issues },
                  { label: "About the developer", href: "/developer" },
                  { label: "Developer profile", href: links.developer },
                ].map((item) => (
                  <li key={item.href}>
                    {item.href.startsWith("http") ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tap tap-sm inline-flex items-center gap-1.5 break-anywhere text-white/60 transition hover:text-white"
                      >
                        {item.label} <IconExternal size={11} />
                      </a>
                    ) : (
                      <Link href={item.href} className="tap tap-sm inline-flex break-anywhere text-white/60 transition hover:text-white">
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <p className="px-1 text-[0.68rem] leading-relaxed text-white/30">
              Ariya is an independent project and is not affiliated with, endorsed by or sponsored by
              Spotify, YouTube, Google, Discord or any other music service. All trademarks belong to
              their respective owners.
            </p>
          </aside>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/breadcrumbs";
import { IconExternal, IconGithub, IconShield } from "@/components/icons";
import { FinalCta } from "@/components/sections/cta";
import { JsonLd } from "@/components/ui";
import { breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { links, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service — Ariya Music Player",
  description:
    "The terms that apply to using the Ariya Android app and this website: acceptable use, third-party service dependencies, copyright and music ownership, open-source licensing, availability and liability.",
  path: "/terms",
  keywords: ["Ariya terms of service", "Ariya license", "Ariya acceptable use"],
});

const UPDATED_DATE = "2026-11-12";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Terms of Service", path: "/terms" },
];

interface Section {
  id: string;
  title: string;
  children: React.ReactNode;
}

const sections: Section[] = [
  {
    id: "acceptance",
    title: "1. Acceptance of terms",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          These terms apply to the <strong>Ariya</strong> Android application and the official
          website <code>ariyamusic.us.ci</code>, both maintained by {site.developer} ({site.studio}).
          By installing the app or using this website you agree to them. If you do not agree, do not
          install or use the app.
        </p>
      </div>
    ),
  },
  {
    id: "usage",
    title: "2. Acceptable use",
    children: (
      <div className="prose-ariya mt-3">
        <p>Ariya is provided for personal, non-commercial music listening. You agree not to:</p>
        <ul>
          <li>use the app to infringe the rights of content owners or of any third-party service;</li>
          <li>abuse, overload or attack external services the app connects to;</li>
          <li>redistribute the app as if it were your own, in violation of its licence;</li>
          <li>misrepresent your affiliation with the Ariya project.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "third-party",
    title: "3. Third-party services and dependencies",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Ariya is a client. Discovery, streaming, lyrics, recognitions and integrations rely on
          external services operated by third parties — including YouTube/Google, JioSaavn and
          community JioSaavn endpoints, Spotify, Qobuz, LRCLIB, Paxsenix, ShazamKit/Apple, Last.fm,
          ListenBrainz, Discord and GitHub. Those services:
        </p>
        <ul>
          <li>are governed by their own terms and privacy policies, which you must respect;</li>
          <li>may change, restrict or terminate access at any time without notice;</li>
          <li>
            are not operated or controlled by the Ariya project, which makes no guarantee about
            their availability, content or behaviour.
          </li>
        </ul>
        <p>
          Ariya is an independent project. It is not affiliated with, endorsed by or sponsored by
          any of these services, and it does not claim their trademarks.
        </p>
      </div>
    ),
  },
  {
    id: "copyright",
    title: "4. Copyright and music ownership",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          The Ariya project does not own, host, license or sell any music, artwork, lyrics or other
          third-party content. Content you discover or play through the app comes from the external
          services you configure, and remains the property of its respective owners. Your use of
          that content is governed by the terms of the service providing it — it is your
          responsibility to comply with those terms and with applicable law. Requests about content
          must be directed to the service that hosts it.
        </p>
      </div>
    ),
  },
  {
    id: "licensing",
    title: "5. Open-source licensing",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Ariya is developed as open-source software. The applicable licence text is published in
          the official repository&apos;s{" "}
          <a href={links.license} target="_blank" rel="noopener noreferrer">
            LICENSE file
          </a>
          , which governs your rights to use, study, modify and redistribute the software. This
          website&apos;s own code is released under the MIT License. Third-party components used in
          the app (for example libraries bundled via Gradle) keep their own licences. Nothing in
          these terms limits what the applicable licence grants, and where these terms and the
          licence conflict, the licence prevails for the software itself.
        </p>
      </div>
    ),
  },
  {
    id: "distribution",
    title: "6. Distribution channels",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Official app packages are published only through the project&apos;s{" "}
          <a href={links.releases} target="_blank" rel="noopener noreferrer">
            GitHub Releases
          </a>{" "}
          (GMS and FOSS builds, phone and TV variants). This website links directly to those
          official assets and operates no mirrors. If and when Ariya becomes available on Google
          Play, that listing will be announced on this site; any other distribution source is not
          official and is not verified by the project.
        </p>
      </div>
    ),
  },
  {
    id: "availability",
    title: "7. External service availability",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Features that depend on external sources (discovery results, stream quality, lossless
          audio, lyrics coverage) are available only when the underlying service supports them for
          the specific track and region. The project cannot restore a feature that a third party has
          restricted, and does not promise uninterrupted access to any external service.
        </p>
      </div>
    ),
  },
  {
    id: "liability",
    title: "8. Disclaimer and limitation of liability",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          The app and the website are provided &ldquo;as is&rdquo;, without warranties of any kind.
          To the maximum extent permitted by law, the Ariya project and its contributors are not
          liable for any damages, data loss, service interruption or consequences arising from use
          of the app, the website, or the third-party services they connect to. Nothing here
          excludes liability that cannot be excluded under applicable law.
        </p>
      </div>
    ),
  },
  {
    id: "changes",
    title: "9. Changes to these terms",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          These terms may be updated as the project, its distribution channels or its integrations
          evolve. The revision date below reflects the current version; continued use after a
          change constitutes acceptance of the updated terms.
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    title: "10. Contact",
    children: (
      <div className="prose-ariya mt-3">
        <p>
          Questions about these terms are handled through the official repository issue tracker —
          see the <Link href="/contact">contact page</Link>. Data-handling details are described in
          the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          {
            "@type": "WebPage",
            name: "Ariya Music Player — Terms of Service",
            description:
              "Terms for using the Ariya Android app and the official Ariya website.",
            url: `${site.url}/terms`,
            dateModified: UPDATED_DATE,
            mainEntity: { "@id": `${site.url}/#software` },
            publisher: { "@id": `${site.url}/#organization` },
          },
        ])}
      />
      <PageHeader
        eyebrow="Terms of Service"
        title="Plain terms for an open project"
        intro="What you may do with Ariya, what the app depends on, who owns the music, and where responsibility begins and ends."
        crumbs={crumbs}
        meta={
          <>
            <span className="chip">
              <IconShield size={13} /> Last updated {UPDATED_DATE}
            </span>
            <a href={links.repo} target="_blank" rel="noopener noreferrer" className="chip hover:text-white">
              <IconGithub size={13} /> Official repository <IconExternal size={11} />
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
              These terms cover the Ariya app and this website only. Third-party services have their
              own terms, which you accept directly with them when you use the matching feature.
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
              <h2 className="text-sm font-semibold text-white/85">Related</h2>
              <ul className="mt-3 space-y-1.5 text-xs">
                <li>
                  <Link href="/privacy" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    Contact / Support
                  </Link>
                </li>
                <li>
                  <a
                    href={links.license}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap tap-sm inline-flex items-center gap-1.5 break-anywhere text-white/60 transition hover:text-white"
                  >
                    LICENSE file <IconExternal size={11} />
                  </a>
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

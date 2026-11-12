import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/breadcrumbs";
import { IconAlert, IconExternal, IconGithub, IconShield, IconSparkles } from "@/components/icons";
import { FinalCta } from "@/components/sections/cta";
import { JsonLd } from "@/components/ui";
import { breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { links, site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact & Support — Ariya Music Player",
  description:
    "Get help with Ariya: report bugs, request features, and learn what information to include. Official support runs through the project's GitHub issue tracker.",
  path: "/contact",
  keywords: ["Ariya support", "Ariya contact", "Ariya bug report", "Ariya feature request"],
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Contact", path: "/contact" },
];

const bugReportItems = [
  "Ariya version (shown in the app's update screen or release notes)",
  "Build variant: GMS or FOSS, phone or TV",
  "Device model and Android version",
  "Clear steps to reproduce the problem",
  "What you expected, and what actually happened",
  "Relevant error messages or logs (with personal data removed)",
];

const featureRequestItems = [
  "The problem you are trying to solve, not only the solution",
  "Whether it relates to playback, lyrics, library, integrations or the interface",
  "Whether it depends on a specific external source or build variant",
];

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          {
            "@type": "ContactPage",
            name: "Ariya Music Player — Contact & Support",
            description:
              "Official support channels for Ariya Music Player: GitHub issue reporting for bugs and feature requests.",
            url: `${site.url}/contact`,
            mainEntity: { "@id": `${site.url}/#organization` },
            publisher: { "@id": `${site.url}/#organization` },
          },
        ])}
      />
      <PageHeader
        eyebrow="Contact & Support"
        title="Get help with Ariya"
        intro="Ariya is an independent open-source project. Support is handled publicly through the official GitHub issue tracker — every report is visible, searchable and answered by the maintainer."
        crumbs={crumbs}
        meta={
          <>
            <a href={links.issues} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
              <IconGithub size={14} /> Open the issue tracker <IconExternal size={11} />
            </a>
            <span className="chip">
              <IconShield size={13} /> Official channel
            </span>
          </>
        }
      />

      <section className="section">
        <div className="container-page grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">Official support channel</h2>
              <div className="prose-ariya mt-3">
                <p>
                  The project does not operate a public email inbox, web form or phone line. The
                  official support contact is the repository issue tracker:{" "}
                  <a href={links.issues} target="_blank" rel="noopener noreferrer">
                    github.com/vickyhubhai/Ariya/issues
                  </a>
                  . A GitHub account is required to post, which keeps support public and spam-free.
                </p>
                <p>
                  Before opening a new issue, please search existing ones — your problem may already
                  be reported, fixed in a newer release or explained in the{" "}
                  <Link href="/faq">FAQ</Link> or the <Link href="/guide">user guide</Link>.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3 flex items-center gap-2">
                <IconAlert size={18} /> Reporting a bug
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Open a bug report and include as much of the following as you can — the more precise
                the report, the faster it can be reproduced and fixed:
              </p>
              <ul className="mt-4 space-y-2">
                {bugReportItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-300/80" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3 flex items-center gap-2">
                <IconSparkles size={18} /> Requesting a feature
              </h2>
              <div className="prose-ariya mt-3">
                <p>Feature requests are welcome. A good request explains:</p>
                <ul>
                  {featureRequestItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p>
                  Please note the project&apos;s scope: Ariya focuses on music playback, discovery,
                  lyrics and integrations that its sources actually support. Features the Android
                  application does not implement are not advertised or promised anywhere on this
                  site.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7 border border-amber-300/15">
              <h2 className="h3 flex items-center gap-2 text-amber-100">
                <IconShield size={18} /> Never share credentials
              </h2>
              <div className="prose-ariya mt-3">
                <p>
                  Do <strong>not</strong> post passwords, API keys, session tokens, cookies, signing
                  credentials or any other private secrets in issues, screenshots or logs — issues
                  are public. If you accidentally expose a credential, revoke it with the provider
                  (Spotify, Google, Last.fm, Discord…) before anything else.
                </p>
                <p>
                  Remove personal data from log files before attaching them. Reports containing
                  secrets may be edited or redacted by the maintainer.
                </p>
              </div>
            </article>

            <article className="glass card-radius p-6 sm:p-7">
              <h2 className="h3">Response expectations</h2>
              <div className="prose-ariya mt-3">
                <p>
                  Ariya is maintained by a volunteer developer. There is no guaranteed response
                  time; issues are triaged on a best-effort basis. Security-sensitive reports are
                  taken seriously — for responsible disclosure, open an issue describing the
                  category of the problem without public exploit details, or contact the maintainer
                  through their GitHub profile.
                </p>
              </div>
            </article>
          </div>

          <aside className="space-y-5 self-start lg:sticky lg:top-[calc(var(--nav-height)+1.25rem)]">
            <div className="glass glass-highlight card-radius p-5">
              <h2 className="text-sm font-semibold text-white/85">Quick links</h2>
              <ul className="mt-3 space-y-1.5 text-xs">
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
                    <IconGithub size={13} /> Source repository <IconExternal size={11} />
                  </a>
                </li>
                <li>
                  <Link href="/faq" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    FAQ — common questions
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    User guide
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/releases" className="tap tap-sm inline-flex text-white/60 transition hover:text-white">
                    Release history — check your version
                  </Link>
                </li>
              </ul>
            </div>

            <div className="glass card-radius p-5">
              <h2 className="text-sm font-semibold text-white/85">Before you report</h2>
              <p className="mt-2 text-xs leading-relaxed text-white/50">
                Most playback and lyrics issues come down to the selected source: availability
                differs per track, per provider and per region. Try another track, lower the quality,
                or enable the JioSaavn fallback before reporting.
              </p>
              <Link href="/guide" className="btn btn-glass btn-sm mt-4">
                Open the guide
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <FinalCta />
    </>
  );
}

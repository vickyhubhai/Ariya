import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BuildPicker } from "@/components/download";
import { IconAlert, IconAndroid, IconArrowRight, IconCheck, IconGithub, IconShield, IconTv } from "@/components/icons";
import { FaqSection } from "@/components/faq";
import { JsonLd } from "@/components/ui";
import { getLatestRelease, getReleases } from "@/lib/github";
import { formatCount, formatDate } from "@/lib/format";
import { absoluteUrl, breadcrumbSchema, graph, pageMetadata, softwareApplicationSchema } from "@/lib/seo";
import { installSteps, links, requirements, site } from "@/lib/site";

export const dynamic = "force-dynamic";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Download", path: "/download" },
];

export const metadata: Metadata = pageMetadata({
  title: "Download Ariya APK for Android — Latest Stable Release",
  description:
    "Download the latest stable Ariya APK for Android 8.0+. Choose GMS or FOSS builds, ARM64 or Universal, with verified sizes and official GitHub download links.",
  path: "/download",
  image: "/assets/icon-512.png",
  imageAlt: "Ariya Music Player app icon",
});

export default async function DownloadPage() {
  const [latest, releases] = await Promise.all([getLatestRelease(), getReleases()]);
  const release = latest.ok ? latest.data.release : null;
  const history = releases.ok ? releases.data.releases.slice(0, 5) : [];

  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          softwareApplicationSchema(release),
          {
            "@type": "HowTo",
            name: "How to install Ariya Music Player on Android",
            description:
              "Download the latest stable Ariya APK from GitHub Releases and install it on an Android 8.0+ device.",
            totalTime: "PT3M",
            step: installSteps.map((step, index) => ({
              "@type": "HowToStep",
              position: index + 1,
              name: step.title,
              text: step.body,
            })),
          },
        ])}
      />

      <header className="relative overflow-hidden border-b border-white/8 pt-[calc(var(--nav-height)+2.5rem)] pb-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="aurora orb-violet" style={{ width: 540, height: 540, top: "-45%", left: "-6%", opacity: 0.45 }} />
          <div className="aurora orb-blue" style={{ width: 420, height: 420, top: "-15%", right: "-8%", opacity: 0.35 }} />
          <div className="grid-floor" />
          <div className="noise" />
        </div>
        <div className="container-page relative">
          <Breadcrumbs items={crumbs} />
          <p className="kicker mt-5">Download</p>
          <h1 className="mt-4 max-w-3xl text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.03] tracking-[-0.04em] text-balance text-white">
            Download Ariya for Android
          </h1>
          <p className="lede mt-4 max-w-2xl">
            Free, open-source and published only through GitHub Releases. Pick a build below — the
            version, changelog and file sizes always come from the same stable release.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="chip"><IconAndroid size={13} /> Android 8.0+</span>
            <span className="chip"><IconShield size={13} /> MIT License</span>
            {release ? (
              <span className="chip border-violet-300/25 bg-violet-400/10 text-violet-100">
                Latest stable v{release.version}
              </span>
            ) : (
              <span className="chip border-amber-300/25 text-amber-100/80">
                <IconAlert size={13} /> Release data unavailable
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="section" aria-labelledby="builds-heading">
        <div className="container-page grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <h2 id="builds-heading" className="h2 text-[clamp(1.4rem,2.6vw,2rem)]">
              Available builds
            </h2>
            <p className="lede mt-2 max-w-xl text-sm">
              APK names are parsed directly from the release assets. GMS builds target devices with
              Google Mobile Services; FOSS builds are the free-software flavour. TV builds are
              published separately for large-screen devices.
            </p>
            <div className="mt-6">
              <BuildPicker heading={false} />
            </div>

            <div className="glass card-radius mt-6 p-5">
              <h3 className="text-sm font-semibold text-white/90">What happens when you tap download?</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">
                Your browser requests the file from <code className="rounded bg-white/8 px-1 py-0.5 text-[0.82em]">github.com/vickyhubhai/Ariya/releases/download/…</code>.
                This site never proxies, mirrors or modifies APKs, and no download is counted or
                tracked by us.
              </p>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="glass card-radius p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <IconAndroid size={16} /> System requirements
              </h2>
              <dl className="mt-3 divide-y divide-white/6 text-xs">
                {requirements.map((row) => (
                  <div key={row.label} className="flex items-start justify-between gap-4 py-2">
                    <dt className="text-white/40">{row.label}</dt>
                    <dd className="break-words text-right text-white/75">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="glass card-radius p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <IconCheck size={16} /> Installation steps
              </h2>
              <ol className="mt-3 space-y-3">
                {installSteps.map((step, index) => (
                  <li key={step.title} className="flex gap-3 text-xs">
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
            </div>

            <div className="glass card-radius p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white/90">
                <IconTv size={16} /> Recent stable releases
              </h2>
              {history.length > 0 ? (
                <ul className="mt-3 space-y-2 text-xs">
                  {history.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3">
                      <Link
                        href={`/releases/${encodeURIComponent(item.tag)}`}
                        className="text-white/75 transition hover:text-white"
                      >
                        v{item.version}
                      </Link>
                      <span className="text-white/35">
                        {formatDate(item.publishedAt)} · {formatCount(item.downloads)} downloads
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-3 space-y-2" aria-hidden="true">
                  {[0, 1, 2].map((key) => (
                    <span key={key} className="skeleton block h-3 w-full" />
                  ))}
                </div>
              )}
              <Link href="/releases" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-violet-200 hover:text-white">
                Full release history <IconArrowRight size={13} />
              </Link>
            </div>

            <div className="rounded-2xl border border-violet-300/15 bg-violet-500/6 p-4">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-violet-100/80">
                <IconShield size={15} className="mt-0.5 shrink-0" />
                Verify you are on <strong className="font-semibold">ariyamusic.us.ci</strong> or the
                official GitHub repository before installing. {site.name} does not operate mirrors.
              </p>
              <a href={links.repo} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm mt-3">
                <IconGithub size={14} /> Official repository
              </a>
            </div>
          </aside>
        </div>
      </section>

      <FaqSection />
    </>
  );
}

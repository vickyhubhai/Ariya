import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DownloadButton } from "@/components/download";
import { IconAlert, IconArrowRight, IconExternal, IconGithub } from "@/components/icons";
import { JsonLd } from "@/components/ui";
import { Markdown, markdownToText } from "@/lib/markdown";
import { getReleases } from "@/lib/github";
import { formatCount, formatDate } from "@/lib/format";
import { absoluteUrl, breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { links, site } from "@/lib/site";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const result = await getReleases();
  const release = result.ok ? result.data.releases.find((item) => item.tag === decoded) : null;

  if (!release) {
    return pageMetadata({
      title: "Release not found",
      description: "This Ariya release could not be found in the official GitHub release history.",
      path: `/releases/${tag}`,
      noindex: true,
    });
  }

  const summary =
    markdownToText(release.body, 150) ||
    `Ariya ${release.tag} was published on ${formatDate(release.publishedAt)}.`;

  return pageMetadata({
    title: `Ariya ${release.tag} — Release Notes & APK Download`,
    description: `${summary} Download the official ${release.variants.length} APK asset${release.variants.length === 1 ? "" : "s"} for ${release.tag}.`,
    path: `/releases/${encodeURIComponent(release.tag)}`,
    type: "article",
    publishedTime: release.publishedAt,
    modifiedTime: release.publishedAt,
    image: site.ogImage,
  });
}

export default async function ReleaseDetailPage({ params }: PageProps) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const result = await getReleases();

  if (!result.ok) {
    return (
      <div className="container-page section pt-[calc(var(--nav-height)+3rem)]">
        <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Releases", path: "/releases" }, { name: decoded, path: `/releases/${tag}` }]} />
        <div className="glass card-radius mt-6 p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-100/90">
            <IconAlert size={16} /> Release data is temporarily unavailable
          </p>
          <p className="mt-2 text-sm text-white/50">{result.error.message}</p>
          <Link href="/releases" className="btn btn-glass btn-sm mt-4">
            Back to releases
          </Link>
        </div>
      </div>
    );
  }

  const release = result.data.releases.find((item) => item.tag === decoded);
  if (!release) notFound();

  const index = result.data.releases.findIndex((item) => item.id === release.id);
  const older = result.data.releases[index + 1];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Releases", path: "/releases" },
    { name: release.tag, path: `/releases/${encodeURIComponent(release.tag)}` },
  ];

  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          {
            "@type": "TechArticle",
            headline: `Ariya ${release.tag} release notes`,
            description: markdownToText(release.body, 200),
            datePublished: release.publishedAt,
            dateModified: release.publishedAt,
            mainEntityOfPage: absoluteUrl(`/releases/${encodeURIComponent(release.tag)}`),
            author: { "@type": "Person", name: release.author },
            publisher: { "@id": `${site.url}/#organization` },
            about: { "@id": `${site.url}/#software` },
          },
        ])}
      />

      <header className="relative overflow-hidden border-b border-white/8 pt-[calc(var(--nav-height)+2.5rem)] pb-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="aurora orb-violet" style={{ width: 520, height: 520, top: "-48%", left: "-6%", opacity: 0.42 }} />
          <div className="grid-floor" />
          <div className="noise" />
        </div>
        <div className="container-page relative">
          <Breadcrumbs items={crumbs} />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="chip border-violet-300/30 bg-violet-400/10 text-violet-100">{release.tag}</span>
            <span className="chip">{formatDate(release.publishedAt)}</span>
            {index === 0 ? (
              <span className="chip border-emerald-300/25 text-emerald-100/85">Latest stable</span>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-3xl text-[clamp(1.9rem,4.4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white">
            {release.name}
          </h1>
          <p className="lede mt-3 max-w-2xl text-sm">
            {release.variants.length} APK assets · {formatCount(release.downloads)} downloads · published by{" "}
            {release.author}. Metadata is read live from GitHub Releases.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <DownloadButton variant={release.primary} releaseTag={release.tag} label="Download recommended APK" />
            <a href={release.htmlUrl} target="_blank" rel="noopener noreferrer" className="btn btn-glass">
              <IconGithub size={15} /> View on GitHub <IconExternal size={12} />
            </a>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container-page grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="glass card-radius p-5 sm:p-7">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/40">Release notes</h2>
            <div className="mt-4">
              {release.body ? (
                <Markdown markdown={release.body} />
              ) : (
                <p className="text-sm text-white/45">
                  This release does not include written notes. Assets are still available below and on
                  GitHub.
                </p>
              )}
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/8 pt-5">
              {older ? (
                <Link href={`/releases/${encodeURIComponent(older.tag)}`} className="btn btn-ghost btn-sm">
                  Previous: {older.tag} <IconArrowRight size={13} />
                </Link>
              ) : null}
              <Link href="/releases" className="btn btn-ghost btn-sm">
                All releases
              </Link>
              <Link href="/download" className="btn btn-glass btn-sm">
                Download guide
              </Link>
            </div>
          </article>

          <aside>
            <div className="glass card-radius p-5">
              <h2 className="text-sm font-semibold text-white/90">APK assets</h2>
              <ul className="mt-3 space-y-3">
                {release.variants.map((variant) => (
                  <li key={variant.id} className="rounded-2xl border border-white/8 bg-white/3 p-3">
                    <p className="break-all font-mono text-[0.72rem] text-white/70">{variant.fileName}</p>
                    <p className="mt-1 text-[0.68rem] text-white/35">
                      {variant.label} · {variant.sizeLabel} · {formatCount(variant.downloads)} downloads
                    </p>
                    {variant.sha256 ? (
                      <p className="mt-1 break-all text-[0.62rem] text-white/25">sha256 {variant.sha256}</p>
                    ) : null}
                    <DownloadButton variant={variant} releaseTag={release.tag} size="sm" label="Download" className="mt-2" />
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.68rem] leading-relaxed text-white/35">
                Files open on github.com in the official release path. This site does not mirror APKs.{" "}
                <a href={links.license} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  MIT licensed
                </a>
                .
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

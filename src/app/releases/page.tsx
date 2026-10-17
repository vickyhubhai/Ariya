import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/breadcrumbs";
import { IconAlert, IconExternal, IconGithub, IconRefresh } from "@/components/icons";
import { RefreshButton } from "@/components/refresh-button";
import { ReleaseExplorer } from "@/components/release-notes";
import { JsonLd } from "@/components/ui";
import { getReleases } from "@/lib/github";
import { formatCount } from "@/lib/format";
import { breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { links } from "@/lib/site";

export const dynamic = "force-dynamic";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Releases", path: "/releases" },
];

export const metadata: Metadata = pageMetadata({
  title: "Ariya Release History & Changelogs",
  description:
    "Browse every stable Ariya Music Player release with expandable changelogs, APK variants, file sizes and official GitHub download links.",
  path: "/releases",
  keywords: ["Ariya releases", "Ariya changelog", "Ariya version history", "Ariya APK versions"],
});

export default async function ReleasesPage() {
  const result = await getReleases();
  const releases = result.ok ? result.data.releases : [];
  const totalDownloads = releases.reduce((total, release) => total + release.downloads, 0);

  return (
    <>
      <JsonLd data={graph([breadcrumbSchema(crumbs)])} />
      <PageHeader
        eyebrow="Release explorer"
        title="Every stable Ariya release, in one place"
        intro="Expand any release to read its full changelog, inspect every APK asset and download from the official GitHub URL. Drafts, pre-releases and test builds are excluded automatically."
        crumbs={crumbs}
        meta={
          <>
            <span className="chip">
              {result.ok ? `${releases.length} stable releases` : "Release history"}
            </span>
            {result.ok ? (
              <>
                <span className="chip">{formatCount(totalDownloads)} APK downloads</span>
                <span className="chip border-emerald-300/25 text-emerald-100/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {result.stale ? "Cached snapshot" : "Live from GitHub"}
                </span>
              </>
            ) : null}
            <a href={links.releases} target="_blank" rel="noopener noreferrer" className="chip hover:text-white">
              <IconGithub size={13} /> GitHub Releases <IconExternal size={11} />
            </a>
          </>
        }
      />

      <section className="section">
        <div className="container-page">
          {result.ok ? (
            <>
              {result.data.releases.length > 0 ? (
                <ReleaseExplorer releases={releases} />
              ) : (
                <div className="glass card-radius p-8 text-center">
                  <p className="text-sm font-medium text-white/80">No stable releases with APK assets yet.</p>
                  <p className="mt-1.5 text-sm text-white/45">
                    Pre-releases and drafts are intentionally excluded from this explorer.
                  </p>
                  <a href={links.releases} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm mt-4">
                    Check GitHub Releases
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="glass card-radius p-6 sm:p-8">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-100/90">
                <IconAlert size={16} /> Release history is temporarily unavailable
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
                {result.error.message} The API may be rate limited or temporarily unreachable. Release
                data is cached for a few minutes, so retrying usually works.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <RefreshButton label="Retry" />
                <a href={links.releases} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm">
                  <IconRefresh size={14} /> Open GitHub Releases
                </a>
              </div>
            </div>
          )}

          <div className="glass card-radius mt-8 p-5">
            <h2 className="text-sm font-semibold text-white/90">How this list is built</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/50">
              This explorer calls <code className="rounded bg-white/8 px-1 py-0.5">GET /repos/vickyhubhai/Ariya/releases</code>{" "}
              and keeps only non-draft, non-prerelease entries that contain at least one uploaded{" "}
              <code className="rounded bg-white/8 px-1 py-0.5">.apk</code> asset. Assets are linked only when the
              URL is HTTPS on github.com under the project’s release path. Response data is cached
              server-side for five minutes to respect GitHub’s rate limits.{" "}
              <Link href="/about" className="text-violet-200 underline decoration-violet-300/30 underline-offset-2">
                How the site works
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

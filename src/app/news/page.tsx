import type { Metadata } from "next";
import { PageHeader } from "@/components/breadcrumbs";
import { IconAlert, IconExternal, IconGithub } from "@/components/icons";
import { NewsExplorer } from "@/components/news-explorer";
import { RefreshButton } from "@/components/refresh-button";
import { JsonLd } from "@/components/ui";
import { getNewsList } from "@/lib/news";
import { absoluteUrl, breadcrumbSchema, graph, pageMetadata } from "@/lib/seo";
import { links, site } from "@/lib/site";

export const dynamic = "force-dynamic";

const crumbs = [
  { name: "Home", path: "/" },
  { name: "News", path: "/news" },
];

export const metadata: Metadata = pageMetadata({
  title: "Ariya Developer News & Release Announcements",
  description:
    "Official Ariya Music Player announcements from the Ariya_news repository: release highlights, design updates and stability notes written by the developer.",
  path: "/news",
  keywords: ["Ariya news", "Ariya updates", "Ariya release announcements"],
});

export default async function NewsPage() {
  const result = await getNewsList();
  const posts = result.ok ? result.data.posts : [];

  return (
    <>
      <JsonLd
        data={graph([
          breadcrumbSchema(crumbs),
          {
            "@type": "Blog",
            "@id": `${site.url}/news#blog`,
            name: "Ariya developer news",
            description:
              "Release announcements and development updates for the Ariya Music Player, published in the Ariya_news repository.",
            url: absoluteUrl("/news"),
            publisher: { "@id": `${site.url}/#organization` },
            blogPost: posts.slice(0, 10).map((post) => ({
              "@type": "BlogPosting",
              headline: post.title,
              datePublished: post.date,
              url: absoluteUrl(`/news/${post.slug}`),
              author: { "@type": "Person", name: post.author },
            })),
          },
        ])}
      />
      <PageHeader
        eyebrow="Developer news"
        title="Release updates, written by the developer"
        intro="Every post below comes from the public Ariya_news repository. Metadata is fetched from metadata.json, and full posts are rendered from their Markdown source — sanitised, never injected as raw HTML."
        crumbs={crumbs}
        meta={
          <>
            <span className="chip">{result.ok ? `${posts.length} posts` : "News feed"}</span>
            <a href={links.newsRepo} target="_blank" rel="noopener noreferrer" className="chip hover:text-white">
              <IconGithub size={13} /> Ariya_news <IconExternal size={11} />
            </a>
            <a href="/feed.xml" className="chip hover:text-white">
              RSS feed
            </a>
          </>
        }
      />

      <section className="section">
        <div className="container-page">
          {result.ok ? (
            posts.length > 0 ? (
              <>
                {result.stale ? (
                  <p className="mb-4 chip border-amber-300/25 text-amber-100/80">
                    Showing a cached snapshot · GitHub may be temporarily unreachable
                  </p>
                ) : null}
                <NewsExplorer posts={posts} />
              </>
            ) : (
              <div className="glass card-radius p-8 text-center">
                <h2 className="text-sm font-medium text-white/85">No posts published yet</h2>
                <p className="mt-2 text-sm text-white/45">
                  The Ariya_news repository is available, but its metadata file is empty. New
                  announcements will appear here automatically.
                </p>
                <a href={links.newsRepo} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm mt-4">
                  Open Ariya_news
                </a>
              </div>
            )
          ) : (
            <div className="glass card-radius p-6 sm:p-8">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-100/90">
                <IconAlert size={16} /> Developer news is temporarily unavailable
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">{result.error.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <RefreshButton label="Retry" />
                <a href={links.newsRepo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  Read on GitHub
                </a>
              </div>
            </div>
          )}

          <div className="glass card-radius mt-8 p-5">
            <h2 className="text-sm font-semibold text-white/90">Where this content comes from</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/50">
              The news feed reads <code className="rounded bg-white/8 px-1 py-0.5">metadata.json</code> and the{" "}
              <code className="rounded bg-white/8 px-1 py-0.5">content/</code> directory of{" "}
              <a
                href={links.newsRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-200 underline decoration-violet-300/30 underline-offset-2"
              >
                vickyhubhai/Ariya_news
              </a>{" "}
              over HTTPS, normalises the dates and validates post ids before rendering. If a post
              disappears upstream, its page returns a 404 instead of showing stale copy.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

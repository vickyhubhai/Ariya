import Link from "next/link";
import { IconAlert, IconArrowRight, IconExternal, IconGithub } from "@/components/icons";
import { NewsCard, NewsSkeleton } from "@/components/news-card";
import { Reveal } from "@/components/reveal";
import { RefreshButton } from "@/components/refresh-button";
import { SectionHeading } from "@/components/ui";
import { getNewsList } from "@/lib/news";
import { links } from "@/lib/site";

export async function NewsPreview({ limit = 3 }: { limit?: number }) {
  const result = await getNewsList();

  return (
    <section id="news" className="section relative" aria-labelledby="news-heading">
      <div className="container-page">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <SectionHeading
              align="left"
              id="news-heading"
              kicker="Developer news"
              title={
                <>
                  Updates from the <span className="text-gradient-violet">Ariya_news</span> repository
                </>
              }
            >
              Release announcements written by the developer, parsed from the public Ariya_news
              content directory and rendered safely on this site.
            </SectionHeading>
          </Reveal>
          <Reveal delay={80}>
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/news" className="btn btn-glass btn-sm">
                All updates <IconArrowRight size={13} />
              </Link>
              <a href={links.newsRepo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                <IconGithub size={14} /> News repo <IconExternal size={11} />
              </a>
            </div>
          </Reveal>
        </div>

        <div className="mt-10">
          {result.ok ? (
            result.data.posts.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {result.data.posts.slice(0, limit).map((post, index) => (
                  <Reveal key={post.id} delay={index * 70}>
                    <NewsCard post={post} priority={index === 0} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <div className="glass card-radius p-8 text-center">
                <p className="text-sm font-medium text-white/80">No developer news has been published yet.</p>
                <p className="mt-1.5 text-sm text-white/45">
                  The Ariya_news repository exists but contains no posts. Check back after the next
                  release.
                </p>
                <a href={links.newsRepo} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm mt-4">
                  Visit Ariya_news
                </a>
              </div>
            )
          ) : (
            <div className="glass card-radius p-6 sm:p-8">
              <p className="flex items-center gap-2 text-sm font-medium text-amber-100/90">
                <IconAlert size={16} /> Developer news could not be loaded
              </p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/50">{result.error.message}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <RefreshButton label="Retry news" />
                <a href={links.newsRepo} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">
                  Open Ariya_news on GitHub
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function NewsPreviewSkeleton() {
  return (
    <section className="section" aria-hidden="true">
      <div className="container-page">
        <span className="skeleton block h-3 w-28" />
        <span className="skeleton mt-4 block h-8 w-2/3 max-w-lg" />
        <div className="mt-10">
          <NewsSkeleton />
        </div>
      </div>
    </section>
  );
}

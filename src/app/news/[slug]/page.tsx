import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BrandLogo } from "@/components/brand-logo";
import { IconAlert, IconArrowRight, IconExternal, IconGithub } from "@/components/icons";
import { JsonLd } from "@/components/ui";
import { Markdown } from "@/lib/markdown";
import { SafeImage } from "@/components/safe-image";
import { getNewsList, getNewsPost } from "@/lib/news";
import { newsImageProxyUrl } from "@/lib/news-image";
import { absoluteUrl, breadcrumbSchema, graph, newsArticleSchema, pageMetadata } from "@/lib/seo";
import { links, site } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getNewsPost(slug);
  if (!result.ok) {
    return pageMetadata({
      title: "News post not found",
      description: "This Ariya developer update could not be found.",
      path: `/news/${slug}`,
      noindex: true,
    });
  }
  const { post } = result.data;
  return pageMetadata({
    title: post.title,
    description: post.description,
    path: `/news/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.date,
    image: post.image ? newsImageProxyUrl(post.image, 1200) : site.ogImage,
    imageAlt: post.title,
  });
}

export default async function NewsPostPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getNewsPost(slug);

  if (!result.ok) {
    if (result.error.code === "not_found") notFound();
    const crumbs = [
      { name: "Home", path: "/" },
      { name: "News", path: "/news" },
      { name: slug, path: `/news/${slug}` },
    ];
    return (
      <div className="container-page section pt-[calc(var(--nav-height)+3rem)]">
        <Breadcrumbs items={crumbs} />
        <div className="glass card-radius mt-6 p-6">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-100/90">
            <IconAlert size={16} /> This update could not be loaded
          </p>
          <p className="mt-2 text-sm text-white/50">{result.error.message}</p>
          <Link href="/news" className="btn btn-glass btn-sm mt-4">
            Back to news
          </Link>
        </div>
      </div>
    );
  }

  const { post, markdown } = result.data;
  const list = await getNewsList();
  const others = list.ok ? list.data.posts.filter((item) => item.id !== post.id).slice(0, 2) : [];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "News", path: "/news" },
    { name: post.title, path: `/news/${post.slug}` },
  ];

  return (
    <>
      <JsonLd data={graph([breadcrumbSchema(crumbs), newsArticleSchema(post)])} />

      <header className="relative overflow-hidden border-b border-white/8 pt-[calc(var(--nav-height)+2.5rem)] pb-10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="aurora orb-violet" style={{ width: 520, height: 520, top: "-44%", left: "-6%", opacity: 0.4 }} />
          <div className="grid-floor" />
          <div className="noise" />
        </div>
        <div className="container-page relative">
          <Breadcrumbs items={crumbs} />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="chip">{post.dateLabel}</span>
            <span className="chip">By {post.author}</span>
            {post.important ? (
              <span className="chip border-violet-300/30 bg-violet-400/10 text-violet-100">Featured</span>
            ) : null}
          </div>
          <h1 className="mt-4 max-w-3xl text-[clamp(1.9rem,4.4vw,3rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-balance text-white">
            {post.title}
          </h1>
          <p className="lede mt-3 max-w-2xl text-sm">{post.description}</p>
        </div>
      </header>

      <section className="section">
        <div className="container-page grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <article className="glass card-radius overflow-hidden">
            {post.image ? (
              <div className="relative aspect-[16/9] w-full border-b border-white/8 bg-black/30">
                <SafeImage
                  src={newsImageProxyUrl(post.image, 1280)}
                  alt={`Artwork for the Ariya update “${post.title}”`}
                  priority
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="p-5 sm:p-7">
              <Markdown markdown={markdown} />
              <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/8 pt-5">
                <a href={post.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-glass btn-sm">
                  <IconGithub size={14} /> View source <IconExternal size={11} />
                </a>
                <Link href="/news" className="btn btn-ghost btn-sm">
                  All updates
                </Link>
                <Link href="/download" className="btn btn-ghost btn-sm">
                  Download Ariya <IconArrowRight size={13} />
                </Link>
              </div>
            </div>
          </article>

          <aside className="space-y-5">
            <div className="glass card-radius p-5">
              <div className="flex items-center gap-3">
                <BrandLogo size={38} />
                <div>
                  <p className="text-sm font-semibold text-white/90">{site.name}</p>
                  <p className="text-[0.7rem] text-white/40">By {site.developer} · {site.studio}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/45">
                {site.description}
              </p>
              <a
                href={links.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-glass btn-sm mt-3"
              >
                <IconGithub size={14} /> Follow the project
              </a>
            </div>

            <div className="glass card-radius p-5">
              <h2 className="text-sm font-semibold text-white/85">Published in Ariya_news</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-white/45">
                Source file: <code className="rounded bg-white/8 px-1 py-0.5">{post.contentFile}</code>.
                Content is rendered from Markdown with links restricted to HTTPS project hosts.
              </p>
              <a
                href={links.newsContent}
                target="_blank"
                rel="noopener noreferrer"
                className="tap mt-2 inline-flex items-center gap-1 text-xs text-violet-200 hover:text-white"
              >
                Browse the news source <IconExternal size={11} />
              </a>
            </div>

            {others.length > 0 ? (
              <div className="glass card-radius p-5">
                <h2 className="text-sm font-semibold text-white/85">More updates</h2>
                <ul className="mt-3 space-y-3">
                  {others.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/news/${item.slug}`}
                        className="text-sm font-medium text-white/75 transition hover:text-white"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-0.5 text-[0.68rem] text-white/35">{item.dateLabel}</p>
                    </li>
                  ))}
                </ul>
                <Link href="/news" className="mt-4 inline-flex items-center gap-1 text-xs text-violet-200 hover:text-white">
                  All developer news <IconArrowRight size={12} />
                </Link>
              </div>
            ) : null}

            <p className="text-[0.68rem] leading-relaxed text-white/30">
              Canonical source:{" "}
              <span className="break-all text-white/40">{absoluteUrl(`/news/${post.slug}`)}</span>
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}

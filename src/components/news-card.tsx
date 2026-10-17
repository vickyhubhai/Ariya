import Link from "next/link";
import { IconArrowRight, IconExternal, IconGithub } from "@/components/icons";
import type { NewsPost } from "@/lib/news";
import { newsImageProxyUrl } from "@/lib/news-image";
import { SafeImage } from "@/components/safe-image";

function NewsThumb({ post, priority = false }: { post: NewsPost; priority?: boolean }) {
  if (!post.image) {
    return (
      <div
        aria-hidden="true"
        className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,#2a1a55,#0d1b3a_60%,#0a0a13)]"
      >
        <span className="text-3xl">🎵</span>
      </div>
    );
  }
  return (
    <SafeImage
      src={newsImageProxyUrl(post.image, 720)}
      alt={`Artwork for the Ariya update “${post.title}”`}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={priority}
      className="object-cover transition duration-500 group-hover:scale-[1.03]"
    />
  );
}

export function NewsCard({ post, priority = false }: { post: NewsPost; priority?: boolean }) {
  return (
    <article className="glass glass-highlight card-radius group flex h-full flex-col overflow-hidden transition-transform duration-500 hover:-translate-y-1">
      <Link href={`/news/${post.slug}`} className="relative block aspect-[16/9] w-full overflow-hidden bg-white/5">
        <NewsThumb post={post} priority={priority} />
        <span className="absolute left-3 top-3 chip border-white/20 bg-black/45 text-white/80 backdrop-blur">
          {post.dateLabel}
        </span>
        {post.important ? (
          <span className="absolute right-3 top-3 chip border-violet-300/30 bg-violet-500/25 text-violet-50">
            Featured
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-[1.02rem] font-semibold leading-snug text-white/95">
          <Link href={`/news/${post.slug}`} className="transition hover:text-white">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/50">{post.description}</p>
        <div className="mt-4 flex items-center gap-2 text-[0.7rem] text-white/35">
          <IconGithub size={13} />
          <span>by {post.author}</span>
          <span aria-hidden="true">·</span>
          <span>{post.dateLabel}</span>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-5">
          <Link
            href={`/news/${post.slug}`}
            className="tap inline-flex items-center gap-1.5 text-xs font-medium text-violet-200 transition hover:text-white"
          >
            Read the update
            <IconArrowRight size={13} />
          </Link>
          <a
            href={post.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="tap tap-sm inline-flex items-center gap-1 text-[0.68rem] text-white/35 transition hover:text-white/70"
          >
            Source <IconExternal size={11} />
          </a>
        </div>
      </div>
    </article>
  );
}

export function NewsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass card-radius overflow-hidden">
          <div className="skeleton aspect-[16/9] w-full rounded-none" />
          <div className="space-y-3 p-5">
            <span className="skeleton block h-4 w-4/5" />
            <span className="skeleton block h-3 w-full" />
            <span className="skeleton block h-3 w-2/3" />
            <span className="skeleton mt-4 block h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

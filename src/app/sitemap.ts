import type { MetadataRoute } from "next";
import { getReleases } from "@/lib/github";
import { getNewsList } from "@/lib/news";
import { SITE_URL } from "@/lib/site";

const BASE = SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/download`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE}/releases`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/developer`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
  ];

  const [releases, news] = await Promise.all([getReleases(), getNewsList()]);

  const releaseRoutes: MetadataRoute.Sitemap = releases.ok
    ? releases.data.releases.slice(0, 20).map((release) => ({
        url: `${BASE}/releases/${encodeURIComponent(release.tag)}`,
        lastModified: new Date(release.publishedAt),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }))
    : [];

  const newsRoutes: MetadataRoute.Sitemap = news.ok
    ? news.data.posts.slice(0, 50).map((post) => ({
        url: `${BASE}/news/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: "yearly" as const,
        priority: 0.65,
      }))
    : [];

  return [...staticRoutes, ...releaseRoutes, ...newsRoutes];
}

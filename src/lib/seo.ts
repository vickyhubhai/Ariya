import type { Metadata } from "next";
import type { ReleaseInfo } from "./github";
import type { NewsPost } from "./news";
import { SITE_URL, faq, links, repo, site } from "./site";

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
  keywords?: string[];
}

export function pageMetadata({
  title,
  description,
  path,
  image = site.ogImage,
  imageAlt = site.ogImageAlt,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex = false,
  keywords,
}: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      locale: site.locale,
      type,
      images: [{ url: absoluteUrl(image), alt: imageAlt, width: 900, height: 900 }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: absoluteUrl(image), alt: imageAlt }],
    },
  };
}

/* ------------------------------------------------------------------ */
/* Structured data                                                     */
/* ------------------------------------------------------------------ */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const APP_ID = `${SITE_URL}/#software`;

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    alternateName: "Ariya",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/assets/icon-512.png"),
      width: 512,
      height: 512,
    },
    description: site.description,
    founder: { "@type": "Person", name: site.developer },
    sameAs: [links.repo, links.newsRepo, links.developer],
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: site.name,
    alternateName: site.shortName,
    url: SITE_URL,
    inLanguage: "en",
    description: site.description,
    publisher: { "@id": ORG_ID },
  };
}

export function softwareApplicationSchema(release?: ReleaseInfo | null) {
  const base = {
    "@type": "SoftwareApplication",
    additionalType: "https://schema.org/MobileApplication",
    "@id": APP_ID,
    name: site.name,
    alternateName: site.shortName,
    applicationCategory: "MultimediaApplication",
    applicationSubCategory: "Music player",
    operatingSystem: "Android 8.0+",
    url: absoluteUrl("/"),
    description: site.description,
    license: links.license,
    downloadUrl: release?.htmlUrl ?? links.latestRelease,
    installUrl: release?.primary?.url ?? links.latestRelease,
    fileSize: release?.primary ? `${release.primary.size}` : undefined,
    softwareHelp: absoluteUrl("/download"),
    author: { "@type": "Person", name: site.developer },
    publisher: { "@id": ORG_ID },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
    sameAs: [links.repo],
    ...(release
      ? {
          softwareVersion: release.version,
          datePublished: release.publishedAt,
          releaseNotes: absoluteUrl("/releases"),
        }
      : {}),
  };
  if (!base.fileSize) delete (base as { fileSize?: string }).fileSize;
  return base;
}

export function faqSchema() {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function newsArticleSchema(post: NewsPost) {
  return {
    "@type": "NewsArticle",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: absoluteUrl(`/news/${post.slug}`),
    url: absoluteUrl(`/news/${post.slug}`),
    image: post.image ? [authorisedNewsImage(post.image)] : [absoluteUrl(site.ogImage)],
    author: { "@type": "Person", name: post.author },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": WEBSITE_ID },
    inLanguage: "en",
  };
}

function authorisedNewsImage(image: string): string {
  // News images are served through our validated proxy; structured data needs
  // the absolute URL of that proxy so it resolves off-site too.
  return absoluteUrl(`/api/news/artwork?src=${encodeURIComponent(image)}&w=1200`);
}

export function graph(nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export const repositorySameAs = links.repo;
export const repositoryName = `${repo.owner}/${repo.name}`;

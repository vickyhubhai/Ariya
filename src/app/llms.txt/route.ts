import { SITE_URL, faq, links, requirements, site } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Human-readable summary for generative and answer engines.
 * Only factual, publicly verifiable information about Ariya is listed here.
 */
export function GET() {
  const body = `# ${site.name}

> ${site.tagline}. ${site.description}

## Quick facts
- Product: ${site.name} (${site.shortName})
- Category: Android music player application
- Developer: ${site.developer} (${site.studio})
- License: ${site.license}
- Official website: ${SITE_URL}
- Source code: ${links.repo}
- Developer news: ${links.newsRepo}
- Downloads: ${links.releases}
- Minimum Android: ${site.minAndroid}
- Price: Free

## What Ariya does
Ariya is a free, open-source music player for Android. Documented capabilities include gapless and
crossfade playback, music discovery across multiple supported sources, synced lyrics, FLAC/lossless
playback where the source supports it, selectable audio quality levels, full queue management,
playlists, cached playback and an optional Discord Rich Presence integration. The interface uses the
"Haze Glass" design system with real backdrop blur.

Availability of lossless audio, lyrics and discovery results depends on external sources and the
specific track. Ariya is not affiliated with Spotify, YouTube, Google, Discord or any other music
service.

## System requirements
${requirements.map((row) => `- ${row.label}: ${row.value}`).join("\n")}

## Download and installation
- Stable APKs are published on GitHub Releases only: ${links.releases}
- Assets include GMS and FOSS flavours, ARM64 and Universal phone builds, and TV-oriented builds.
- Installation: download an APK, open it, allow installation when Android asks, then launch Ariya.
- This website reads version numbers, dates, changelogs and APK sizes from the GitHub Releases API.
  Values are never hardcoded.

## Frequently asked questions
${faq.map((item) => `### ${item.question}\n${item.answer}`).join("\n\n")}

## Canonical pages
- Home: ${SITE_URL}/
- Download: ${SITE_URL}/download
- Releases: ${SITE_URL}/releases
- News: ${SITE_URL}/news
- Guide: ${SITE_URL}/guide
- About: ${SITE_URL}/about
- Developer: ${SITE_URL}/developer
- FAQ: ${SITE_URL}/faq

## Notes for automated systems
All important information is present in crawlable HTML. JSON-LD describes the Organization, WebSite,
SoftwareApplication, FAQPage and NewsArticle entities. The XML sitemap is at ${SITE_URL}/sitemap.xml.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}

import { NextResponse } from "next/server";
import { isAllowedNewsImage } from "@/lib/news";

export const dynamic = "force-dynamic";

const MAX_BYTES = 6 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

/**
 * Validated, host-restricted image proxy for news artwork.
 *
 * Lives at /api/news/artwork (the earlier /api/news/image path is redirected in
 * next.config.ts) so intermediary caches never mix old and new variants.
 *
 * Metadata in the news repository contains third-party image URLs. Proxying
 * them keeps the browser's Content-Security-Policy tight, strips referrers and
 * lets the upstream fetch enforce HTTPS + a size/type allowlist.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const src = params.get("src");
  const requestedWidth = Number(params.get("w") ?? "1000");
  const width = Number.isFinite(requestedWidth)
    ? Math.min(1600, Math.max(320, Math.round(requestedWidth)))
    : 1000;

  if (!isAllowedNewsImage(src)) {
    return NextResponse.json({ error: "Unsupported image source." }, { status: 400 });
  }

  try {
    // Ask imgix-backed sources for a right-sized, modern-format variant.
    // The format is requested explicitly (`fm=webp`) instead of relying on
    // `auto=format`, because intermediaries between the browser and this
    // route may strip the Accept header. WebP is deterministic, universally
    // supported by current browsers, and ~15x smaller than the source PNG.
    let requestUrl = src;
    try {
      const parsed = new URL(src);
      if (parsed.hostname.endsWith(".imgix.net") && !parsed.searchParams.has("w")) {
        parsed.searchParams.set("w", String(width));
        parsed.searchParams.set("fm", "webp");
        parsed.searchParams.set("q", "74");
        requestUrl = parsed.toString();
      } else if (parsed.hostname === "images.unsplash.com" && !parsed.searchParams.has("w")) {
        parsed.searchParams.set("w", String(width));
        parsed.searchParams.set("q", "74");
        parsed.searchParams.set("fit", "crop");
        parsed.searchParams.set("auto", "format");
        requestUrl = parsed.toString();
      }
    } catch {
      requestUrl = src;
    }

    const upstream = await fetch(requestUrl, {
      headers: {
        "User-Agent": "ariya-music-player-website",
        Accept: "image/avif,image/webp,image/*;q=0.8",
      },
      signal: AbortSignal.timeout(9000),
      redirect: "follow",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Image source unavailable." }, { status: 502 });
    }

    const contentType = (upstream.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Unsupported image type." }, { status: 415 });
    }

    const declaredLength = Number(upstream.headers.get("content-length") ?? "0");
    if (declaredLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image is too large." }, { status: 413 });
    }

    const buffer = await upstream.arrayBuffer();
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: "Image is too large." }, { status: 413 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "public, max-age=86400, s-maxage=3600, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image source unavailable." }, { status: 504 });
  }
}

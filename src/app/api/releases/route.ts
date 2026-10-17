import { NextResponse } from "next/server";
import { getReleases, retryableCodes } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getReleases();

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: { ...result.error, retryable: retryableCodes.includes(result.error.code) },
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
      },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      stale: result.stale,
      fetchedAt: result.fetchedAt,
      generatedAt: result.data.generatedAt,
      latest: result.data.latest,
      releases: result.data.releases,
      totalDownloads: result.data.totalDownloads,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}

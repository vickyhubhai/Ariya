import { NextResponse } from "next/server";
import { getLatestRelease, retryableCodes } from "@/lib/github";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getLatestRelease();

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          ...result.error,
          retryable: retryableCodes.includes(result.error.code),
        },
      },
      {
        status: result.error.code === "not_found" ? 404 : 503,
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      stale: result.stale,
      fetchedAt: result.fetchedAt,
      release: result.data.release,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}

import { NextResponse } from "next/server";
import { getNewsList } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getNewsList();

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { ok: true, stale: result.stale, posts: result.data.posts, generatedAt: result.data.generatedAt },
    {
      headers: {
        "Cache-Control": "public, max-age=120, s-maxage=600, stale-while-revalidate=1800",
      },
    },
  );
}

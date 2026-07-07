import { NextResponse } from "next/server";
import { ScoutError } from "@/lib/github";
import { scout } from "@/lib/scout";

// JSON API: GET /api/card/<username> -> profile summary + full rating + report.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  try {
    const { profile, rating, report } = await scout(username);
    return NextResponse.json({
      login: profile.login,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      location: profile.location,
      country: profile.country,
      topLanguage: profile.topLanguage,
      stats: profile.stats,
      rating,
      report,
    });
  } catch (e) {
    if (e instanceof ScoutError) {
      const status = e.kind === "notfound" ? 404 : e.kind === "ratelimit" ? 429 : 502;
      return NextResponse.json({ error: e.message, kind: e.kind }, { status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

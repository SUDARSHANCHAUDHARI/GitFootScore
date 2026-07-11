// Cloudflare Pages Function — serves GET /api/card/:username.
// Ported from app/api/card/[username]/route.ts. Returns the full profile so the
// (now client-side) results page can render without a server component.
import { ScoutError } from "../../../lib/github";
import { scout } from "../../../lib/scout";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const onRequestGet = async (context: {
  request: Request;
  params: { username: string };
}): Promise<Response> => {
  const { username } = context.params;
  // Optional per-user GitHub token (bring-your-own): unlocks the accurate,
  // GraphQL-based "rich" score and avoids the shared anonymous rate limit.
  // Stored only in the visitor's browser, never on the server.
  const userToken = context.request.headers.get("x-github-token") || undefined;
  try {
    const { profile, rating, report } = await scout(username, userToken);
    return json({ profile, rating, report });
  } catch (e) {
    if (e instanceof ScoutError) {
      const status = e.kind === "notfound" ? 404 : e.kind === "ratelimit" ? 429 : 502;
      return json({ error: e.message, kind: e.kind }, status);
    }
    return json({ error: "Internal error" }, 500);
  }
};

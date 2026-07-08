import { ImageResponse } from "next/og";
import { scout } from "@/lib/scout";
import { CARD_ART } from "@/components/theme";
import { shieldSvg } from "@/lib/cardSvg";

// Social unfurl image for /u/<username>. A compact card on the left, headline
// stats on the right, on our dark backdrop.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GitFootScore player card";

const pad2 = (n: number) => String(Math.round(n)).padStart(2, "0");

export default async function OG({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  let profile;
  let r;
  try {
    const s = await scout(username);
    profile = s.profile;
    r = s.rating;
  } catch {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#080b16",
            color: "#29e5a8",
            fontSize: 64,
            fontWeight: 800,
            fontFamily: "system-ui",
          }}
        >
          GitFootScore
        </div>
      ),
      size,
    );
  }

  const art = CARD_ART[r.tier];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 60,
          padding: "0 80px",
          background: "#080b16",
          fontFamily: "system-ui",
        }}
      >
        {/* mini card */}
        <div style={{ position: "relative", width: 330, height: 500, display: "flex" }}>
          <img src={shieldSvg(art)} alt="" width={330} height={500} />
          <div
            style={{
              position: "absolute",
              top: 44,
              left: 34,
              display: "flex",
              flexDirection: "column",
              color: art.ink,
            }}
          >
            <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1 }}>{pad2(r.overall)}</div>
            <div style={{ fontSize: 34, fontWeight: 700 }}>{r.position}</div>
          </div>
          <div
            style={{
              position: "absolute",
              top: 150,
              left: 100,
              width: 130,
              height: 130,
              borderRadius: 65,
              overflow: "hidden",
              display: "flex",
              border: `3px solid ${art.border}`,
            }}
          >
            <img
              src={profile.avatarUrl}
              alt=""
              width={130}
              height={130}
              style={{ objectFit: "cover", borderRadius: 65 }}
            />
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", color: "#eef2ff" }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: "#29e5a8" }}>
            GitFootScore
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 800, marginTop: 8 }}>
            {profile.name || profile.login}
          </div>
          <div style={{ display: "flex", fontSize: 36, color: "#8b97b8", marginTop: 4 }}>
            @{profile.login}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 700,
              marginTop: 28,
              color: art.border,
            }}
          >
            {r.overall} OVR · {r.position} · {r.tier}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

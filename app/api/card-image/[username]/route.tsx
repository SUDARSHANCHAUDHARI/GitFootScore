import { ImageResponse } from "next/og";
import { scout } from "@/lib/scout";
import { CARD_ART } from "@/components/theme";
import { shieldSvg } from "@/lib/cardSvg";
import { languageColor } from "@/lib/languageColors";

// Embeddable card image: /<username>.png (via the next.config rewrite) → here.
// Rendered with Satori (next/og) so it needs no browser/native binary. 600×900
// (the 2:3 FUT proportion), matching the on-page card. Cached at the edge so a
// README embed regenerates cheaply as the profile's stats change.

export const runtime = "nodejs";

const W = 600;
const H = 900;
const FONT = "system-ui, sans-serif";
const pad2 = (n: number) => String(Math.round(n)).padStart(2, "0");

export async function GET(_req: Request, { params }: { params: Promise<{ username: string }> }) {
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
            color: "#8b97b8",
            fontSize: 40,
            fontFamily: FONT,
          }}
        >
          @{username} not found
        </div>
      ),
      { width: W, height: H },
    );
  }

  const art = CARD_ART[r.tier];
  const ink = art.ink;
  const full = (profile.name || profile.login).trim();
  const name = (full.length <= 11 ? full : full.split(" ").slice(-1)[0]).toUpperCase();

  // value, label, x(value), x(label), y — two columns, three rows.
  const cells: [number, string, number, number, number][] = [
    [r.attributes.pac, "PAC", 118, 176, 612],
    [r.attributes.dri, "DRI", 330, 388, 612],
    [r.attributes.sho, "SHO", 118, 176, 680],
    [r.attributes.def, "DEF", 330, 388, 680],
    [r.attributes.pas, "PAS", 118, 176, 748],
    [r.attributes.phy, "PHY", 330, 388, 748],
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: FONT, background: "transparent" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shieldSvg(art)} alt="" width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }} />

        {/* portrait — ellipse cut-out bleeding into the top panel */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 232,
            width: 316,
            height: 392,
            borderRadius: "160px / 200px",
            overflow: "hidden",
            display: "flex",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatarUrl}
            alt=""
            width={316}
            height={392}
            style={{ objectFit: "cover", borderRadius: "160px / 200px" }}
          />
        </div>

        {/* rating column */}
        <div style={{ position: "absolute", top: 78, left: 66, display: "flex", flexDirection: "column", color: ink }}>
          <div style={{ fontSize: 128, fontWeight: 800, lineHeight: 0.9 }}>{pad2(r.overall)}</div>
          <div style={{ fontSize: 52, fontWeight: 700, marginTop: 8 }}>{r.position}</div>
          {profile.country && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: 14,
                width: 54,
                height: 30,
                borderRadius: 6,
                border: `2px solid ${ink}`,
                fontSize: 22,
                fontWeight: 700,
                opacity: 0.85,
              }}
            >
              {profile.country.code}
            </div>
          )}
          {profile.topLanguage && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 16, fontSize: 28, fontWeight: 600 }}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: languageColor(profile.topLanguage),
                  marginRight: 8,
                  display: "flex",
                }}
              />
              {profile.topLanguage}
            </div>
          )}
        </div>

        {/* name */}
        <div
          style={{
            position: "absolute",
            top: 512,
            left: 0,
            width: W,
            display: "flex",
            justifyContent: "center",
            color: ink,
            fontSize: 68,
            fontWeight: 800,
          }}
        >
          {name}
        </div>
        <div style={{ position: "absolute", top: 588, left: 102, width: 396, height: 2, background: ink, opacity: 0.35, display: "flex" }} />

        {/* stats */}
        {cells.map(([val, label, vx, lx, y]) => (
          <div key={label} style={{ position: "absolute", top: y, left: vx, display: "flex", alignItems: "baseline", color: ink }}>
            <span style={{ fontSize: 52, fontWeight: 800 }}>{pad2(val)}</span>
            <span style={{ fontSize: 40, fontWeight: 700, marginLeft: 8 }}>{label}</span>
          </div>
        ))}

        {/* signature */}
        <div style={{ position: "absolute", top: 828, left: 60, display: "flex", color: ink, opacity: 0.55, fontSize: 20, fontWeight: 700, letterSpacing: 3 }}>
          GITFOOTSCORE
        </div>
        <div style={{ position: "absolute", top: 828, right: 60, display: "flex", color: ink, opacity: 0.55, fontSize: 20, fontWeight: 700 }}>
          @{profile.login}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400" },
    },
  );
}

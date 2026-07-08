import { ImageResponse } from "next/og";
import { scout } from "@/lib/scout";
import { CARD_ART } from "@/components/theme";
import { shieldSvg } from "@/lib/cardSvg";
import { languageColor } from "@/lib/languageColors";

// Embeddable card image: /<username>.png (via the next.config rewrite) → here.
// Rendered with Satori (next/og) so it needs no browser/native binary. 720×900
// (0.8, the same proportion as the on-page card) with the same left-aligned
// column, stat layout and signature — so an embed matches what was scouted.

export const runtime = "nodejs";

const W = 720;
const H = 900;
const FONT = "system-ui, sans-serif";
const pad2 = (n: number) => String(Math.round(n)).padStart(2, "0");
const px = (pctOfW: number) => Math.round((pctOfW / 100) * W);
const py = (pctOfH: number) => Math.round((pctOfH / 100) * H);
const fs = (cqw: number) => Math.round((cqw / 100) * W); // cqw == % of card width

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

  // value, label, value-x%, label-x%, row-y% — mirrors PlayerCard CELLS.
  const cells: [number, string, number, number, number][] = [
    [r.attributes.pac, "PAC", 20, 30, 68.5],
    [r.attributes.dri, "DRI", 55, 65, 68.5],
    [r.attributes.sho, "SHO", 20, 30, 76],
    [r.attributes.def, "DEF", 55, 65, 76],
    [r.attributes.pas, "PAS", 20, 30, 83.5],
    [r.attributes.phy, "PHY", 55, 65, 83.5],
  ];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", fontFamily: FONT, background: "transparent" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shieldSvg(art)} alt="" width={W} height={H} style={{ position: "absolute", top: 0, left: 0 }} />

        {/* portrait — ellipse cut-out (left 32%, top 3%, 58%×50%) */}
        <div
          style={{
            position: "absolute",
            top: py(3),
            left: px(32),
            width: px(58),
            height: py(50),
            borderRadius: `${px(58) / 2}px / ${py(50) / 2}px`,
            overflow: "hidden",
            display: "flex",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile.avatarUrl}
            alt=""
            width={px(58)}
            height={py(50)}
            style={{ objectFit: "cover", borderRadius: `${px(58) / 2}px / ${py(50) / 2}px` }}
          />
        </div>

        {/* left column — left-aligned at 18% */}
        <div style={{ position: "absolute", top: py(10.5), left: px(18), display: "flex", flexDirection: "column", alignItems: "flex-start", color: ink }}>
          <div style={{ fontSize: fs(15.8), fontWeight: 800, lineHeight: 0.9 }}>{pad2(r.overall)}</div>
          <div style={{ fontSize: fs(6.7), fontWeight: 700, marginTop: py(1.5) }}>{r.position}</div>
          {profile.country && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: py(1.5),
                width: fs(7.5),
                height: fs(4.2),
                borderRadius: 6,
                border: `2px solid ${ink}`,
                fontSize: fs(3),
                fontWeight: 700,
                opacity: 0.85,
              }}
            >
              {profile.country.code}
            </div>
          )}
          {profile.topLanguage && (
            <div style={{ display: "flex", alignItems: "center", marginTop: py(1.5), fontSize: fs(3.8), fontWeight: 600 }}>
              <div style={{ width: fs(3), height: fs(3), borderRadius: fs(1.5), background: languageColor(profile.topLanguage), marginRight: fs(1.4), display: "flex" }} />
              {profile.topLanguage}
            </div>
          )}
        </div>

        {/* name */}
        <div style={{ position: "absolute", top: py(58), left: 0, width: W, display: "flex", justifyContent: "center", color: ink, fontSize: fs(9.2), fontWeight: 800 }}>
          {name}
        </div>
        <div style={{ position: "absolute", top: py(63.5), left: px(17), width: px(66), height: 3, background: ink, opacity: 0.4, display: "flex" }} />
        <div style={{ position: "absolute", top: py(66), left: px(50), width: 3, height: py(17), background: ink, opacity: 0.35, display: "flex" }} />

        {/* stats */}
        {cells.map(([val, label, vx, , vy]) => (
          <div key={label} style={{ position: "absolute", top: py(vy), left: px(vx), display: "flex", alignItems: "baseline", color: ink }}>
            <span style={{ fontSize: fs(7.2), fontWeight: 800 }}>{pad2(val)}</span>
            <span style={{ fontSize: fs(6.3), fontWeight: 700, marginLeft: fs(1.2) }}>{label}</span>
          </div>
        ))}

        {/* signature — 20% inset */}
        <div style={{ position: "absolute", top: py(92), left: px(20), display: "flex", color: ink, opacity: 0.55, fontSize: fs(2.3), fontWeight: 700, letterSpacing: 3 }}>
          GITFOOTSCORE
        </div>
        <div style={{ position: "absolute", top: py(92), right: px(20), display: "flex", color: ink, opacity: 0.55, fontSize: fs(2.3), fontWeight: 700 }}>
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

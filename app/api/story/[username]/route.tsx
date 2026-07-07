import { ImageResponse } from "next/og";
import { scout } from "@/lib/scout";
import { CARD_ART } from "@/components/theme";
import { shieldSvg } from "@/lib/cardSvg";

// Instagram-story export: a 1080×1920 (9:16) frame with the card centred, big
// headline stats, and branding — download from the card actions and post it.

export const runtime = "nodejs";

const W = 1080;
const H = 1920;
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
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#080b16", color: "#29e5a8", fontSize: 72, fontWeight: 800, fontFamily: FONT }}>
          GitFootScore
        </div>
      ),
      { width: W, height: H },
    );
  }

  const art = CARD_ART[r.tier];
  const ink = art.ink;
  const full = (profile.name || profile.login).trim();
  const name = (full.length <= 11 ? full : full.split(" ").slice(-1)[0]).toUpperCase();

  // Card geometry (centred). Overlay coordinates are relative to the card box.
  const CW = 640;
  const CH = 960;
  const CX = (W - CW) / 2;
  const CY = 430;
  const sx = (p: number) => CX + (p / 600) * CW; // card-x from 600-space
  const sy = (p: number) => CY + (p / 900) * CH; // card-y from 900-space

  const cells: [number, string, number, number][] = [
    [r.attributes.pac, "PAC", 118, 612],
    [r.attributes.dri, "DRI", 330, 612],
    [r.attributes.sho, "SHO", 118, 680],
    [r.attributes.def, "DEF", 330, 680],
    [r.attributes.pas, "PAS", 118, 748],
    [r.attributes.phy, "PHY", 330, 748],
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: FONT,
          background:
            "radial-gradient(1200px 900px at 50% 0%, rgba(124,123,255,0.18), transparent 60%), #080b16",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 150, color: "#eef2ff", fontSize: 54, fontWeight: 800, letterSpacing: 2 }}>
          <span style={{ color: "#29e5a8" }}>Git</span>Foot<span style={{ color: "#7c7bff" }}>Score</span>
        </div>
        <div style={{ display: "flex", marginTop: 14, color: "#8b97b8", fontSize: 30 }}>your GitHub, rated out of 99</div>

        {/* card */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shieldSvg(art)} alt="" width={CW} height={CH} style={{ position: "absolute", top: CY, left: CX }} />

        <div style={{ position: "absolute", top: sy(46), left: sx(238), width: 338, height: 418, borderRadius: "169px / 209px", overflow: "hidden", display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatarUrl} alt="" width={338} height={418} style={{ objectFit: "cover", borderRadius: "169px / 209px" }} />
        </div>

        <div style={{ position: "absolute", top: sy(78), left: sx(66), display: "flex", flexDirection: "column", color: ink }}>
          <div style={{ fontSize: 150, fontWeight: 800, lineHeight: 0.9 }}>{pad2(r.overall)}</div>
          <div style={{ fontSize: 58, fontWeight: 700, marginTop: 8 }}>{r.position}</div>
        </div>

        <div style={{ position: "absolute", top: sy(500), left: CX, width: CW, display: "flex", justifyContent: "center", color: ink, fontSize: 76, fontWeight: 800 }}>
          {name}
        </div>

        {cells.map(([val, label, x, y]) => (
          <div key={label} style={{ position: "absolute", top: sy(y), left: sx(x), display: "flex", alignItems: "baseline", color: ink }}>
            <span style={{ fontSize: 58, fontWeight: 800 }}>{pad2(val)}</span>
            <span style={{ fontSize: 44, fontWeight: 700, marginLeft: 10 }}>{label}</span>
          </div>
        ))}

        {/* footer */}
        <div style={{ position: "absolute", bottom: 150, display: "flex", flexDirection: "column", alignItems: "center", color: "#8b97b8" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: art.border }}>
            {r.overall} OVR · {r.position} · {r.tier}
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 32 }}>gitfootscore.app/{profile.login}</div>
        </div>
      </div>
    ),
    { width: W, height: H, headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" } },
  );
}

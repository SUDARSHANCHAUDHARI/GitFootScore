import { ImageResponse } from "next/og";
import { scout } from "@/lib/scout";
import { SITE_HOST } from "@/lib/site";
import { CARD_ART } from "@/components/theme";
import { shieldSvg } from "@/lib/cardSvg";
import { languageColor } from "@/lib/languageColors";

// Instagram-story export: a 1080×1920 (9:16) frame with the same card as the
// page/embed centred, plus header + footer branding.

export const runtime = "nodejs";

const W = 1080;
const H = 1920;
const CW = 720; // card box — same 0.8 proportion as the on-page card
const CH = 900;
const CX = (W - CW) / 2;
const CY = 470;
const FONT = "system-ui, sans-serif";
const pad2 = (n: number) => String(Math.round(n)).padStart(2, "0");
const cx = (pct: number) => Math.round(CX + (pct / 100) * CW);
const cy = (pct: number) => Math.round(CY + (pct / 100) * CH);
const fs = (cqw: number) => Math.round((cqw / 100) * CW);

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

  const cells: [number, string, number, number][] = [
    [r.attributes.pac, "PAC", 20, 68.5],
    [r.attributes.dri, "DRI", 55, 68.5],
    [r.attributes.sho, "SHO", 20, 76],
    [r.attributes.def, "DEF", 55, 76],
    [r.attributes.pas, "PAS", 20, 83.5],
    [r.attributes.phy, "PHY", 55, 83.5],
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
          background: "radial-gradient(1200px 900px at 50% 0%, rgba(124,123,255,0.18), transparent 60%), #080b16",
        }}
      >
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", marginTop: 170, color: "#eef2ff", fontSize: 54, fontWeight: 800, letterSpacing: 2 }}>
          <span style={{ color: "#29e5a8" }}>Git</span>Foot<span style={{ color: "#7c7bff" }}>Score</span>
        </div>
        <div style={{ display: "flex", marginTop: 14, color: "#8b97b8", fontSize: 30 }}>your GitHub, rated out of 99</div>

        {/* card */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shieldSvg(art)} alt="" width={CW} height={CH} style={{ position: "absolute", top: CY, left: CX }} />

        {/* portrait */}
        <div style={{ position: "absolute", top: cy(3), left: cx(32), width: fs(58), height: (CH * 50) / 100, borderRadius: `${fs(29)}px / ${(CH * 25) / 100}px`, overflow: "hidden", display: "flex" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.avatarUrl} alt="" width={fs(58)} height={(CH * 50) / 100} style={{ objectFit: "cover", borderRadius: `${fs(29)}px / ${(CH * 25) / 100}px` }} />
        </div>

        {/* left column */}
        <div style={{ position: "absolute", top: cy(10.5), left: cx(18), display: "flex", flexDirection: "column", alignItems: "flex-start", color: ink }}>
          <div style={{ fontSize: fs(15.8), fontWeight: 800, lineHeight: 0.9 }}>{pad2(r.overall)}</div>
          <div style={{ fontSize: fs(6.7), fontWeight: 700, marginTop: 12 }}>{r.position}</div>
          {profile.country && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12, width: fs(7.5), height: fs(4.2), borderRadius: 6, border: `2px solid ${ink}`, fontSize: fs(3), fontWeight: 700, opacity: 0.85 }}>
              {profile.country.code}
            </div>
          )}
          {profile.topLanguage && (
            <div style={{ display: "flex", alignItems: "center", marginTop: 14, fontSize: fs(3.8), fontWeight: 600 }}>
              <div style={{ width: fs(3), height: fs(3), borderRadius: fs(1.5), background: languageColor(profile.topLanguage), marginRight: fs(1.4), display: "flex" }} />
              {profile.topLanguage}
            </div>
          )}
        </div>

        {/* name + separators */}
        <div style={{ position: "absolute", top: cy(58), left: CX, width: CW, display: "flex", justifyContent: "center", color: ink, fontSize: fs(9.2), fontWeight: 800 }}>
          {name}
        </div>
        <div style={{ position: "absolute", top: cy(63.5), left: cx(17), width: fs(66), height: 3, background: ink, opacity: 0.4, display: "flex" }} />
        <div style={{ position: "absolute", top: cy(66), left: cx(50), width: 3, height: (CH * 17) / 100, background: ink, opacity: 0.35, display: "flex" }} />

        {/* stats */}
        {cells.map(([val, label, vx, vy]) => (
          <div key={label} style={{ position: "absolute", top: cy(vy), left: cx(vx), display: "flex", alignItems: "baseline", color: ink }}>
            <span style={{ fontSize: fs(7.2), fontWeight: 800 }}>{pad2(val)}</span>
            <span style={{ fontSize: fs(6.3), fontWeight: 700, marginLeft: fs(1.2) }}>{label}</span>
          </div>
        ))}

        {/* signature */}
        <div style={{ position: "absolute", top: cy(92), left: cx(20), display: "flex", color: ink, opacity: 0.55, fontSize: fs(2.3), fontWeight: 700, letterSpacing: 3 }}>
          GITFOOTSCORE
        </div>
        <div style={{ position: "absolute", top: cy(92), left: cx(20), width: fs(60), display: "flex", justifyContent: "flex-end", color: ink, opacity: 0.55, fontSize: fs(2.3), fontWeight: 700 }}>
          @{profile.login}
        </div>

        {/* footer */}
        <div style={{ position: "absolute", bottom: 150, display: "flex", flexDirection: "column", alignItems: "center", color: "#8b97b8" }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: art.border }}>
            {r.overall} OVR · {r.position} · {r.tier}
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 32 }}>
            {SITE_HOST ? `${SITE_HOST}/${profile.login}` : `@${profile.login}`}
          </div>
        </div>
      </div>
    ),
    { width: W, height: H, headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" } },
  );
}

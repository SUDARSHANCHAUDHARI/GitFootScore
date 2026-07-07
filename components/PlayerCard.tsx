import type { CSSProperties } from "react";
import type { AttrKey, Rating } from "@/lib/score";
import type { Profile } from "@/lib/github";
import { CARD_ART } from "./theme";
import { CardShell } from "./CardShell";
import { LangIcon } from "./LangIcon";

// Our FUT-style player card: the shared shield art (CardShell) with the rating,
// position, language, name and six attributes overlaid at fixed percentage
// positions, plus a large feathered portrait bleeding into the top panel. Font
// sizes are cqw so the whole card scales with its container.

const FONT = "var(--font-cond), 'Arial Narrow', system-ui, sans-serif";

// Portrait feather — clear centre ramping to transparent edges so the photo
// blends into the card like a cut-out (no hard rectangle).
const PORTRAIT_MASK =
  "radial-gradient(ellipse 62% 74% at 56% 42%, #000 46%, transparent 78%), linear-gradient(190deg, #000 62%, transparent 96%), linear-gradient(180deg, transparent 0%, #000 16%)";

const pad2 = (n: number) => String(Math.round(n)).padStart(2, "0");

// value/label cells — left & right columns, three rows (mirrors FUT layout).
const CELLS: { k: AttrKey; l: string; vx: number; lx: number; vy: number }[] = [
  { k: "pac", l: "PAC", vx: 20, lx: 30, vy: 68.5 },
  { k: "dri", l: "DRI", vx: 55, lx: 65, vy: 68.5 },
  { k: "sho", l: "SHO", vx: 20, lx: 30, vy: 76 },
  { k: "def", l: "DEF", vx: 55, lx: 65, vy: 76 },
  { k: "pas", l: "PAS", vx: 20, lx: 30, vy: 83.5 },
  { k: "phy", l: "PHY", vx: 55, lx: 65, vy: 83.5 },
];

export function PlayerCard({ profile, rating }: { profile: Profile; rating: Rating }) {
  const art = CARD_ART[rating.tier];
  const ink = art.ink;
  const full = (profile.name || profile.login).trim();
  const displayName = (full.length <= 11 ? full : full.split(" ").slice(-1)[0]).toUpperCase();

  const at = (left: number, top: number): CSSProperties => ({
    position: "absolute",
    left: `${left}%`,
    top: `${top}%`,
  });

  return (
    <div
      style={{
        containerType: "inline-size",
        position: "relative",
        width: "100%",
        aspectRatio: "1200 / 1500",
        filter: `drop-shadow(0 5cqw 8cqw rgba(0,0,0,.5)) drop-shadow(0 0 5cqw ${art.glow})`,
        userSelect: "none",
      }}
    >
      <CardShell art={art} />

      {/* portrait */}
      <div
        style={{
          position: "absolute",
          left: "32%",
          top: "3%",
          width: "58%",
          height: "50%",
          WebkitMaskImage: PORTRAIT_MASK,
          maskImage: PORTRAIT_MASK,
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
          filter: `drop-shadow(0 2cqw 4cqw rgba(0,0,0,.4))`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatarUrl}
          alt={profile.login}
          crossOrigin="anonymous"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: art.tint }} />
      </div>

      {/* rating */}
      <div style={{ ...at(18, 10.5), fontFamily: FONT, fontSize: "15.8cqw", fontWeight: 700, lineHeight: 0.92, color: ink }}>
        {pad2(rating.overall)}
      </div>

      {/* position */}
      <div
        style={{
          ...at(18, 26.5),
          fontFamily: FONT,
          fontSize: "6.7cqw",
          fontWeight: 600,
          letterSpacing: ".02em",
          color: ink,
        }}
      >
        {rating.position}
      </div>

      {/* country flag */}
      {profile.country && (
        <div
          style={{
            ...at(18, 33),
            fontSize: "5.4cqw",
            lineHeight: 1,
          }}
          title={profile.country.code}
        >
          {profile.country.flag}
        </div>
      )}

      {/* top language */}
      {profile.topLanguage && (
        <div
          style={{
            ...at(18, profile.country ? 41 : 35),
            display: "flex",
            alignItems: "center",
            gap: "1.2cqw",
            fontFamily: FONT,
            fontSize: "3.8cqw",
            fontWeight: 600,
            whiteSpace: "nowrap",
            color: ink,
          }}
        >
          <LangIcon lang={profile.topLanguage} size="3.7cqw" />
          {profile.topLanguage}
        </div>
      )}

      {/* name */}
      <div
        style={{
          ...at(50, 58),
          transform: "translateX(-50%)",
          fontFamily: FONT,
          fontSize: "9.2cqw",
          fontWeight: 700,
          letterSpacing: ".01em",
          whiteSpace: "nowrap",
          color: ink,
        }}
      >
        {displayName}
      </div>

      {/* separator under name */}
      <div style={{ ...at(17, 63.5), width: "66%", height: "0.3cqw", background: ink, opacity: 0.4 }} />
      <div style={{ ...at(50, 66), width: "0.3cqw", height: "17%", background: ink, opacity: 0.35 }} />

      {/* six attributes */}
      {CELLS.map((c) => (
        <div key={c.k}>
          <span style={{ ...at(c.vx, c.vy), fontFamily: FONT, fontSize: "7.2cqw", fontWeight: 700, color: ink }}>
            {pad2(rating.attributes[c.k])}
          </span>
          <span
            style={{
              ...at(c.lx, c.vy + 0.4),
              fontFamily: FONT,
              fontSize: "6.3cqw",
              fontWeight: 600,
              letterSpacing: ".02em",
              color: ink,
            }}
          >
            {c.l}
          </span>
        </div>
      ))}

      {/* signature */}
      <div
        style={{
          ...at(20, 92),
          fontFamily: FONT,
          fontSize: "2.3cqw",
          fontWeight: 700,
          letterSpacing: ".12em",
          color: ink,
          opacity: 0.55,
        }}
      >
        GITFOOTSCORE
      </div>
      <div
        style={{
          position: "absolute",
          right: "20%",
          top: "92%",
          maxWidth: "40%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontFamily: FONT,
          fontSize: "2.3cqw",
          fontWeight: 700,
          letterSpacing: ".06em",
          whiteSpace: "nowrap",
          color: ink,
          opacity: 0.55,
        }}
      >
        @{profile.login}
      </div>
    </div>
  );
}

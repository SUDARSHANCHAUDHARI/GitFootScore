import { ImageResponse } from "next/og";

// Branded preview for the home page / bare gitfootscore links.
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "GitFootScore — your GitHub, rated out of 99";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          fontFamily: "system-ui, sans-serif",
          background:
            "radial-gradient(900px 500px at 50% 0%, rgba(124,123,255,0.2), transparent 60%), #080b16",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, letterSpacing: 4, color: "#8b97b8" }}>
          ⚽ GITHUB, RATED OUT OF 99
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 800, color: "#eef2ff" }}>
          <span style={{ color: "#29e5a8" }}>Git</span>Foot<span style={{ color: "#7c7bff" }}>Score</span>
        </div>
        <div style={{ display: "flex", fontSize: 36, color: "#aeb9d8" }}>
          Turn your GitHub profile into a football-style player card.
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#6f7ca3", marginTop: 20 }}>
          ⚽ six attributes · one overall · one tier
        </div>
      </div>
    ),
    size,
  );
}

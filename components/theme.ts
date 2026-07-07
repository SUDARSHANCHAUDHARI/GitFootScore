import type { Tier } from "@/lib/score";

// Per-tier visual identity — our own colour language, in the spirit of FUT
// bronze/silver/gold/special tiers but built from our palette. `CardArt` drives
// the SVG card background + text ink; `ResultTheme` tints the scout report.

export interface CardArt {
  top: string; // gradient top
  bottom: string; // gradient bottom
  border: string; // metallic edge
  sheen: string; // diagonal highlight
  ink: string; // overlaid text colour (contrast against the art)
  glow: string; // card drop-shadow glow
  halo: string; // avatar glow
  tint: string; // radial avatar tint (clear centre → tier colour edges)
}

const tint = (edge: string, mid: string) =>
  `radial-gradient(ellipse 72% 76% at 52% 40%, transparent 48%, ${mid} 78%, ${edge})`;

export const CARD_ART: Record<Tier, CardArt> = {
  "Sunday League": {
    top: "#4a5673",
    bottom: "#212838",
    border: "#8b97b8",
    sheen: "rgba(255,255,255,0.14)",
    ink: "#eef2fb",
    glow: "rgba(139,151,184,0.4)",
    halo: "rgba(190,201,224,0.4)",
    tint: tint("rgba(33,40,56,0.5)", "rgba(139,151,184,0.2)"),
  },
  Academy: {
    top: "#2f9d6b",
    bottom: "#123f2c",
    border: "#66e0a0",
    sheen: "rgba(255,255,255,0.16)",
    ink: "#ecfff5",
    glow: "rgba(79,208,138,0.42)",
    halo: "rgba(120,240,180,0.42)",
    tint: tint("rgba(18,63,44,0.52)", "rgba(79,208,138,0.2)"),
  },
  "Semi-Pro": {
    top: "#3f83d6",
    bottom: "#152c52",
    border: "#86b8ff",
    sheen: "rgba(255,255,255,0.18)",
    ink: "#ecf3ff",
    glow: "rgba(90,169,255,0.46)",
    halo: "rgba(140,190,255,0.46)",
    tint: tint("rgba(21,44,82,0.52)", "rgba(90,169,255,0.2)"),
  },
  Professional: {
    top: "#20cb9c",
    bottom: "#0a4a45",
    border: "#78f0d6",
    sheen: "rgba(255,255,255,0.2)",
    ink: "#032a21",
    glow: "rgba(41,229,168,0.5)",
    halo: "rgba(120,240,214,0.5)",
    tint: tint("rgba(10,74,69,0.5)", "rgba(41,229,168,0.2)"),
  },
  Elite: {
    top: "#8266e6",
    bottom: "#2c2072",
    border: "#bcaaff",
    sheen: "rgba(255,255,255,0.2)",
    ink: "#f4f0ff",
    glow: "rgba(124,123,255,0.55)",
    halo: "rgba(180,168,255,0.55)",
    tint: tint("rgba(44,32,114,0.52)", "rgba(124,123,255,0.22)"),
  },
  "Ballon d'Or": {
    top: "#f4d071",
    bottom: "#7c5a12",
    border: "#ffe9a8",
    sheen: "rgba(255,255,255,0.3)",
    ink: "#241802",
    glow: "rgba(245,196,81,0.6)",
    halo: "rgba(245,214,140,0.6)",
    tint: tint("rgba(124,90,18,0.5)", "rgba(245,196,81,0.24)"),
  },
};

// Scout report accent per tier.
export interface ResultTheme {
  accent: string;
  glow: string;
  chip: string;
}

export const RESULT_THEME: Record<Tier, ResultTheme> = {
  "Sunday League": { accent: "#a6b2d2", glow: "rgba(139,151,184,0.3)", chip: "#1c2334" },
  Academy: { accent: "#5fe0a0", glow: "rgba(79,208,138,0.32)", chip: "#123320" },
  "Semi-Pro": { accent: "#7fb4ff", glow: "rgba(90,169,255,0.34)", chip: "#132f57" },
  Professional: { accent: "#29e5a8", glow: "rgba(41,229,168,0.36)", chip: "#0c4b47" },
  Elite: { accent: "#b9a6ff", glow: "rgba(124,123,255,0.4)", chip: "#2a2072" },
  "Ballon d'Or": { accent: "#f5c451", glow: "rgba(245,196,81,0.44)", chip: "#3a2b0a" },
};

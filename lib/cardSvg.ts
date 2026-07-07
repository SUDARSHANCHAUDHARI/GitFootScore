import type { CardArt } from "@/components/theme";

// The card background art — a FUT-style silhouette with two-tone panels (richer
// top, brighter stat panel below the waist), a metallic double border and a
// diagonal sheen. Single source of truth: both the on-page card (CardShell) and
// the embeddable PNG (next/og) render this exact SVG, so they always match.
//
// viewBox 1000×1500 (2:3, the FUT proportion). The silhouette has the classic
// shoulder bumps up top and a wide, rounded-flat bottom (never a point).

export const CARD_W = 1000;
export const CARD_H = 1500;
export const WAIST = 0.545; // fraction where the top panel meets the stat panel

// Outer silhouette — symmetric about x=500. Shoulder humps crest higher than the
// dipped centre (the EA-card signature), straight sides, and a flat wide bottom
// with rounded corners (no point).
export const FUT_PATH =
  "M500 100 \
C548 100 590 84 628 66 \
C678 42 738 40 774 58 \
C810 76 842 98 842 152 \
L842 1380 \
Q842 1440 782 1440 \
L218 1440 \
Q158 1440 158 1380 \
L158 152 \
C158 98 190 76 226 58 \
C262 40 322 42 372 66 \
C410 84 452 100 500 100 Z";

// Inset silhouette for the thin inner border (~24px in).
const FUT_INSET =
  "M500 126 \
C546 126 584 111 620 94 \
C666 71 722 69 758 86 \
C792 103 822 124 822 176 \
L822 1376 \
Q822 1414 770 1414 \
L230 1414 \
Q178 1414 178 1376 \
L178 176 \
C178 124 208 103 242 86 \
C278 69 334 71 380 94 \
C416 111 454 126 500 126 Z";

export function cardSvgMarkup(art: CardArt): string {
  const waistY = Math.round(CARD_H * WAIST);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" width="100%" height="100%" preserveAspectRatio="none">
  <defs>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="${waistY}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${art.top}"/>
      <stop offset="1" stop-color="${art.top}" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="bot" x1="0" y1="${waistY}" x2="0" y2="${CARD_H}" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${art.bottom}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${art.bottom}"/>
    </linearGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="${CARD_W}" y2="${CARD_H}" gradientUnits="userSpaceOnUse">
      <stop offset="0.24" stop-color="${art.sheen}" stop-opacity="0"/>
      <stop offset="0.5" stop-color="${art.sheen}"/>
      <stop offset="0.6" stop-color="${art.sheen}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="clip"><path d="${FUT_PATH}"/></clipPath>
  </defs>
  <g clip-path="url(#clip)">
    <rect x="0" y="0" width="${CARD_W}" height="${waistY}" fill="url(#top)"/>
    <rect x="0" y="${waistY}" width="${CARD_W}" height="${CARD_H - waistY}" fill="url(#bot)"/>
    <rect x="0" y="${waistY}" width="${CARD_W}" height="${CARD_H - waistY}" fill="#ffffff" opacity="0.1"/>
    <ellipse cx="500" cy="200" rx="520" ry="320" fill="#ffffff" opacity="0.09"/>
    <rect x="0" y="0" width="${CARD_W}" height="${CARD_H}" fill="url(#sheen)"/>
  </g>
  <line x1="330" y1="${waistY}" x2="670" y2="${waistY}" stroke="${art.ink}" stroke-width="2" opacity="0.28"/>
  <path d="${FUT_PATH}" fill="none" stroke="${art.border}" stroke-width="7" opacity="0.9"/>
  <path d="${FUT_INSET}" fill="none" stroke="${art.border}" stroke-width="2" opacity="0.4"/>
</svg>`;
}

export function shieldSvg(art: CardArt): string {
  return `data:image/svg+xml,${encodeURIComponent(cardSvgMarkup(art))}`;
}

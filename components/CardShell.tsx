import type { CardArt } from "./theme";
import { cardSvgMarkup } from "@/lib/cardSvg";

// The card background — renders the shared FUT art (lib/cardSvg) inline so the
// on-page card and the embeddable PNG are pixel-identical. Absolutely positioned
// to fill its container; the data overlay sits on top in PlayerCard.
export function CardShell({ art }: { art: CardArt }) {
  return (
    <div
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      dangerouslySetInnerHTML={{ __html: cardSvgMarkup(art) }}
    />
  );
}

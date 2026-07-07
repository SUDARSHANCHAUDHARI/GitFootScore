"use client";

import { useState } from "react";
import { languageLogo } from "@/lib/languageLogos";
import { languageColor } from "@/lib/languageColors";

// The top-language mark on the card: the language's Devicon logo, falling back to
// a colour dot if the language has no catalog logo or the CDN image fails.
// Client component so the onError fallback works.
export function LangIcon({ lang, size }: { lang: string; size: string }) {
  const [broken, setBroken] = useState(false);
  const logo = languageLogo(lang);

  if (logo && !broken) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={lang}
        onError={() => setBroken(true)}
        style={{ width: size, height: size, objectFit: "contain", display: "block" }}
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size, borderRadius: "50%", background: languageColor(lang), display: "block" }}
    />
  );
}

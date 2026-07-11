"use client";

import { useEffect, useState } from "react";

// Share/export row under the card. The embed snippet is the whole point — a
// README badge that re-renders itself as the profile's stats change, because
// /<login>.png is generated live. Origin is resolved after mount so server and
// client render identically (no hydration mismatch).

export function CardActions({ login, overall, tier }: { login: string; overall: number; tier: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  // Resolve origin after mount so SSR and first client render match (no
  // hydration mismatch); window isn't available during SSR.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setOrigin(window.location.origin), []);

  const pageUrl = `${origin}/u?username=${login}`;
  const tweet = `My GitHub is a ${overall}-rated ${tier} on GitFootScore ⚽`;

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1800);
    } catch {
      setCopied(null);
    }
  }

  const btn =
    "rounded-lg border border-border bg-surface px-3.5 py-2 text-[13px] font-semibold text-ink-soft transition hover:border-mint/50 hover:text-ink";

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={() => copy(pageUrl, "link")} className={btn}>
          {copied === "link" ? "Copied!" : "Copy link"}
        </button>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}&url=${encodeURIComponent(pageUrl)}`}
          target="_blank"
          rel="noopener"
          className={btn}
        >
          Share on X
        </a>
      </div>
    </div>
  );
}

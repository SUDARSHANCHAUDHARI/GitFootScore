"use client";

import { useEffect, useState } from "react";

// Share/export row under the card. The embed snippet is the whole point — a
// README badge that re-renders itself as the profile's stats change, because
// /<login>.png is generated live. Origin is resolved after mount so server and
// client render identically (no hydration mismatch).

export function CardActions({ login, overall, tier }: { login: string; overall: number; tier: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  const pageUrl = `${origin}/u/${login}`;
  const imgUrl = `${origin}/${login}.png`;
  const embed = `[![${login} on GitFootScore](${imgUrl})](${pageUrl})`;
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
        <a href={`/${login}.png`} download={`${login}-gitfootscore.png`} className={btn}>
          ↓ Card PNG
        </a>
        <a href={`/api/story/${login}`} download={`${login}-gitfootscore-story.png`} className={btn}>
          ↓ Story
        </a>
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

      <div className="rounded-xl border border-border bg-surface/60 p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
            Embed in your README
          </span>
          <button
            onClick={() => copy(embed, "embed")}
            className="text-[12px] font-semibold text-mint hover:brightness-110"
          >
            {copied === "embed" ? "Copied!" : "Copy"}
          </button>
        </div>
        <code className="block overflow-x-auto whitespace-nowrap text-[11.5px] text-ink-soft">
          {embed}
        </code>
      </div>
    </div>
  );
}

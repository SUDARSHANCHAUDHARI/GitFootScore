"use client";

import { useEffect, useState } from "react";
import { getGhToken, setGhToken, clearGhToken } from "@/lib/ghToken";

// Self-contained "bring your own GitHub token" control: a button + modal.
// Optional — without a token the app still scores from public data (lite).
export default function TokenSettings() {
  const [open, setOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setHasToken(!!getGhToken());
    setDraft(getGhToken());
  }, []);

  function save() {
    const trimmed = draft.trim();
    setGhToken(trimmed);
    setHasToken(!!trimmed);
    setOpen(false);
  }

  function clear() {
    clearGhToken();
    setDraft("");
    setHasToken(false);
  }

  return (
    <>
      <button
        onClick={() => { setDraft(getGhToken()); setOpen(true); }}
        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[12.5px] font-semibold text-ink-soft transition hover:border-mint/50 hover:text-ink"
      >
        {hasToken ? "⚙ Token set" : "⚙ Add GitHub token"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-surface p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-1 text-lg font-bold text-ink">GitHub token (optional)</div>
            <p className="mb-4 text-[13px] leading-relaxed text-ink-soft">
              Add your own GitHub token for the accurate score (lifetime contributions via GraphQL) and to avoid the shared rate limit. It is stored only in this browser and sent directly with your requests — never saved on the server. A classic token with <strong>no scopes</strong> is enough (public data only).
            </p>

            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-muted">Personal access token</label>
            <input
              type="password"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="ghp_…"
              className="mb-4 w-full rounded-xl border border-border bg-bg px-4 py-3 text-[14px] text-ink outline-none transition placeholder:text-muted focus:border-mint/60"
            />

            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={!draft.trim()}
                className="flex-1 rounded-xl bg-mint py-2.5 text-[14px] font-bold text-[#04160e] transition hover:brightness-110 disabled:opacity-40"
              >
                Save
              </button>
              {hasToken && (
                <button
                  onClick={clear}
                  className="rounded-xl border border-border px-4 py-2.5 text-[14px] font-semibold text-ink-soft transition hover:border-red-700 hover:text-red-300"
                >
                  Clear
                </button>
              )}
            </div>
            <a
              href="https://github.com/settings/tokens/new?description=GitFootScore"
              target="_blank"
              rel="noopener"
              className="mt-3 inline-block text-[12px] text-mint underline-offset-2 hover:underline"
            >
              Create a token on GitHub ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}

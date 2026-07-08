"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ScoutForm({ autoFocus = false }: { autoFocus?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const login = value.trim().replace(/^@/, "");
    if (!login) return;
    setBusy(true);
    router.push(`/u/${encodeURIComponent(login)}`);
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="github username"
        aria-label="GitHub username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-[15px] text-ink outline-none transition placeholder:text-muted focus:border-mint/60 focus:ring-2 focus:ring-mint/20"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-mint px-6 py-3 text-[15px] font-bold text-[#04160e] transition hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
      >
        {busy ? "Scouting…" : "Scout"}
      </button>
    </form>
  );
}

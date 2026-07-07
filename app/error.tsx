"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error("[gitfootscore] route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="text-6xl">🟥</div>
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="max-w-sm text-ink-soft">The scout hit a snag. Try again in a moment.</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-mint px-5 py-2.5 text-[14px] font-bold text-[#04160e] hover:brightness-110"
        >
          Retry
        </button>
        <Link
          href="/"
          className="rounded-xl border border-border px-5 py-2.5 text-[14px] font-semibold text-ink-soft hover:text-ink"
        >
          Home
        </Link>
      </div>
    </main>
  );
}

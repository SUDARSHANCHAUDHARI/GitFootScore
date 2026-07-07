import { Wordmark } from "@/components/Wordmark";

// Shown while a scout is fetched + scored (Next streams this instantly, then
// swaps in the card). A spinning ball + rotating scouting line.
export default function Loading() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col px-6 pb-16 pt-8">
      <header className="mb-10">
        <Wordmark size={28} />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-mint" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">⚽</span>
        </div>
        <div className="text-[15px] font-semibold text-ink-soft">Scouting the pitch…</div>
        <div className="text-[13px] text-muted">reading commits, stars &amp; languages</div>
      </div>
    </main>
  );
}

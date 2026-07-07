import type { ScoutReport as Report } from "@/lib/report";
import type { Tier } from "@/lib/score";
import { RESULT_THEME } from "./theme";

// The read below the card: skill moves, weak foot, work rate, play style, the
// playstyle chips and a metrics grid. Tinted to the player's tier.

function Stars({ n, accent }: { n: number; accent: string }) {
  return (
    <span className="tracking-tight" style={{ color: accent }}>
      {"★".repeat(n)}
      <span className="text-white/15">{"★".repeat(5 - n)}</span>
    </span>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface/70 px-4 py-3">
      <div className="text-[10.5px] font-bold uppercase tracking-widest text-muted">{title}</div>
      <div className="mt-1 text-[15px] font-semibold text-ink">{children}</div>
    </div>
  );
}

export function ScoutReport({
  report,
  tier,
  depth,
}: {
  report: Report;
  tier: Tier;
  depth: "rich" | "lite";
}) {
  const t = RESULT_THEME[tier];
  return (
    <div className="w-full max-w-md space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Box title="Skill Moves">
          <span title={report.skillMoves.reason}>
            <Stars n={report.skillMoves.value} accent={t.accent} />
          </span>
        </Box>
        <Box title="Weak Foot">
          <span title={report.weakFoot.reason}>
            <Stars n={report.weakFoot.value} accent={t.accent} />
          </span>
        </Box>
        <Box title="Work Rate">
          <span title={report.workRate.reason}>
            {report.workRate.attack} / {report.workRate.defense}
          </span>
        </Box>
        <Box title="Style">
          <span title={report.style.reason} style={{ color: t.accent }}>
            {report.style.value}
          </span>
        </Box>
      </div>

      {report.playstyles.length > 0 && (
        <div>
          <div className="mb-2 text-[10.5px] font-bold uppercase tracking-widest text-muted">
            Playstyles
          </div>
          <div className="flex flex-wrap gap-2">
            {report.playstyles.map((p) => (
              <span
                key={p.name}
                title={p.reason}
                className="rounded-full border px-3 py-1 text-[12px] font-semibold"
                style={
                  p.plus
                    ? { borderColor: t.accent, color: t.accent, background: `${t.chip}` }
                    : { borderColor: "var(--border)", color: "var(--ink-soft)" }
                }
              >
                {p.name}
                {p.plus && <span className="ml-1 opacity-80">+</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10.5px] font-bold uppercase tracking-widest text-muted">
            Metrics
          </span>
          <span className="text-[10.5px] font-medium text-muted">
            {depth === "rich" ? "full data" : "lite · add a token for contributions"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {report.metrics.map((m) => (
            <div key={m.label} className="flex flex-col">
              <span className="text-[15px] font-bold tabular-nums text-ink">
                {m.value.toLocaleString()}
              </span>
              <span className="text-[11px] text-muted">{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

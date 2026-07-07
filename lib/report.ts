import type { Attributes, GitHubStats } from "./score";

// Scout report — the secondary read below the card. Skill moves, weak foot,
// work rate, a one-word style, a playstyle catalog and a metrics list. Every
// value traces to a real GitHub number; each carries a plain-English reason for
// the tooltip. Signals that need a token (contributions/PRs/reviews) degrade to
// sensible fallbacks when scouted lite.

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const log = (x: number) => Math.log10(Math.max(0, x) + 1);

export interface Stars {
  value: number; // 1–5
  reason: string;
}
export type WorkRateLevel = "High" | "Med" | "Low";

export interface Playstyle {
  name: string;
  plus: boolean; // elite tier
  reason: string;
}

export interface Metric {
  label: string;
  value: number;
  unit: string;
}

export interface ScoutReport {
  skillMoves: Stars;
  weakFoot: Stars;
  workRate: { attack: WorkRateLevel; defense: WorkRateLevel; reason: string };
  style: { value: string; reason: string };
  playstyles: Playstyle[];
  metrics: Metric[];
}

const fmt = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "")}k` : String(n);

// Skill moves (1–5): technical range — language breadth, +1 for broad output.
function skillMoves(s: GitHubStats): Stars {
  let value = s.languages >= 10 ? 5 : s.languages >= 7 ? 4 : s.languages >= 4 ? 3 : s.languages >= 2 ? 2 : 1;
  const bonus = s.publicRepos >= 40 && value < 5;
  if (bonus) value += 1;
  return {
    value,
    reason: `Technical range: ${s.languages} language${s.languages === 1 ? "" : "s"}${
      bonus ? ` across ${fmt(s.publicRepos)} repos` : ""
    }.`,
  };
}

// Weak foot (1–5): how strong the weaker areas are (mean of the 3 lowest stats).
function weakFoot(a: Attributes): Stars {
  const sorted = (Object.values(a) as number[]).sort((x, y) => x - y);
  const weak = Math.round((sorted[0] + sorted[1] + sorted[2]) / 3);
  const value = weak >= 72 ? 5 : weak >= 63 ? 4 : weak >= 54 ? 3 : weak >= 45 ? 2 : 1;
  return { value, reason: `Off-foot: your three weakest attributes average ${weak}/99.` };
}

const level = (v: number): WorkRateLevel => (v >= 68 ? "High" : v >= 50 ? "Med" : "Low");

function workRate(a: Attributes) {
  const attack = level(Math.round((a.pac + a.sho) / 2));
  const defense = level(a.def);
  return {
    attack,
    defense,
    reason: `Attack ${attack} from shipping output (commits, stars); defense ${defense} from reviews, issues & longevity.`,
  };
}

function style(s: GitHubStats): { value: string; reason: string } {
  const r = s.rich;
  if (r && r.activeDaysRecent >= 220 && r.recentCommits >= 800)
    return { value: "Relentless", reason: "Active nearly every day, all year." };
  if (s.daysSinceActive <= 7 && s.totalStars >= 2000)
    return { value: "In-Form", reason: "Shipping right now, with reach behind it." };
  if (s.accountAgeYears >= 6 && s.daysSinceActive <= 60)
    return { value: "Controlled", reason: "A long, steady track record." };
  if (s.maxRepoStars >= 5000 && s.daysSinceActive >= 120)
    return { value: "Clinical", reason: "One big hit, quiet lately." };
  if (s.daysSinceActive <= 30) return { value: "Industrious", reason: "Steadily active this month." };
  return { value: "Measured", reason: "Light recent activity." };
}

interface PlaystyleDef {
  name: string;
  noun: string;
  value: (s: GitHubStats) => number;
  base: number;
  plus: number;
}

// Our own catalog. Contribution-based entries only fire with real (token) data.
const CATALOG: PlaystyleDef[] = [
  { name: "Star Magnet", noun: "stars earned", value: (s) => s.totalStars, base: 500, plus: 20000 },
  { name: "Viral Hit", noun: "stars on one repo", value: (s) => s.maxRepoStars, base: 1000, plus: 20000 },
  { name: "Fork Lord", noun: "forks of your work", value: (s) => s.totalForks, base: 200, plus: 8000 },
  { name: "Magnetic", noun: "followers", value: (s) => s.followers, base: 200, plus: 20000 },
  { name: "Polyglot", noun: "languages", value: (s) => s.languages, base: 5, plus: 9 },
  { name: "Prolific", noun: "public repos", value: (s) => s.publicRepos, base: 30, plus: 150 },
  { name: "Veteran", noun: "years on GitHub", value: (s) => Math.round(s.accountAgeYears), base: 5, plus: 12 },
  { name: "Rapid Fire", noun: "contributions this year", value: (s) => s.rich?.recentCommits ?? 0, base: 500, plus: 2500 },
  { name: "Connector", noun: "pull requests", value: (s) => s.rich?.recentPRs ?? 0, base: 30, plus: 400 },
  { name: "Maintainer", noun: "reviews & issues", value: (s) => (s.rich ? s.rich.recentReviews + s.rich.recentIssues : 0), base: 30, plus: 300 },
  { name: "Marathoner", noun: "lifetime contributions", value: (s) => s.rich?.lifetimeContributions ?? 0, base: 3000, plus: 25000 },
];

function playstyles(s: GitHubStats): Playstyle[] {
  return CATALOG.map((d) => ({ d, v: d.value(s) }))
    .filter(({ d, v }) => v >= d.base)
    .sort((a, b) => {
      const ap = a.v >= a.d.plus;
      const bp = b.v >= b.d.plus;
      if (ap !== bp) return ap ? -1 : 1;
      return b.v / b.d.base - a.v / a.d.base;
    })
    .slice(0, 8)
    .map(({ d, v }) => ({
      name: d.name,
      plus: v >= d.plus,
      reason: `${fmt(v)} ${d.noun}${v >= d.plus ? " — elite tier" : ""}.`,
    }));
}

function metrics(s: GitHubStats): Metric[] {
  const all: Metric[] = [
    { label: "Stars earned", value: s.totalStars, unit: "stars" },
    { label: "Top repo", value: s.maxRepoStars, unit: "stars" },
    { label: "Forks", value: s.totalForks, unit: "forks" },
    { label: "Followers", value: s.followers, unit: "followers" },
    { label: "Repositories", value: s.publicRepos, unit: "repos" },
    { label: "Languages", value: s.languages, unit: "languages" },
    { label: "Account age", value: Math.round(s.accountAgeYears), unit: "yrs" },
  ];
  if (s.rich) {
    all.push(
      { label: "Commits (1y)", value: s.rich.recentCommits, unit: "commits" },
      { label: "Pull requests", value: s.rich.recentPRs, unit: "PRs" },
      { label: "Code reviews", value: s.rich.recentReviews, unit: "reviews" },
      { label: "Active days (1y)", value: s.rich.activeDaysRecent, unit: "days" },
      { label: "Contributions", value: s.rich.lifetimeContributions, unit: "total" },
    );
  }
  return all.filter((m) => m.value > 0);
}

export function buildReport(s: GitHubStats, a: Attributes): ScoutReport {
  return {
    skillMoves: skillMoves(s),
    weakFoot: weakFoot(a),
    workRate: workRate(a),
    style: style(s),
    playstyles: playstyles(s),
    metrics: metrics(s),
  };
}

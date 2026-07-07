// GitFootScore — scoring engine.
// A faithful port of the FUT-style ranking used by the reference project
// (gitfut, MIT), adapted to our signal plumbing. Six FIFA attributes
// (PAC/SHO/PAS/DRI/DEF/PHY) are estimated from real GitHub numbers, normalised
// into a self-relative shape (z-score → tension → spike around a magnitude
// centre), then collapsed to a position-weighted overall with a legacy bonus.
//
// The `rich` block (real commits / PRs / reviews / issues / lifetime + active
// days) comes only from the GraphQL API (a GitHub token). PAC, PAS, DEF and PHY
// lean on it heavily, so a tokenless (REST) scout scores lower on those — set
// GITHUB_TOKEN to reproduce the reference tool's numbers.

export interface RichSignals {
  recentCommits: number; // last 365 days (incl. private)
  recentPRs: number;
  recentReviews: number;
  recentIssues: number;
  activeDaysRecent: number;
  lifetimeContributions: number;
}

export interface GitHubStats {
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  maxRepoStars: number;
  languages: number;
  accountAgeYears: number;
  activeYears: number; // distinct calendar years with repo activity
  daysSinceActive: number;
  rich?: RichSignals;
}

export type StatKey = "pac" | "sho" | "pas" | "dri" | "def" | "phy";
export type AttrKey = StatKey; // alias kept for existing imports
export type Stats = Record<StatKey, number>;
export type Attributes = Stats;
export type Family = "Forward" | "Playmaker" | "Anchor";
export type Position = "RW" | "ST" | "CM" | "CAM" | "CB" | "CDM";

export interface Rating {
  attributes: Stats;
  overall: number;
  baseOVR: number;
  position: Position;
  family: Family;
  tier: Tier;
  depth: "rich" | "lite";
}

export type Tier =
  | "Sunday League"
  | "Academy"
  | "Semi-Pro"
  | "Professional"
  | "Elite"
  | "Ballon d'Or";

export const STATS: StatKey[] = ["pac", "sho", "pas", "dri", "def", "phy"];
const ATTACK_STATS: StatKey[] = ["pac", "sho", "pas", "dri"];

export const ATTR_LABELS: Record<StatKey, string> = {
  pac: "PAC",
  sho: "SHO",
  pas: "PAS",
  dri: "DRI",
  def: "DEF",
  phy: "PHY",
};

export const ATTR_NAMES: Record<StatKey, string> = {
  pac: "Pace",
  sho: "Shooting",
  pas: "Passing",
  dri: "Dribbling",
  def: "Defending",
  phy: "Physical",
};

// Tuning constants (ported from the reference engine).
const K = {
  magnitude: { w1: 0.5, w2: 0.4, w3: 0.5, w4: 0.08, b: -2.8, lo: 48, hi: 82 },
  tension: {
    alpha: 0.7,
    pairs: [
      ["sho", "def"],
      ["dri", "phy"],
      ["pac", "def"],
    ] as [StatKey, StatKey][],
  },
  spike: { base: 8, cohesion: 0.6 },
  legacy: { a: 1.0, b: 0.7, c: 0.3, d: 0.3, e: 0.3, f: 6.0, activeCap: 15, bonusMax: 11 },
  ovrCap: 88,
};

const WEIGHTS: Record<Family, Stats> = {
  Forward: { pac: 0.2, sho: 0.3, pas: 0.1, dri: 0.2, def: 0.05, phy: 0.15 },
  Playmaker: { pac: 0.1, sho: 0.15, pas: 0.3, dri: 0.25, def: 0.1, phy: 0.1 },
  Anchor: { pac: 0.1, sho: 0.05, pas: 0.15, dri: 0.1, def: 0.4, phy: 0.2 },
};

const Lg = (x: number) => Math.log10(Math.max(0, x) + 1);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const mean = (a: number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const vals = (s: Stats) => STATS.map((k) => s[k]);

// The real GitHub signals the engine reads, derived from our fetched stats.
interface Signals {
  recentContributions: number;
  totalStars: number;
  maxRepoStars: number;
  prsToOthers: number;
  followers: number;
  languages: number;
  reviews: number;
  issues: number;
  lifetime: number;
  activeYears: number;
  accountAgeYears: number;
}

function signalsOf(s: GitHubStats): Signals {
  const r = s.rich;
  return {
    recentContributions: r ? r.recentCommits + r.recentPRs + r.recentReviews + r.recentIssues : 0,
    totalStars: s.totalStars,
    maxRepoStars: s.maxRepoStars,
    prsToOthers: r?.recentPRs ?? 0,
    followers: s.followers,
    languages: s.languages,
    reviews: r?.recentReviews ?? 0,
    issues: r?.recentIssues ?? 0,
    lifetime: r?.lifetimeContributions ?? 0,
    activeYears: s.activeYears,
    accountAgeYears: s.accountAgeYears,
  };
}

// §2 — raw estimates, tuned so the six land on a comparable scale.
function rawStats(g: Signals): Stats {
  const o: Stats = {
    pac: 36 + 12 * Lg(g.recentContributions),
    sho: 36 + 13 * Lg(g.totalStars) + 5 * Lg(g.maxRepoStars),
    pas: 40 + 12 * Lg(g.prsToOthers) + 9 * Lg(g.followers),
    dri: 58 + 7 * Math.sqrt(g.languages),
    def: 40 + 14 * Lg(g.reviews + g.issues),
    phy: 40 + 9 * Lg(g.lifetime) + 2.2 * Math.min(g.activeYears, 12),
  };
  for (const k of STATS) o[k] = clamp(Math.round(o[k]), 1, 99);
  return o;
}

// §3.1 — magnitude → gravity-well centre the stats sit around.
function center(g: Signals): number {
  const { w1, w2, w3, w4, b, lo, hi } = K.magnitude;
  const M = sigmoid(
    w1 * Lg(g.totalStars) + w2 * Lg(g.followers) + w3 * Lg(g.lifetime) + w4 * g.accountAgeYears + b,
  );
  return lerp(lo, hi, M);
}

// §3.2 — z-score of their own six.
function zscore(raw: Stats): Stats {
  const v = vals(raw);
  const m = mean(v);
  const sd = Math.sqrt(mean(v.map((x) => (x - m) ** 2))) || 1;
  const p = {} as Stats;
  STATS.forEach((k, i) => (p[k] = (v[i] - m) / sd));
  return p;
}

// §3.3 — penalise antagonist pairs so nobody is elite at everything.
function applyTension(p: Stats): Stats {
  const out = { ...p };
  for (const [a, b] of K.tension.pairs) {
    const overlap = Math.max(0, Math.min(out[a], out[b]));
    const weaker = out[a] <= out[b] ? a : b;
    out[weaker] -= K.tension.alpha * overlap;
  }
  return out;
}

// §3.4 — spike around centre; specialists get spikier cards; attacking four are
// pulled toward their own group mean (cohesion).
function spike(p: Stats, c: number): Stats {
  const v = vals(p);
  const lop = clamp((Math.max(...v) - Math.min(...v)) / 4, 0, 1);
  const spread = K.spike.base * (1 + lop);
  const m = mean(v);
  const raw = {} as Stats;
  STATS.forEach((k) => (raw[k] = c + spread * (p[k] - m)));
  const am = mean(ATTACK_STATS.map((k) => raw[k]));
  ATTACK_STATS.forEach((k) => (raw[k] = am + K.spike.cohesion * (raw[k] - am)));
  const stats = {} as Stats;
  STATS.forEach((k) => (stats[k] = clamp(Math.round(raw[k]), 1, 99)));
  return stats;
}

function positionFromShape(st: Stats): { position: Position; family: Family } {
  const fam: Record<Family, number> = {
    Forward: st.sho + st.pac,
    Playmaker: st.pas + st.dri,
    Anchor: st.def + st.phy,
  };
  const family = (Object.keys(fam) as Family[]).sort((a, b) => fam[b] - fam[a])[0];
  const position: Position =
    family === "Forward"
      ? st.pac > st.sho
        ? "RW"
        : "ST"
      : family === "Playmaker"
        ? st.pas > st.dri
          ? "CM"
          : "CAM"
        : st.def > st.phy
          ? "CB"
          : "CDM";
  return { position, family };
}

// §3.6 — position-weighted, never a flat mean; stats alone cap at 88.
function weightedOVR(stats: Stats, family: Family): number {
  const w = WEIGHTS[family];
  const ovr = STATS.reduce((s, k) => s + stats[k] * w[k], 0);
  return Math.min(Math.round(ovr), K.ovrCap);
}

// §4 — the 88→99 range is bought with years and sustained influence.
function legacyScore(g: Signals): number {
  const { a, b, c, d, e, f, activeCap } = K.legacy;
  const z =
    a * Math.log(g.accountAgeYears + 1) +
    b * Math.min(g.activeYears, activeCap) +
    c * Lg(g.followers) +
    d * Lg(g.totalStars) +
    e * Lg(g.maxRepoStars) -
    f;
  return sigmoid(z);
}

function tierFor(overall: number): Tier {
  if (overall >= 90) return "Ballon d'Or";
  if (overall >= 85) return "Elite";
  if (overall >= 75) return "Professional";
  if (overall >= 65) return "Semi-Pro";
  if (overall >= 55) return "Academy";
  return "Sunday League";
}

export function rate(s: GitHubStats): Rating {
  const g = signalsOf(s);
  const attributes = spike(applyTension(zscore(rawStats(g))), center(g));
  const { position, family } = positionFromShape(attributes);
  const baseOVR = weightedOVR(attributes, family);
  const L = legacyScore(g);
  const overall = clamp(baseOVR + Math.round(K.legacy.bonusMax * L), 1, 99);
  return {
    attributes,
    overall,
    baseOVR,
    position,
    family,
    tier: tierFor(overall),
    depth: s.rich ? "rich" : "lite",
  };
}

import type { GitHubStats, RichSignals } from "./score";
import { countryFromLocation, type Country } from "./country";
import { failoverToken, hasTokens, pickToken } from "./githubTokens";

// GitHub client. Always pulls the public profile + owned repos over REST (works
// with no token — GitHub's 60 req/hr anonymous tier). When GITHUB_TOKEN is set
// it *also* runs one GraphQL query for real contribution data (commits, PRs,
// reviews, issues, active days, lifetime totals) — the numbers REST can't give —
// and raises the limit to 5k/hr. No token → we score from REST signals alone,
// so every profile is still scoutable, just with less depth (rating.depth).

export interface Profile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  country: Country | null;
  topLanguage: string | null;
  stats: GitHubStats;
}

export type ScoutErrorKind = "notfound" | "ratelimit" | "network";

export class ScoutError extends Error {
  constructor(public kind: ScoutErrorKind, message: string) {
    super(message);
    this.name = "ScoutError";
  }
}

interface GhUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}

interface GhRepo {
  fork: boolean;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string | null;
  pushed_at: string | null;
}

function restHeaders(tok: string | null): HeadersInit {
  const h: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (tok) h.Authorization = `Bearer ${tok}`;
  return h;
}

// REST GET with the login's pooled token; one failover retry to a different
// token if the first is rate-limited (see githubTokens).
async function rest<T>(path: string, login: string): Promise<T> {
  const primary = pickToken(login);
  const attempt = async (tok: string | null) =>
    fetch(`https://api.github.com${path}`, {
      headers: restHeaders(tok),
      next: { revalidate: 900 }, // 15 min — GitHub stats move slowly
    });

  let res: Response;
  try {
    res = await attempt(primary);
    if ((res.status === 403 || res.status === 429) && hasTokens()) {
      const alt = failoverToken(login, primary);
      if (alt && alt !== primary) res = await attempt(alt);
    }
  } catch {
    throw new ScoutError("network", "Could not reach GitHub.");
  }
  if (res.status === 404) throw new ScoutError("notfound", "No GitHub user by that name.");
  if (res.status === 403 || res.status === 429)
    throw new ScoutError("ratelimit", "GitHub rate limit hit — try again shortly.");
  if (!res.ok) throw new ScoutError("network", `GitHub error (${res.status}).`);
  return (await res.json()) as T;
}

const yearsSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / (365.25 * 864e5);
const daysSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / 864e5;

// --- GraphQL contribution enrichment (token only) --------------------------

interface ContribBlock {
  totalCommitContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  totalIssueContributions: number;
  restrictedContributionsCount: number;
  contributionCalendar?: { weeks: { contributionDays: { contributionCount: number }[] }[] };
}

const YEAR_MS = 365 * 864e5;

// One query with an aliased contributionsCollection window per year (recent →
// oldest, capped), so recent activity + a lifetime total come back together.
async function fetchRich(login: string, ageYears: number): Promise<RichSignals | undefined> {
  const t = pickToken(login);
  if (!t) return undefined;

  const windows = Math.min(Math.max(Math.ceil(ageYears), 1), 8);
  const now = Date.now();
  const blocks: string[] = [];
  for (let i = 0; i < windows; i++) {
    const to = new Date(now - i * YEAR_MS).toISOString();
    const from = new Date(now - (i + 1) * YEAR_MS).toISOString();
    const cal = i === 0 ? "contributionCalendar { weeks { contributionDays { contributionCount } } }" : "";
    blocks.push(
      `c${i}: contributionsCollection(from:"${from}", to:"${to}") {
        totalCommitContributions totalPullRequestContributions
        totalPullRequestReviewContributions totalIssueContributions
        restrictedContributionsCount ${cal}
      }`,
    );
  }
  const query = `query($login:String!){ user(login:$login){ ${blocks.join("\n")} } }`;

  let json: { data?: { user?: Record<string, ContribBlock> } };
  try {
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { login } }),
      next: { revalidate: 900 },
    });
    if (!res.ok) return undefined;
    json = await res.json();
  } catch {
    return undefined;
  }

  const user = json.data?.user;
  if (!user) return undefined;

  const sum = (b: ContribBlock) =>
    b.totalCommitContributions +
    b.totalPullRequestContributions +
    b.totalPullRequestReviewContributions +
    b.totalIssueContributions +
    b.restrictedContributionsCount;

  const recent = user.c0;
  const lifetimeContributions = Object.values(user).reduce((n, b) => n + sum(b), 0);
  const activeDaysRecent =
    recent.contributionCalendar?.weeks.reduce(
      (n, w) => n + w.contributionDays.filter((d) => d.contributionCount > 0).length,
      0,
    ) ?? 0;

  return {
    recentCommits: recent.totalCommitContributions + recent.restrictedContributionsCount,
    recentPRs: recent.totalPullRequestContributions,
    recentReviews: recent.totalPullRequestReviewContributions,
    recentIssues: recent.totalIssueContributions,
    activeDaysRecent,
    lifetimeContributions,
  };
}

// --- Public entry ----------------------------------------------------------

export async function fetchProfile(username: string): Promise<Profile> {
  const login = username.trim().replace(/^@/, "");
  const user = await rest<GhUser>(`/users/${encodeURIComponent(login)}`, login);
  const repos = await rest<GhRepo[]>(
    `/users/${encodeURIComponent(login)}/repos?per_page=100&sort=pushed`,
    login,
  );

  const owned = repos.filter((r) => !r.fork);
  const totalStars = owned.reduce((n, r) => n + (r.stargazers_count || 0), 0);
  const totalForks = owned.reduce((n, r) => n + (r.forks_count || 0), 0);
  const maxRepoStars = owned.reduce((m, r) => Math.max(m, r.stargazers_count || 0), 0);
  const langCounts = new Map<string, number>();
  for (const r of owned) if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
  const languages = langCounts.size;
  const topLanguage =
    [...langCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const lastPush = owned
    .map((r) => r.pushed_at)
    .filter(Boolean)
    .sort()
    .at(-1) as string | undefined;

  const accountAgeYears = yearsSince(user.created_at);

  // Distinct calendar years with repo activity (creation or last push), bounded
  // by the account's age — a proxy for how many years the dev has been building.
  const years = new Set<number>();
  for (const r of owned) {
    if (r.created_at) years.add(new Date(r.created_at).getUTCFullYear());
    if (r.pushed_at) years.add(new Date(r.pushed_at).getUTCFullYear());
  }
  const activeYears = Math.min(Math.max(years.size, 1), Math.ceil(accountAgeYears) || 1);

  const rich = await fetchRich(user.login, accountAgeYears);

  const stats: GitHubStats = {
    followers: user.followers,
    following: user.following,
    publicRepos: user.public_repos,
    totalStars,
    totalForks,
    maxRepoStars,
    languages,
    accountAgeYears,
    activeYears,
    daysSinceActive: lastPush ? daysSince(lastPush) : 999,
    rich,
  };

  return {
    login: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    location: user.location,
    country: countryFromLocation(user.location),
    topLanguage,
    stats,
  };
}

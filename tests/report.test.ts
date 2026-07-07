import { describe, expect, it } from "vitest";
import { rate, type GitHubStats } from "@/lib/score";
import { buildReport } from "@/lib/report";

const base: GitHubStats = {
  followers: 100,
  following: 50,
  publicRepos: 30,
  totalStars: 500,
  totalForks: 80,
  maxRepoStars: 200,
  languages: 6,
  accountAgeYears: 5,
  activeYears: 4,
  daysSinceActive: 10,
};

const report = (s: GitHubStats) => buildReport(s, rate(s).attributes);

describe("buildReport()", () => {
  it("keeps skill moves and weak foot within 1..5", () => {
    const r = report(base);
    expect(r.skillMoves.value).toBeGreaterThanOrEqual(1);
    expect(r.skillMoves.value).toBeLessThanOrEqual(5);
    expect(r.weakFoot.value).toBeGreaterThanOrEqual(1);
    expect(r.weakFoot.value).toBeLessThanOrEqual(5);
  });

  it("awards more skill moves for broader language range", () => {
    const few = report({ ...base, languages: 1 }).skillMoves.value;
    const many = report({ ...base, languages: 12 }).skillMoves.value;
    expect(many).toBeGreaterThan(few);
  });

  it("fires the Star Magnet playstyle once stars clear the threshold", () => {
    const names = report({ ...base, totalStars: 30000 }).playstyles.map((p) => p.name);
    expect(names).toContain("Star Magnet");
  });

  it("hides zeroed metrics and adds contribution metrics only with rich data", () => {
    const lite = report(base).metrics.map((m) => m.label);
    expect(lite).not.toContain("Commits (1y)");
    const rich = report({
      ...base,
      rich: { recentCommits: 800, recentPRs: 40, recentReviews: 60, recentIssues: 30, activeDaysRecent: 200, lifetimeContributions: 12000 },
    }).metrics.map((m) => m.label);
    expect(rich).toContain("Commits (1y)");
  });

  it("never returns a metric with a zero value", () => {
    const r = report({ ...base, totalForks: 0, followers: 0 });
    expect(r.metrics.every((m) => m.value > 0)).toBe(true);
  });
});

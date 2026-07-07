import { describe, expect, it } from "vitest";
import { rate, STATS, type GitHubStats } from "@/lib/score";

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

const superstar: GitHubStats = {
  ...base,
  followers: 230000,
  totalStars: 180000,
  maxRepoStars: 175000,
  languages: 8,
  accountAgeYears: 15,
  activeYears: 14,
  rich: { recentCommits: 1500, recentPRs: 200, recentReviews: 200, recentIssues: 150, activeDaysRecent: 300, lifetimeContributions: 80000 },
};

describe("rate()", () => {
  it("returns every attribute and the overall within 1..99", () => {
    const r = rate(base);
    for (const k of STATS) {
      expect(r.attributes[k]).toBeGreaterThanOrEqual(1);
      expect(r.attributes[k]).toBeLessThanOrEqual(99);
    }
    expect(r.overall).toBeGreaterThanOrEqual(1);
    expect(r.overall).toBeLessThanOrEqual(99);
  });

  it("stats alone never exceed the 88 cap; the overall can with legacy", () => {
    expect(rate(base).baseOVR).toBeLessThanOrEqual(88);
    expect(rate(superstar).baseOVR).toBeLessThanOrEqual(88);
  });

  it("marks depth 'lite' without rich data and 'rich' with it", () => {
    expect(rate(base).depth).toBe("lite");
    expect(rate(superstar).depth).toBe("rich");
  });

  it("ranks a superstar well above a mid-level dev", () => {
    expect(rate(superstar).overall).toBeGreaterThan(rate(base).overall);
    expect(rate(superstar).overall).toBeGreaterThanOrEqual(85);
  });

  it("derives a valid pitch position and family", () => {
    const r = rate(base);
    expect(["RW", "ST", "CM", "CAM", "CB", "CDM"]).toContain(r.position);
    expect(["Forward", "Playmaker", "Anchor"]).toContain(r.family);
  });

  it("more languages lifts Dribbling", () => {
    const few = rate({ ...base, languages: 1 }).attributes.dri;
    const many = rate({ ...base, languages: 14 }).attributes.dri;
    expect(many).toBeGreaterThan(few);
  });

  it("a review/issue-heavy profile leans defensive", () => {
    const r = rate({
      ...base,
      totalStars: 20,
      maxRepoStars: 10,
      rich: { recentCommits: 50, recentPRs: 10, recentReviews: 400, recentIssues: 400, activeDaysRecent: 200, lifetimeContributions: 8000 },
    });
    expect(["CB", "CDM"]).toContain(r.position);
  });
});

import { rate, type Rating } from "./score";
import type { Profile } from "./github";
import { countryFromLocation } from "./country";

// Static sample cards for the home fan — precomputed from representative stats so
// the landing page renders instantly, tokenless, with no GitHub calls. Numbers
// are ballpark (real scouts fetch live); avatars load from github.com/<login>.png.

interface Seed {
  login: string;
  name: string;
  location: string | null;
  topLanguage: string;
  stats: Parameters<typeof rate>[0];
}

const SEEDS: Seed[] = [
  {
    login: "torvalds",
    name: "Linus Torvalds",
    location: "Portland, OR",
    topLanguage: "C",
    stats: {
      followers: 230000, following: 0, publicRepos: 8, totalStars: 180000,
      totalForks: 52000, maxRepoStars: 175000, languages: 3, accountAgeYears: 15, activeYears: 14, daysSinceActive: 2,
      rich: { recentCommits: 900, recentPRs: 20, recentReviews: 40, recentIssues: 30, activeDaysRecent: 260, lifetimeContributions: 60000 },
    },
  },
  {
    login: "gaearon",
    name: "Dan Abramov",
    location: "London, UK",
    topLanguage: "JavaScript",
    stats: {
      followers: 92000, following: 180, publicRepos: 260, totalStars: 42000,
      totalForks: 9000, maxRepoStars: 12000, languages: 11, accountAgeYears: 14, activeYears: 13, daysSinceActive: 4,
      rich: { recentCommits: 1400, recentPRs: 220, recentReviews: 180, recentIssues: 120, activeDaysRecent: 240, lifetimeContributions: 40000 },
    },
  },
  {
    login: "sindresorhus",
    name: "Sindre Sorhus",
    location: "Oslo, Norway",
    topLanguage: "TypeScript",
    stats: {
      followers: 62000, following: 20, publicRepos: 1100, totalStars: 130000,
      totalForks: 9500, maxRepoStars: 30000, languages: 9, accountAgeYears: 15, activeYears: 15, daysSinceActive: 1,
      rich: { recentCommits: 3000, recentPRs: 400, recentReviews: 200, recentIssues: 300, activeDaysRecent: 300, lifetimeContributions: 90000 },
    },
  },
];

export const SAMPLE_CARDS: { profile: Profile; rating: Rating }[] = SEEDS.map((s) => ({
  profile: {
    login: s.login,
    name: s.name,
    avatarUrl: `https://github.com/${s.login}.png?size=240`,
    bio: null,
    location: s.location,
    country: countryFromLocation(s.location),
    topLanguage: s.topLanguage,
    stats: s.stats,
  },
  rating: rate(s.stats),
}));

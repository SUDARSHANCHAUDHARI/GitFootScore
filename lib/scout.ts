import { redis } from "./redis";
import { recordScout } from "./analytics";
import { fetchProfile, type Profile } from "./github";
import { rate, type Rating } from "./score";
import { buildReport, type ScoutReport } from "./report";

// Read-through Redis cache for scouted profiles — the single path the card page,
// the JSON API, the embed PNG and the OG image all use to turn a username into a
// scored card. A profile is fetched from GitHub + scored at most once per TTL;
// every other surface then reads from Redis instead of re-hitting GitHub.
//
// Best-effort throughout: no REDIS_URL, a miss, an outage or a parse error all
// fall through to a live fetch. Only the fetched Profile is cached (rating and
// report are cheap pure derivations recomputed on read), and only on success —
// scout errors propagate unchanged and are never cached.

const VERSION = "v1";
const TTL_SECONDS = 120 * 60; // 2h — GitHub stats move slowly.

const normalize = (u: string) => u.trim().replace(/^@/, "").toLowerCase();
const keyFor = (login: string) => `gfs:profile:${VERSION}:${login}`;

export interface Scout {
  profile: Profile;
  rating: Rating;
  report: ScoutReport;
}

async function readCache(login: string): Promise<Profile | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(keyFor(login));
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch (e) {
    console.error("[scout] cache read failed:", (e as Error).message);
    return null;
  }
}

async function writeCache(login: string, profile: Profile): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(keyFor(login), JSON.stringify(profile), "EX", TTL_SECONDS);
  } catch (e) {
    console.error("[scout] cache write failed:", (e as Error).message);
  }
}

const derive = (profile: Profile): Scout => {
  const rating = rate(profile.stats);
  return { profile, rating, report: buildReport(profile.stats, rating.attributes) };
};

// Single-flight: concurrent scouts of the same login collapse onto one in-flight
// fetch, so a trending profile isn't fetched once per viewer during the cache
// fill window. Entries clear the moment the fetch settles (success or failure).
const inflight = new Map<string, Promise<Profile>>();

async function fetchFresh(username: string, login: string, userToken?: string | null): Promise<Profile> {
  const profile = await fetchProfile(username, userToken);
  await writeCache(login, profile);
  void recordScout();
  return profile;
}

export async function scout(username: string, userToken?: string | null): Promise<Scout> {
  const login = normalize(username);

  // A user-supplied token yields richer data — key it separately so token and
  // tokenless requests for the same login don't share an in-flight result.
  const key = userToken ? `${login}#t` : login;

  const cached = userToken ? null : await readCache(login);
  if (cached) return derive(cached);

  const existing = inflight.get(key);
  if (existing) return derive(await existing);

  const pending = fetchFresh(username, login, userToken).finally(() => inflight.delete(key));
  inflight.set(key, pending);
  return derive(await pending);
}

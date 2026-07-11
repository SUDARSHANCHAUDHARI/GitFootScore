import { redis } from "./redis";

// Best-effort scout counter. No-ops without Redis; never throws into a scout.
const TOTAL_KEY = "gfs:scouts:total";

export async function recordScout(): Promise<void> {
  if (!redis) return;
  try {
    await redis.incr(TOTAL_KEY);
  } catch (e) {
    console.error("[analytics] incr failed:", (e as Error).message);
  }
}

export async function totalScouts(): Promise<number | null> {
  if (!redis) return null;
  try {
    const v = await redis.get(TOTAL_KEY);
    return v ? parseInt(v, 10) : 0;
  } catch {
    return null;
  }
}

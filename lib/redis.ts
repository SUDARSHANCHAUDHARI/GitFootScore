import "server-only";
import Redis from "ioredis";

// Best-effort Redis singleton. If REDIS_URL is unset (or the connection fails)
// `redis` is null and every caller falls through to a live path — the cache only
// ever changes speed, never behaviour. A single client is reused across requests
// via globalThis so dev hot-reloads don't leak connections.

declare global {
  // eslint-disable-next-line no-var
  var __gfsRedis: Redis | null | undefined;
}

function create(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: 1,
      lazyConnect: false,
      enableOfflineQueue: false,
    });
    client.on("error", (e) => console.error("[redis]", (e as Error).message));
    return client;
  } catch (e) {
    console.error("[redis] init failed:", (e as Error).message);
    return null;
  }
}

export const redis: Redis | null =
  globalThis.__gfsRedis !== undefined ? globalThis.__gfsRedis : (globalThis.__gfsRedis = create());

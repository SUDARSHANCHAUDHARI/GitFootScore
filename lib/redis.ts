// Redis cache disabled on the Cloudflare Workers runtime (ioredis needs Node TCP
// sockets, which Workers lack). Every caller already treats `redis === null` as
// "no cache" and falls through to a live fetch — behavior is unchanged, only
// speed. If a distributed cache is wanted later, back this with Cloudflare KV.
type RedisLike = {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode: string, ttl: number): Promise<unknown>
  incr(key: string): Promise<number>
}

export const redis: RedisLike | null = null

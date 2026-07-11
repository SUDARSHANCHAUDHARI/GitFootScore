
// GitHub token pool. Reads GITHUB_TOKENS (comma-separated) and/or GITHUB_TOKEN
// into one list, then shards each scout onto a deterministic token by hashing
// the login — so a hot profile always hits the same token (cache-friendly) while
// load spreads across the pool. `failover` hands back a *different* token when
// one comes back rate-limited, so a single throttled token doesn't fail a scout.

function pool(): string[] {
  const many = (process.env.GITHUB_TOKENS ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const one = process.env.GITHUB_TOKEN?.trim();
  const all = [...many];
  if (one && !all.includes(one)) all.push(one);
  return all;
}

// Small stable string hash (FNV-1a) → pool index.
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function hasTokens(): boolean {
  return pool().length > 0;
}

// Deterministic token for a login, or null (anonymous REST) when the pool is empty.
export function pickToken(login: string): string | null {
  const p = pool();
  return p.length ? p[hash(login.toLowerCase()) % p.length] : null;
}

// A different token than `exclude`, for one failover retry. null when there's no
// alternative.
export function failoverToken(login: string, exclude: string | null): string | null {
  const p = pool().filter((t) => t !== exclude);
  return p.length ? p[hash(login.toLowerCase()) % p.length] : null;
}

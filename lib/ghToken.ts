// Optional bring-your-own GitHub token. Stored only in the visitor's browser
// (localStorage) and sent as an x-github-token header with card requests. A
// user token unlocks the accurate GraphQL "rich" score and sidesteps GitHub's
// shared anonymous rate limit. Public read is all it needs — no scopes.
const KEY_STORAGE = "gitfootscore_gh_token";

export function getGhToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY_STORAGE) ?? "";
}

export function setGhToken(token: string): void {
  localStorage.setItem(KEY_STORAGE, token);
}

export function clearGhToken(): void {
  localStorage.removeItem(KEY_STORAGE);
}

export function ghHeaders(): Record<string, string> {
  const token = getGhToken();
  return token ? { "x-github-token": token } : {};
}

# ⚽ GitFootScore

**Turn any GitHub profile into a football-style player card — rated out of 99.**

GitFootScore scouts a developer's public GitHub activity and prints an EA-style
player card: six attributes, an overall rating, a pitch position and a tier.

**Live at [gitfootscore.sudarshantechlabs.com](https://gitfootscore.sudarshantechlabs.com)** —
enter a username, or open `/u?username=<login>` directly.

> Note: the previous embeddable `/<username>.png` card image and per-user
> social OG images (`next/og`) are not part of the hosted Cloudflare build —
> they require a WASM image renderer on Workers and are deferred. The
> interactive card renders in the browser.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-149eca" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT" />
</p>

---

## ✨ Features

- **Live player card** — every GitHub profile becomes an EA-style card with six
  attributes, an overall, a position and a tier.
- **Embeddable PNG** — `/<username>.png` renders the card server-side (via
  `next/og`, no headless browser) so it drops straight into a README and updates
  itself over time.
- **Instagram story export** — a 1080×1920 share frame at `/api/story/<username>`.
- **JSON API** — `/api/card/<username>` returns the full profile, rating and
  scout report.
- **Scout report** — skill moves, weak foot, work rate, play style, playstyle
  chips and a detailed metrics grid below the card.
- **Country flag + language logo** — resolved from the profile's location and
  top language.
- **Tokenless-friendly** — works with no credentials (GitHub's anonymous REST
  tier); add a token to unlock full contribution data and the accurate score.
- **Production-ready** — Redis read-through cache with request single-flight, a
  GitHub token pool with failover, and edge-cached images.
- **Reveal animation + confetti** for the top tiers, respecting
  `prefers-reduced-motion`.

---

## 🧮 How the rating works

Six FIFA-style attributes are estimated from real GitHub signals, then shaped
into a self-relative card and collapsed to an overall.

| Attr | Meaning | Driven by |
|------|---------|-----------|
| **PAC** | Pace | recent contribution activity |
| **SHO** | Shooting | total stars + top-repo reach |
| **PAS** | Passing | pull requests + followers |
| **DRI** | Dribbling | breadth of languages |
| **DEF** | Defending | reviews, issues + platform longevity |
| **PHY** | Physical | repositories + lifetime contributions |

**The pipeline** (`lib/score.ts`):

1. `rawStats` — log-scaled estimates from the signals above.
2. **Magnitude centre** — a gravity well the stats sit around, from overall reach.
3. **Z-score** — normalise the six against each other.
4. **Tension** — penalise antagonist pairs so nobody is elite at everything.
5. **Spike + cohesion** — specialists get spikier cards; the attacking four stay
   cohesive.
6. **Weighted overall** — position-weighted, capped at 88.
7. **Legacy bonus** — the 88→99 band is bought with years and sustained influence.

**Position** is derived from the card's shape (`RW / ST / CM / CAM / CB / CDM`),
and the **tier** from the overall:

`Sunday League → Academy → Semi-Pro → Professional → Elite → Ballon d'Or`

> **Note on scores:** PAC, PAS, DEF and PHY lean on commits / PRs / reviews /
> lifetime contributions, which only the GitHub **GraphQL** API returns (a token
> is required). Without a token the app still scores every profile from public
> REST data — just with less depth (`rating.depth === "lite"`).

### GitHub token — bring your own

On the hosted app, a token is **per-user**: click **Add GitHub token** on a
result to store your own token in your browser (sent as an `x-github-token`
header). It unlocks the accurate GraphQL score and your own 5k req/hr limit —
we never use a shared token. A classic token with **no scopes** is enough
(public data only). Without a token the app runs in anonymous **lite** mode
(GitHub's 60 req/hr shared REST tier); if that limit is hit you're prompted to
add a token.

A server-side `GITHUB_TOKEN` / `GITHUB_TOKENS` env var is still supported for
self-hosting, but the hosted deployment sets none.

---

## 🛠 Tech stack

- **Framework:** Next.js (App Router) · React 19
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **Data:** GitHub REST + GraphQL (via `fetch`)
- **Tests:** Vitest
- **Package manager:** pnpm

> The Redis (`ioredis`) cache and `next/og` card/story/OG images from earlier
> versions are disabled on the Cloudflare build (both need infra the Workers
> runtime lacks); the app falls through to live fetches and browser rendering.

---

## 🚀 Getting started

```bash
# install
pnpm install

# dev
pnpm dev            # http://localhost:3000

# tests
pnpm test
```

### Environment variables (self-hosting, all optional)

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` / `GITHUB_TOKENS` | Server-side token(s) — unlock the accurate GraphQL score and higher throughput. The hosted app sets none (tokens are per-user). |
| `NEXT_PUBLIC_SITE_URL` | Canonical site origin for metadata and the sitemap. |

## Deployment

Deployed on **Cloudflare Pages**: static export (`npx next build` → `out`) plus a
Pages Function at `functions/api/card/[username].ts`. Live at
`gitfootscore.sudarshantechlabs.com`.

---

## 🌐 Routes

| Route | Description |
|-------|-------------|
| `/` | Home — scout form, sample card fan, how-it-works |
| `/u/<username>` | The full scout page: card + report + share actions |
| `/<username>.png` | Embeddable card image (rewrites to `/api/card-image/<username>`) |
| `/api/card/<username>` | JSON: profile, stats, rating and report |
| `/api/story/<username>` | 1080×1920 Instagram-story image |
| `/opengraph-image`, `/u/<username>/opengraph-image` | Social unfurl images |

### Embed in your README

```md
[![My GitFootScore](http://localhost:3000/torvalds.png)](http://localhost:3000/u/torvalds)
```

---

## 📁 Project structure

```
app/
  page.tsx                     # home
  u/[username]/                # scout page + loading + OG
  api/card/[username]/         # JSON API
  api/card-image/[username]/   # embeddable card PNG
  api/story/[username]/        # story export
  opengraph-image.tsx          # home OG
components/
  PlayerCard.tsx  CardShell.tsx  ScoutReport.tsx  CardActions.tsx
  CardFan.tsx  Confetti.tsx  LangIcon.tsx  Wordmark.tsx  theme.ts
lib/
  score.ts        # the rating engine
  report.ts       # scout report (skill moves, playstyles, metrics)
  github.ts       # REST + GraphQL client
  githubTokens.ts # token pool
  scout.ts        # read-through cache + single-flight
  redis.ts  analytics.ts  cardSvg.ts  country.ts
  languageColors.ts  languageLogos.ts  samples.ts  site.ts
tests/            # vitest — scoring, report, country
```

---

## 🙏 Acknowledgements

GitFootScore is **inspired by [gitfut](https://github.com/younesfdj/gitfut)**
(MIT), which pioneered the "GitHub profile as a FUT card" concept. The rating
approach here is an independent implementation adapted from gitfut's engine, with
its own data layer, card rendering (SVG card art via `next/og`), branding and UI.
All credit for the original idea goes to the gitfut authors. See
[`NOTICE.md`](./NOTICE.md) for third-party credits.

---

## 👤 Author

**Sudarshan Chaudhari** — SudarshanTechLabs
GitHub: [@SUDARSHANCHAUDHARI](https://github.com/SUDARSHANCHAUDHARI)

---

## 📄 License

[MIT](./LICENSE) © Sudarshan Chaudhari

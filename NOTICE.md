# Third-party credits

## gitfut

GitFootScore's rating approach is adapted from **gitfut** — the project that
originated the "GitHub profile as a football (FUT) player card" concept.

- Source: https://github.com/younesfdj/gitfut
- License: MIT (as declared in the gitfut project)
- Original authors: the gitfut authors (younesfdj, wassim_khouas)

The scoring pipeline in `lib/score.ts` (attribute estimation, magnitude centring,
z-score normalisation, tension, spike/cohesion, position-weighted overall and the
legacy bonus) is an independent re-implementation adapted from gitfut's engine.
Everything else — the data layer, card rendering, image/story export, branding,
UI and tests — is original to GitFootScore.

All credit for the original idea and the scoring design goes to the gitfut
authors. This notice is provided in the spirit of MIT attribution.

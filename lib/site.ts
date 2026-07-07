// Canonical site origin, used for metadata, OG, sitemap and robots. Override via
// NEXT_PUBLIC_SITE_URL on deploy; the default is a sensible placeholder.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://gitfootscore.app").replace(
  /\/$/,
  "",
);
export const SITE_NAME = "GitFootScore";

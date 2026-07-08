// Site origin, used for metadata, OG, sitemap and robots. Runs on localhost by
// default; set NEXT_PUBLIC_SITE_URL only if you host it somewhere.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
export const SITE_NAME = "GitFootScore";
// Host without protocol, for display in cards/OG (e.g. "localhost:3000").
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

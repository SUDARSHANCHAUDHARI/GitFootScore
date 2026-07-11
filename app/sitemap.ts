import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { SAMPLE_CARDS } from "@/lib/samples";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...SAMPLE_CARDS.map(({ profile }) => ({
      url: `${SITE_URL}/u?username=${profile.login}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}

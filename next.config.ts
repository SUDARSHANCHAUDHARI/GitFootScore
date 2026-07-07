import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // GitHub avatars are rendered in the card.
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
  async rewrites() {
    // Pretty embed URL: /<username>.png -> the card image route. Charset matches
    // GitHub's (alphanumerics + hyphens) and only the .png suffix matches, so it
    // never shadows real static assets in /public.
    return [{ source: "/:username([a-zA-Z0-9-]+).png", destination: "/api/card-image/:username" }];
  },
};

export default nextConfig;

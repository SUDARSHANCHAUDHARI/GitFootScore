import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    // GitHub avatars are rendered in the card.
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
};

export default nextConfig;

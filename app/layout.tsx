import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

// Condensed display face for the card's rating/stat numerals — the FUT look.
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-cond",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "GitFootScore — rate your GitHub game",
  description:
    "Turn any GitHub profile into a football-style player card. Six attributes, an overall out of 99, a position and a tier — scouted live from public GitHub data.",
  openGraph: {
    title: "GitFootScore — rate your GitHub game",
    description: "Turn any GitHub profile into a football-style player card, rated out of 99.",
    siteName: "GitFootScore",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={oswald.variable}>
      <body>{children}</body>
    </html>
  );
}

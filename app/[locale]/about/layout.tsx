import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Timezio",
  description:
    "Timezio is a free, DST-aware time zone converter, world clock, and meeting planner built by AffSquad. Learn who runs it, how it works, and the data behind it.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Timezio",
    description:
      "Who builds Timezio, how its DST-aware calculations work, and the IANA data behind every result.",
    url: `${SITE_URL}/about`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "About Timezio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Timezio",
    description: "A free, DST-aware time zone toolkit built by AffSquad.",
    images: [OG_IMAGE],
  },
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

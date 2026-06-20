import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore Time Zones on a Globe | Timezio",
  description:
    "Explore time zones on an interactive 3D globe. Check current time, UTC offset, and DST status for any location.",
  alternates: { canonical: "/explore" },
  openGraph: {
    title: "Explore Time Zones on a Globe | Timezio",
    description:
      "Explore time zones on an interactive 3D globe with DST-aware calculations.",
    url: "https://www.timezio.com/explore",
    siteName: "Timezio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.timezio.com/og-image.png",
        alt: "Timezio interactive globe",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Explore Time Zones on a Globe | Timezio",
    description: "Explore time zones with DST-aware data on an interactive globe.",
    images: ["https://www.timezio.com/og-image.png"],
  },
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}



import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Time Zones | Timezio",
  description:
    "Compare time zones side-by-side with DST-aware offsets. Visualize locations on an interactive globe and avoid scheduling mistakes.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title: "Compare Time Zones | Timezio",
    description:
      "Compare time zones side-by-side with DST-aware offsets on an interactive globe.",
    url: "https://www.timezio.com/compare",
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
    title: "Compare Time Zones | Timezio",
    description: "DST-aware time zone comparison on an interactive globe.",
    images: ["https://www.timezio.com/og-image.png"],
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}



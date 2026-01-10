import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Locations & Time Zones | Timezio",
  description:
    "Save frequently used locations and quickly return to their current time, offset, and DST status.",
  alternates: { canonical: "/saved" },
  openGraph: {
    title: "Saved Locations & Time Zones | Timezio",
    description:
      "Save your favorite locations and revisit their time and DST status instantly.",
    url: "https://timezio.com/saved",
    siteName: "Timezio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://timezio.com/globe.svg",
        alt: "Timezio interactive globe",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saved Locations & Time Zones | Timezio",
    description: "Save and revisit frequently used locations and time zones.",
    images: ["https://timezio.com/globe.svg"],
  },
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}



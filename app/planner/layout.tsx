import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meeting Planner Across Time Zones | Timezio",
  description:
    "Plan meetings across time zones with working hours, overlap windows, and DST-aware calculations.",
  alternates: { canonical: "/planner" },
  openGraph: {
    title: "Meeting Planner Across Time Zones | Timezio",
    description:
      "Plan meetings across time zones with overlap windows and DST-aware calculations.",
    url: "https://timezio.com/planner",
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
    title: "Meeting Planner Across Time Zones | Timezio",
    description: "DST-aware meeting planner with overlap windows and working hours.",
    images: ["https://timezio.com/globe.svg"],
  },
};

export default function PlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}



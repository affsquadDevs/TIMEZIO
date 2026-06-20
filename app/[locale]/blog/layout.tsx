import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: "Time Zone Guides & Remote Work Tips | Timezio Blog",
    template: "%s | Timezio Blog",
  },
  description: "In-depth guides on time zones, daylight saving time, remote collaboration, and using Timezio effectively.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Time Zone Guides & Remote Work Tips | Timezio Blog",
    description: "In-depth guides on time zones, DST changes, remote collaboration, and using Timezio effectively.",
    url: `${SITE_URL}/blog`,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Timezio Blog" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Time Zone Guides & Remote Work Tips | Timezio Blog",
    description: "Guides on time zones, DST, remote teams, and Timezio features.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


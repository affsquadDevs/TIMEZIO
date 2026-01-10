import type { Metadata } from "next";

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
    url: "https://timezio.com/blog",
    siteName: "Timezio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Time Zone Guides & Remote Work Tips | Timezio Blog",
    description: "Guides on time zones, DST, remote teams, and Timezio features.",
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


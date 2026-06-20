import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Terms of Service | Timezio",
    template: "%s | Timezio",
  },
  description: "Terms and conditions for using Timezio’s timezone tools, converters, and meeting planner.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service | Timezio",
    description: "The terms governing your use of Timezio’s tools and services.",
    url: "https://www.timezio.com/terms",
    siteName: "Timezio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service | Timezio",
    description: "Terms and conditions for using Timezio’s timezone tools.",
  },
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


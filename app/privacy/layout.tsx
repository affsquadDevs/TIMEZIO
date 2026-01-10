import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Privacy Policy | Timezio",
    template: "%s | Timezio",
  },
  description: "How Timezio collects, uses, and protects information in compliance with GDPR and applicable data protection laws.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Timezio",
    description: "Learn how Timezio handles data, cookies, analytics, and ads in line with GDPR.",
    url: "https://timezio.com/privacy",
    siteName: "Timezio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Timezio",
    description: "Data handling, cookies, analytics, and ads practices at Timezio.",
  },
};

export default function PrivacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


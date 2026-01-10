import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Timezio",
  description: "Terms of Service for Timezio - Learn about the terms and conditions governing your use of our timezone tools and services.",
};

export default function TermsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Timezio",
  description: "Learn about Timezio - a simple, accurate, and stress-free tool for working across time zones. Built for professionals, travelers, and remote teams.",
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


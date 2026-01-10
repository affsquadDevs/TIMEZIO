import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - Timezio",
  description: "Articles and guides about time zones, remote work, and using Timezio effectively.",
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


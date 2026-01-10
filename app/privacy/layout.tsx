import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Timezio",
  description: "Privacy Policy for Timezio - Learn how we collect, use, and protect your information in accordance with GDPR and applicable data protection laws.",
};

export default function PrivacyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


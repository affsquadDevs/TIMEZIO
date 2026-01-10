import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Timezio",
  description: "Contact Timezio - Get in touch with questions, feedback, or to report issues. We value your input and are here to help.",
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


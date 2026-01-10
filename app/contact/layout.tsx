import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Contact Timezio Support",
    template: "%s | Timezio",
  },
  description: "Get help, report issues, or request features for Timezio’s time zone tools. We respond to feedback and support questions.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Timezio Support",
    description: "Get help, report issues, or request features for Timezio’s time zone tools.",
    url: "https://timezio.com/contact",
    siteName: "Timezio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Timezio Support",
    description: "Reach Timezio with questions, feedback, or bug reports.",
  },
};

export default function ContactLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}


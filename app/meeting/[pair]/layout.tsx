import type { Metadata } from "next";

type Params = { pair: string };

const toTitle = (text: string) =>
  text
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const parsePair = (pair: string) => {
  const normalized = pair.toLowerCase();
  const parts = normalized.includes("-to-") ? normalized.split("-to-") : [];
  const from = parts[0] ?? "";
  const to = parts[1] ?? "";
  return {
    from: from ? toTitle(from) : "City A",
    to: to ? toTitle(to) : "City B",
  };
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { from, to } = parsePair(resolvedParams.pair);
  const title = `Best Meeting Time ${from} to ${to}`;
  const description = `Find the best meeting time between ${from} and ${to} with overlap hours and DST awareness.`;
  const canonical = `/meeting/${resolvedParams.pair}`;
  const ogImage = "https://timezio.com/globe.svg";
  return {
    title,
    description,
    keywords: [`meeting time ${from} ${to}`, `best time to meet ${from} ${to}`, `schedule meeting ${from} ${to}`, `overlap hours ${from} ${to}`],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `https://timezio.com${canonical}`,
      siteName: "Timezio",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: ogImage,
          alt: `Meeting planner for ${from} & ${to}`,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function MeetingPairLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


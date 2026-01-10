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
    from: from ? toTitle(from) : "From",
    to: to ? toTitle(to) : "To",
  };
};

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { from, to } = parsePair(resolvedParams.pair);
  const title = `${from} to ${to} Time Converter`;
  const description = `Convert ${from} to ${to} instantly with daylight saving time awareness. See current offsets and schedule confidently.`;
  const canonical = `/convert/${resolvedParams.pair}`;
  const ogImage = "https://timezio.com/globe.svg";
  return {
    title,
    description,
    keywords: [`${from} to ${to}`, `convert ${from} to ${to}`, `${from} ${to} time difference`, `time zone converter`, `DST converter`],
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
          alt: "Timezio interactive globe",
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

export default function ConvertPairLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


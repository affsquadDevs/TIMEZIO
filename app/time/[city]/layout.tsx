import type { Metadata } from "next";

type Params = { city: string };

const toTitle = (text: string) =>
  text
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const cityName = toTitle(resolvedParams.city);
  const title = `Current Time in ${cityName}`;
  const description = `See the current local time in ${cityName}, with UTC offset and daylight saving status.`;
  const canonical = `/time/${resolvedParams.city}`;
  const ogImage = "https://timezio.com/globe.svg";
  return {
    title,
    description,
    keywords: [`time in ${cityName}`, `${cityName} time now`, `current time ${cityName}`, `world clock ${cityName}`],
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
          alt: `${cityName} current time on Timezio`,
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

export default function TimeCityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


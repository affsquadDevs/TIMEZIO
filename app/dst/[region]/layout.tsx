import type { Metadata } from "next";

type Params = { region: string };

const toTitle = (text: string) =>
  text
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const resolvedParams = await params;
  const regionName = toTitle(resolvedParams.region);
  const title = `${regionName} Daylight Saving Time`;
  const description = `Check if ${regionName} is currently observing daylight saving time, and see start/end dates.`;
  const canonical = `/dst/${resolvedParams.region}`;
  const ogImage = "https://timezio.com/globe.svg";
  return {
    title,
    description,
    keywords: [`${regionName} DST`, `daylight saving time ${regionName}`, `${regionName} DST dates`, `when does ${regionName} change clocks`],
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
          alt: `${regionName} daylight saving time guide`,
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

export default function DstRegionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


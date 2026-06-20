import type { Metadata } from 'next';
import { parseConvertPair, offsetDiffHours, formatDiffHours } from '@/lib/timeData';
import { SITE_URL, SITE_NAME, OG_IMAGE } from '@/lib/site';

type Params = { pair: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parseConvertPair(pair);

  if (!parsed) {
    return { title: 'Converter not found', robots: { index: false, follow: false } };
  }

  const { from, to } = parsed;
  const diffText = formatDiffHours(offsetDiffHours(from.zone, to.zone));
  const canonical = `/convert/${pair}`;
  const title = `${from.label} to ${to.label} Time Converter`;
  const description = `Convert ${from.label} to ${to.label} with a full hour-by-hour table. ${to.label} is currently ${diffText} ${from.label}. DST-aware, using official IANA data.`;

  return {
    title,
    description,
    keywords: [`${from.label} to ${to.label}`, `convert ${from.label} to ${to.label}`, `${from.label} ${to.label} time difference`, 'time zone converter', 'DST converter'],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [{ url: OG_IMAGE, alt: `${from.label} to ${to.label} converter on Timezio`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default function ConvertPairLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

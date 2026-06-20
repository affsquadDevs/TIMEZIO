import type { Metadata } from 'next';
import { getDstRegion } from '@/lib/timeData';
import { SITE_URL, SITE_NAME, OG_IMAGE } from '@/lib/site';

type Params = { region: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { region } = await params;
  const data = getDstRegion(region);

  if (!data) {
    return { title: 'Region not found', robots: { index: false, follow: false } };
  }

  const { regionLabel, facts, observesDst } = data;
  const canonical = `/dst/${region}`;
  const title = `${regionLabel} Daylight Saving Time ${new Date().getFullYear()}`;
  const next = facts.transitions[0];
  const description = observesDst
    ? `Does ${regionLabel} observe daylight saving time? Yes — currently ${facts.offsetLabel}.${next ? ` Next change: ${next.whenDate}.` : ''} See exact clock-change dates and offsets.`
    : `${regionLabel} does not observe daylight saving time and stays at ${facts.offsetLabel} year-round. Current status and offset details.`;

  return {
    title,
    description,
    keywords: [`${regionLabel} DST`, `daylight saving time ${regionLabel}`, `${regionLabel} clock change dates`, `does ${regionLabel} observe DST`],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [{ url: OG_IMAGE, alt: `${regionLabel} daylight saving time on Timezio`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default function DstRegionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

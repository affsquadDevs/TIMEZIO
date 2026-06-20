import type { Metadata } from 'next';
import { parseMeetingPair } from '@/utils/cityMapper';
import { cityShortName, getZoneFacts, type City } from '@/lib/timeData';
import { SITE_URL, SITE_NAME, OG_IMAGE } from '@/lib/site';

type Params = { pair: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { pair } = await params;
  const { cityA, cityB } = parseMeetingPair(pair) as { cityA: City | null; cityB: City | null };

  if (!cityA || !cityB) {
    return { title: 'Meeting planner not found', robots: { index: false, follow: false } };
  }

  const nameA = cityShortName(cityA);
  const nameB = cityShortName(cityB);
  const factsA = getZoneFacts(cityA.tz);
  const factsB = getZoneFacts(cityB.tz);
  const canonical = `/meeting/${pair}`;
  const title = `Best Meeting Time: ${nameA} and ${nameB}`;
  const description = `Find overlapping working hours between ${nameA} (${factsA.offsetLabel}) and ${nameB} (${factsB.offsetLabel}). DST-aware meeting planner with a shared-hours table.`;

  return {
    title,
    description,
    keywords: [`meeting time ${nameA} ${nameB}`, `best time to meet ${nameA} ${nameB}`, `${nameA} ${nameB} overlap hours`, `schedule meeting ${nameA} ${nameB}`],
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'en_US',
      images: [{ url: OG_IMAGE, alt: `Meeting planner for ${nameA} and ${nameB} on Timezio`, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default function MeetingPairLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

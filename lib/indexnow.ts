// IndexNow integration. The key file is hosted at /<key>.txt (public/), and we
// notify IndexNow-participating engines (Bing, Yandex, Seznam, Naver…) when URLs
// change. The key is public by design (anyone can read the hosted file).
import { blogPosts } from '@/data/blogPosts';
import { popularConverters, popularMeetings, popularDst } from '@/data/seoLinks';
import citiesData from '@/data/cities.top200.json';
import { SITE_URL } from '@/lib/site';
import { locales } from '@/i18n/routing';
import { localizedPath } from '@/lib/i18nMeta';

export const INDEXNOW_KEY = 'ea6441e3c65740798089e541e4cffbc9';
export const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

type CityRow = { id: string };

// Indexable, locale-agnostic paths — mirrors app/sitemap.ts (excludes the
// noindex /saved and /meeting-planner routes).
function basePaths(): string[] {
  const statics = [
    '/', '/explore', '/compare', '/planner', '/time-zone-converter',
    '/convert', '/time', '/meeting', '/dst', '/about', '/blog', '/contact', '/privacy', '/terms',
  ];
  const blog = blogPosts.map((p) => `/blog/${p.slug}`);
  const conv = popularConverters.map((c) => `/convert/${c.slug}`);
  const cities = (citiesData as CityRow[]).map((c) => `/time/${c.id.replace(/_/g, '-')}`);
  const meet = popularMeetings.map((m) => `/meeting/${m.slug}`);
  const dst = popularDst.map((d) => `/dst/${d.slug}`);
  return [...statics, ...blog, ...conv, ...cities, ...meet, ...dst];
}

/** Every indexable absolute URL across all locales. */
export function getAllSiteUrls(): string[] {
  const urls: string[] = [];
  for (const path of basePaths()) {
    for (const l of locales) urls.push(`${SITE_URL}${localizedPath(l, path)}`);
  }
  return urls;
}

/** Submit a batch of URLs to IndexNow (max 10,000 per request). */
export async function submitUrls(urls: string[]): Promise<{ ok: boolean; status: number; submitted: number }> {
  const urlList = urls.slice(0, 10000);
  if (!urlList.length) return { ok: true, status: 200, submitted: 0 };

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: INDEXNOW_KEY_LOCATION,
      urlList,
    }),
  });

  return { ok: res.ok, status: res.status, submitted: urlList.length };
}

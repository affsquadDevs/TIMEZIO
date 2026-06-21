import { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blogPosts';
import { popularConverters, popularMeetings, popularDst } from '@/data/seoLinks';
import citiesData from '@/data/cities.top200.json';
import { SITE_URL } from '@/lib/site';
import { localizedPath, sitemapLanguages } from '@/lib/i18nMeta';
import { locales } from '@/i18n/routing';

// Stable last-modified so the sitemap doesn't report "now" on every request.
const LAST_MODIFIED = '2026-06-20';

type CityRow = { id: string };
type Freq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

// Emit one sitemap entry PER LOCALE for a route — each language version gets its
// own <loc>, and every entry carries the full reciprocal hreflang alternate set
// (incl. x-default). This ensures all 11 language versions are discovered and
// indexed, not just the default-locale URL.
function entries(path: string, changeFrequency: Freq, priority: number, lastModified: string = LAST_MODIFIED): MetadataRoute.Sitemap {
  const languages = sitemapLanguages(path, SITE_URL);
  return locales.map((loc) => ({
    url: `${SITE_URL}${localizedPath(loc, path)}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = [];

  const staticPaths: Array<[string, Freq, number]> = [
    ['/', 'weekly', 1.0],
    ['/explore', 'monthly', 0.9],
    ['/compare', 'monthly', 0.9],
    ['/planner', 'monthly', 0.9],
    ['/time-zone-converter', 'monthly', 0.9],
    ['/convert', 'monthly', 0.85],
    ['/time', 'monthly', 0.85],
    ['/meeting', 'monthly', 0.85],
    ['/dst', 'monthly', 0.8],
    ['/about', 'yearly', 0.6],
    ['/blog', 'weekly', 0.8],
    ['/contact', 'yearly', 0.5],
    ['/privacy', 'yearly', 0.4],
    ['/terms', 'yearly', 0.4],
  ];
  for (const [p, f, pr] of staticPaths) out.push(...entries(p, f, pr));

  for (const post of blogPosts) {
    const lm = post.date ? new Date(post.date).toISOString().slice(0, 10) : LAST_MODIFIED;
    out.push(...entries(`/blog/${post.slug}`, 'yearly', 0.7, lm));
  }
  for (const conv of popularConverters) out.push(...entries(`/convert/${conv.slug}`, 'monthly', 0.7));
  for (const city of citiesData as CityRow[]) out.push(...entries(`/time/${city.id.replace(/_/g, '-')}`, 'monthly', 0.65));
  for (const meeting of popularMeetings) out.push(...entries(`/meeting/${meeting.slug}`, 'monthly', 0.65));
  for (const dst of popularDst) out.push(...entries(`/dst/${dst.slug}`, 'monthly', 0.65));

  return out;
}

import { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blogPosts';
import { popularConverters, popularMeetings, popularDst } from '@/data/seoLinks';
import citiesData from '@/data/cities.top200.json';
import { SITE_URL } from '@/lib/site';
import { localizedPath, sitemapLanguages } from '@/lib/i18nMeta';
import { defaultLocale } from '@/i18n/routing';

// Stable last-modified so the sitemap doesn't report "now" on every request.
const LAST_MODIFIED = '2026-06-20';

type CityRow = { id: string };
type Freq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

// One sitemap entry per route: the URL is the default-locale (English, no prefix)
// URL, with <xhtml:link hreflang> alternates for every locale incl. x-default.
function entry(path: string, changeFrequency: Freq, priority: number, lastModified: string = LAST_MODIFIED) {
  return {
    url: `${SITE_URL}${localizedPath(defaultLocale, path)}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages: sitemapLanguages(path, SITE_URL) },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    entry('/', 'weekly', 1.0),
    entry('/explore', 'monthly', 0.9),
    entry('/compare', 'monthly', 0.9),
    entry('/planner', 'monthly', 0.9),
    entry('/time-zone-converter', 'monthly', 0.9),
    entry('/convert', 'monthly', 0.85),
    entry('/time', 'monthly', 0.85),
    entry('/meeting', 'monthly', 0.85),
    entry('/dst', 'monthly', 0.8),
    entry('/about', 'yearly', 0.6),
    entry('/blog', 'weekly', 0.8),
    entry('/contact', 'yearly', 0.5),
    entry('/privacy', 'yearly', 0.4),
    entry('/terms', 'yearly', 0.4),
  ];

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) =>
    entry(`/blog/${post.slug}`, 'yearly', 0.7, post.date ? new Date(post.date).toISOString().slice(0, 10) : LAST_MODIFIED)
  );

  const converterPages: MetadataRoute.Sitemap = popularConverters.map((conv) =>
    entry(`/convert/${conv.slug}`, 'monthly', 0.7)
  );

  // All known cities — each renders real, unique time data.
  const cityPages: MetadataRoute.Sitemap = (citiesData as CityRow[]).map((city) =>
    entry(`/time/${city.id.replace(/_/g, '-')}`, 'monthly', 0.65)
  );

  const meetingPages: MetadataRoute.Sitemap = popularMeetings.map((meeting) =>
    entry(`/meeting/${meeting.slug}`, 'monthly', 0.65)
  );

  const dstPages: MetadataRoute.Sitemap = popularDst.map((dst) =>
    entry(`/dst/${dst.slug}`, 'monthly', 0.65)
  );

  return [...staticPages, ...blogPages, ...converterPages, ...cityPages, ...meetingPages, ...dstPages];
}

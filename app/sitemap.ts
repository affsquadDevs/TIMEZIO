import { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blogPosts';
import { popularConverters, popularMeetings, popularDst } from '@/data/seoLinks';
import citiesData from '@/data/cities.top200.json';
import { SITE_URL } from '@/lib/site';

// Stable last-modified so the sitemap doesn't report "now" on every request.
const LAST_MODIFIED = '2026-06-20';

type CityRow = { id: string };

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_URL;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/explore`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/compare`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/planner`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/time-zone-converter`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/convert`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/time`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/meeting`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${baseUrl}/dst`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/blog`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/terms`, lastModified: LAST_MODIFIED, changeFrequency: 'yearly', priority: 0.4 },
  ];

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date).toISOString().slice(0, 10) : LAST_MODIFIED,
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  const converterPages: MetadataRoute.Sitemap = popularConverters.map((conv) => ({
    url: `${baseUrl}/convert/${conv.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // All known cities (not just the "popular" subset) — each now renders real,
  // unique time data, so they are legitimate indexable pages.
  const cityPages: MetadataRoute.Sitemap = (citiesData as CityRow[]).map((city) => ({
    url: `${baseUrl}/time/${city.id.replace(/_/g, '-')}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  const meetingPages: MetadataRoute.Sitemap = popularMeetings.map((meeting) => ({
    url: `${baseUrl}/meeting/${meeting.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  const dstPages: MetadataRoute.Sitemap = popularDst.map((dst) => ({
    url: `${baseUrl}/dst/${dst.slug}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: 'monthly',
    priority: 0.65,
  }));

  return [...staticPages, ...blogPages, ...converterPages, ...cityPages, ...meetingPages, ...dstPages];
}

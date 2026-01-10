import { MetadataRoute } from 'next';
import { blogPosts } from '@/data/blogPosts';
import { popularConverters, popularCities, popularMeetings, popularDst } from '@/data/seoLinks';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://timezio.com';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/planner`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/saved`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/convert`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/time`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/meeting`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/dst`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ];

  // Dynamic blog posts
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date).toISOString() : currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Programmatic pages - Converters
  const converterPages: MetadataRoute.Sitemap = popularConverters.map((conv) => ({
    url: `${baseUrl}/convert/${conv.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Programmatic pages - Cities
  const cityPages: MetadataRoute.Sitemap = popularCities.map((city) => ({
    url: `${baseUrl}/time/${city.slug}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Programmatic pages - Meetings
  const meetingPages: MetadataRoute.Sitemap = popularMeetings.map((meeting) => ({
    url: `${baseUrl}/meeting/${meeting.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Programmatic pages - DST
  const dstPages: MetadataRoute.Sitemap = popularDst.map((dst) => ({
    url: `${baseUrl}/dst/${dst.slug}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...converterPages, ...cityPages, ...meetingPages, ...dstPages];
}


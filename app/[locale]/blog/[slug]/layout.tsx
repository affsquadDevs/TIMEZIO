import type { Metadata } from 'next';
import { blogPostsMap } from '@/data/blogPosts';
import { JsonLd } from '@/components/seo/JsonLd';
import { SITE_URL, SITE_NAME, SITE_LOGO, OG_IMAGE, OPERATOR_NAME } from '@/lib/site';

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPostsMap[slug];

  if (!post) {
    return { title: 'Post not found', robots: { index: false, follow: false } };
  }

  const canonical = `/blog/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}${canonical}`,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.date,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: 'summary_large_image', title: post.title, description: post.excerpt, images: [OG_IMAGE] },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
  };
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = blogPostsMap[slug];

  const canonical = `${SITE_URL}/blog/${slug}`;
  const articleLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        dateModified: post.date,
        author: { '@type': 'Organization', name: OPERATOR_NAME, url: SITE_URL },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: { '@type': 'ImageObject', url: SITE_LOGO },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        url: canonical,
      }
    : null;

  const breadcrumbLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
        ],
      }
    : null;

  return (
    <>
      {articleLd && <JsonLd data={articleLd} id="ld-article" />}
      {breadcrumbLd && <JsonLd data={breadcrumbLd} id="ld-breadcrumb" />}
      {children}
    </>
  );
}

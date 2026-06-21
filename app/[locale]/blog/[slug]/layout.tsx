import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPost } from '@/lib/blog';
import { JsonLd } from '@/components/seo/JsonLd';
import { pageMetadata, localizedPath } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';
import { SITE_URL, SITE_NAME, SITE_LOGO, OPERATOR_NAME } from '@/lib/site';

type Params = { locale: string; slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) return { robots: { index: false, follow: false } };
  return pageMetadata({
    locale: locale as Locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.excerpt,
    type: 'article',
    publishedTime: post.date,
  });
}

export default async function BlogPostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  const post = await getPost(locale, slug);
  const tc = await getTranslations({ locale, namespace: 'common' });
  const tb = await getTranslations({ locale, namespace: 'blog' });
  const canonical = `${SITE_URL}${localizedPath(locale as Locale, `/blog/${slug}`)}`;

  const articleLd = post
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: locale,
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
          { '@type': 'ListItem', position: 1, name: tc('breadcrumbHome'), item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: tb('indexTitle'), item: `${SITE_URL}${localizedPath(locale as Locale, '/blog')}` },
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

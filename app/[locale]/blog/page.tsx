import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import styles from '@/components/layout/layout.module.css';
import blogStyles from './blog.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import { JsonLd } from '@/components/seo/JsonLd';
import { getAllPosts } from '@/lib/blog';
import { localizedPath } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site';

type Params = { locale: string };

export default async function BlogPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('blog');
  const tc = await getTranslations('common');
  const posts = await getAllPosts(locale);

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: tc('breadcrumbHome'), item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: t('indexTitle'), item: `${SITE_URL}${localizedPath(locale as Locale, '/blog')}` },
    ],
  };

  return (
    <div className={styles.layout}>
      <TopBar />
      <JsonLd data={breadcrumb} id="ld-breadcrumb" />
      <div className={blogStyles.content}>
        <div className={blogStyles.blogContainer}>
          <header className={blogStyles.blogHeader}>
            <h1 className={blogStyles.blogTitle}>{t('indexTitle')}</h1>
            <p className={blogStyles.blogDescription}>{t('indexDescription')}</p>
          </header>

          <div className={blogStyles.postsList}>
            {posts.map((post) => (
              <article key={post.slug} className={blogStyles.postCard}>
                <Link href={`/blog/${post.slug}`} className={blogStyles.postLink}>
                  <div className={blogStyles.postContent}>
                    <div className={blogStyles.postHeader}>
                      <h2 className={blogStyles.postTitle}>{post.title}</h2>
                      <div className={blogStyles.postMeta}>
                        <time dateTime={post.date} className={blogStyles.postDate}>
                          {new Date(post.date).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                        <span className={blogStyles.postMetaDivider}>•</span>
                        <span className={blogStyles.postReadTime}>{post.readTime}</span>
                      </div>
                    </div>
                    <p className={blogStyles.postExcerpt}>{post.excerpt}</p>
                    <div className={blogStyles.postFooter}>
                      <span className={blogStyles.readMore}>
                        {t('readMore')}
                        <span className={blogStyles.readMoreArrow}>→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

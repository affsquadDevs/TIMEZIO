'use client';

import { useEffect } from 'react';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import blogStyles from './blog.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import { blogPosts } from '@/data/blogPosts';
import Link from 'next/link';

export default function BlogPage() {
  useEffect(() => {
    // Add breadcrumb structured data
    if (typeof window === 'undefined') return;
    
    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: window.location.origin,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: window.location.href,
        },
      ],
    };

    const scriptId = 'breadcrumb-schema';
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={blogStyles.content}>
        <div className={blogStyles.blogContainer}>
          <header className={blogStyles.blogHeader}>
            <h1 className={blogStyles.blogTitle}>Blog</h1>
            <p className={blogStyles.blogDescription}>
              Articles and guides about time zones, remote work, and using Timezio effectively.
            </p>
          </header>

          <div className={blogStyles.postsList}>
            {blogPosts.map((post) => (
              <article key={post.slug} className={blogStyles.postCard}>
                <Link href={`/blog/${post.slug}`} className={blogStyles.postLink}>
                  <div className={blogStyles.postContent}>
                    <div className={blogStyles.postHeader}>
                      <h2 className={blogStyles.postTitle}>{post.title}</h2>
                      <div className={blogStyles.postMeta}>
                        <time dateTime={post.date} className={blogStyles.postDate}>
                          {new Date(post.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </time>
                        <span className={blogStyles.postMetaDivider}>•</span>
                        <span className={blogStyles.postReadTime}>{post.readTime}</span>
                      </div>
                    </div>
                    <p className={blogStyles.postExcerpt}>{post.excerpt}</p>
                    <div className={blogStyles.postFooter}>
                      <span className={blogStyles.readMore}>
                        Read more
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


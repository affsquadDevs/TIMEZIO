'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import blogStyles from '../blog.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import { blogPosts, blogPostsMap } from '@/data/blogPosts';
import Link from 'next/link';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = blogPostsMap[slug];

  useEffect(() => {
    if (!post) return;

    // Set document title and meta description
    if (typeof window !== 'undefined') {
      document.title = post.title;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = post.excerpt;
        document.head.appendChild(meta);
      }
    }

    // Add structured data
    if (typeof window === 'undefined') return;
    
    // Use custom schemas if provided, otherwise generate them
    const breadcrumbSchema = post.breadcrumbSchema || {
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
          item: `${window.location.origin}/blog`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: post.title,
          item: window.location.href,
        },
      ],
    };

    const articleSchema = post.blogPostingSchema || {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Organization',
        name: 'Timezio',
        url: 'https://timezio.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Timezio',
        url: 'https://timezio.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://timezio.com/globe.svg',
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': window.location.href,
      },
      url: window.location.href,
    };

    const scriptIds = ['breadcrumb-schema', 'article-schema'];
    
    // Add FAQ schema if provided
    if (post.faqSchema) {
      scriptIds.push('faq-schema');
    }
    
    // Remove existing scripts
    scriptIds.forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    // Add breadcrumb schema
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = 'breadcrumb-schema';
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    // Add article schema
    const articleScript = document.createElement('script');
    articleScript.id = 'article-schema';
    articleScript.type = 'application/ld+json';
    articleScript.text = JSON.stringify(articleSchema);
    document.head.appendChild(articleScript);

    // Add FAQ schema if provided
    if (post.faqSchema) {
      const faqScript = document.createElement('script');
      faqScript.id = 'faq-schema';
      faqScript.type = 'application/ld+json';
      faqScript.text = JSON.stringify(post.faqSchema);
      document.head.appendChild(faqScript);
    }

    return () => {
      scriptIds.forEach(id => {
        const script = document.getElementById(id);
        if (script) document.head.removeChild(script);
      });
    };
  }, [post]);

  if (!post) {
    return (
      <div className={styles.layout}>
        <TopBar />
        <div className={blogStyles.content}>
          <div className={ui.card}>
            <div className={`${ui.cardBody} ${blogStyles.contentBody}`}>
              <h1 className={ui.title}>Post Not Found</h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                The blog post you're looking for doesn't exist.
              </p>
              <Link href="/blog" className={ui.btnPrimary} style={{ textDecoration: 'none', display: 'inline-block' }}>
                ← Back to Blog
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Get related posts (exclude current post)
  const getRelatedPosts = () => {
    return blogPosts.filter(p => p.slug !== slug).slice(0, 3);
  };

  // Add internal links to text (simple version - avoids nested links)
  const addInternalLinks = (text: string): (string | React.ReactElement)[] => {
    // Link mappings - order matters (longer patterns first to avoid partial matches)
    const linkPatterns: Array<{ pattern: RegExp; href: string }> = [
      { pattern: /\bCoordinated Universal Time\b/gi, href: '/blog/what-is-utc' },
      { pattern: /\bdaylight saving time\b/gi, href: '/blog/why-time-differences-change' },
      { pattern: /\btime zones\b/gi, href: '/blog/what-is-a-time-zone' },
      { pattern: /\btime zone\b/gi, href: '/blog/what-is-a-time-zone' },
      { pattern: /\bUTC\b(?!\)|")/g, href: '/blog/what-is-utc' },
      { pattern: /\bDST\b(?!\)|")/g, href: '/blog/why-time-differences-change' },
    ];

    let parts: (string | React.ReactElement)[] = [text];
    let linkKeyCounter = 0;

    // Process patterns one at a time, but skip already linked text
    linkPatterns.forEach(({ pattern, href }) => {
      const newParts: (string | React.ReactElement)[] = [];
      
      parts.forEach((part) => {
        if (typeof part === 'string') {
          const matches = Array.from(part.matchAll(pattern));
          if (matches.length === 0) {
            newParts.push(part);
          } else {
            let lastIndex = 0;
            matches.forEach((match) => {
              if (match.index !== undefined) {
                // Add text before match
                if (match.index > lastIndex) {
                  newParts.push(part.substring(lastIndex, match.index));
                }
                // Add link
                newParts.push(
                  <Link key={`link-${linkKeyCounter++}`} href={href} className={blogStyles.contentLink}>
                    {match[0]}
                  </Link>
                );
                lastIndex = match.index + match[0].length;
              }
            });
            // Add remaining text
            if (lastIndex < part.length) {
              newParts.push(part.substring(lastIndex));
            }
          }
        } else {
          // Skip React elements (already linked)
          newParts.push(part);
        }
      });
      
      parts = newParts;
    });

    return parts;
  };

  // Simple markdown-like parser for content
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactElement[] = [];
    let currentParagraph: string[] = [];
    let listItems: string[] = [];
    let inList = false;
    let currentHeading: { level: number; text: string } | null = null;

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const paragraph = currentParagraph.join(' ').trim();
        if (paragraph) {
          const linkedContent = addInternalLinks(paragraph);
          elements.push(
            <p key={`p-${elements.length}`} style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
              {linkedContent.map((part, i) => {
                if (typeof part === 'string') {
                  return part.split(/\*\*(.*?)\*\*/g).map((subPart, j) => 
                    j % 2 === 1 ? <strong key={`${i}-${j}`} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{subPart}</strong> : subPart
                  );
                }
                return part;
              })}
            </p>
          );
        }
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`ul-${elements.length}`} style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.8', margin: '0 0 16px 0', paddingLeft: '24px' }}>
            {listItems.map((item, i) => (
              <li key={i} style={{ marginBottom: '8px' }}>
                {item.split(/\*\*(.*?)\*\*/g).map((part, j) => 
                  j % 2 === 1 ? <strong key={j} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part}</strong> : part
                )}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      
      // Heading
      if (trimmed.startsWith('### ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h3 key={`h3-${elements.length}`} style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '24px', marginBottom: '12px' }}>
            {trimmed.substring(4)}
          </h3>
        );
        return;
      }

      if (trimmed.startsWith('## ')) {
        flushParagraph();
        flushList();
        elements.push(
          <h2 key={`h2-${elements.length}`} style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '32px', marginBottom: '16px' }}>
            {trimmed.substring(3)}
          </h2>
        );
        return;
      }

      // List item
      if (trimmed.startsWith('- ')) {
        flushParagraph();
        if (!inList) flushList();
        inList = true;
        listItems.push(trimmed.substring(2));
        return;
      }

      // Empty line
      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      // Regular paragraph
      if (inList) {
        flushList();
      }
      currentParagraph.push(trimmed);
    });

    flushParagraph();
    flushList();

    return elements;
  };

  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={blogStyles.content}>
        <div className={ui.card}>
          <div className={`${ui.cardBody} ${blogStyles.contentBody}`}>
            <div style={{ marginBottom: '24px' }}>
              <Link 
                href="/blog" 
                className={blogStyles.backLink}
              >
                <span className={blogStyles.backArrow}>←</span>
                <span>Back to Blog</span>
              </Link>
            </div>

            <header style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--border-color)' }}>
              <h1 className={ui.title} style={{ fontSize: '32px', marginBottom: '12px', lineHeight: '1.2' }}>
                {post.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </header>

            <article className={blogStyles.articleContent}>
              {post.content ? parseContent(post.content) : null}
            </article>

            {/* Tools Section */}
            <div className={blogStyles.toolsSection}>
              <h2 className={blogStyles.toolsTitle}>Timezio Tools</h2>
              <div className={blogStyles.toolsGrid}>
                <Link href="/explore" className={blogStyles.toolLink}>
                  <div className={blogStyles.toolLinkTitle}>Explore Globe</div>
                  <div className={blogStyles.toolLinkDescription}>Click anywhere on the interactive globe to see local time</div>
                </Link>
                <Link href="/compare" className={blogStyles.toolLink}>
                  <div className={blogStyles.toolLinkTitle}>Compare Time Zones</div>
                  <div className={blogStyles.toolLinkDescription}>Compare time differences between multiple cities</div>
                </Link>
                <Link href="/planner" className={blogStyles.toolLink}>
                  <div className={blogStyles.toolLinkTitle}>Meeting Planner</div>
                  <div className={blogStyles.toolLinkDescription}>Find the best meeting time for people in different locations</div>
                </Link>
                <Link href="/dst" className={blogStyles.toolLink}>
                  <div className={blogStyles.toolLinkTitle}>DST Tracker</div>
                  <div className={blogStyles.toolLinkDescription}>Track daylight saving time changes and transitions</div>
                </Link>
                <Link href="/time-zone-converter" className={blogStyles.toolLink}>
                  <div className={blogStyles.toolLinkTitle}>Time Converter</div>
                  <div className={blogStyles.toolLinkDescription}>Convert UTC or local times between time zones</div>
                </Link>
              </div>
            </div>

            {/* Related Posts Section */}
            {getRelatedPosts().length > 0 && (
              <div className={blogStyles.relatedSection}>
                <h2 className={blogStyles.relatedTitle}>Related Articles</h2>
                <div className={blogStyles.relatedGrid}>
                  {getRelatedPosts().map((relatedPost) => (
                    <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className={blogStyles.relatedCard}>
                      <h3 className={blogStyles.relatedCardTitle}>{relatedPost.title}</h3>
                      <p className={blogStyles.relatedCardExcerpt}>{relatedPost.excerpt}</p>
                      <div className={blogStyles.relatedCardMeta}>
                        <time dateTime={relatedPost.date}>
                          {new Date(relatedPost.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </time>
                        <span>•</span>
                        <span>{relatedPost.readTime}</span>
                      </div>
                      <span className={blogStyles.relatedCardCta}>Read more →</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
              <Link 
                href="/blog" 
                className={`${ui.btnPrimary} ${blogStyles.backButton}`}
              >
                <span className={blogStyles.backButtonArrow}>←</span>
                <span>Back to Blog</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}


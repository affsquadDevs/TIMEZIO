import React from 'react';
import { notFound } from 'next/navigation';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import blogStyles from '../blog.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import { blogPosts, blogPostsMap } from '@/data/blogPosts';
import Link from 'next/link';

type Params = { slug: string };

export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

// Add internal links to text (simple version - avoids nested links)
function addInternalLinks(text: string): (string | React.ReactElement)[] {
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
              if (match.index > lastIndex) {
                newParts.push(part.substring(lastIndex, match.index));
              }
              newParts.push(
                <Link key={`link-${linkKeyCounter++}`} href={href} className={blogStyles.contentLink}>
                  {match[0]}
                </Link>
              );
              lastIndex = match.index + match[0].length;
            }
          });
          if (lastIndex < part.length) {
            newParts.push(part.substring(lastIndex));
          }
        }
      } else {
        newParts.push(part);
      }
    });

    parts = newParts;
  });

  return parts;
}

// Simple markdown-like parser for content
function parseContent(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactElement[] = [];
  let currentParagraph: string[] = [];
  let listItems: string[] = [];
  let inList = false;

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

    if (trimmed.startsWith('- ')) {
      flushParagraph();
      if (!inList) flushList();
      inList = true;
      listItems.push(trimmed.substring(2));
      return;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      return;
    }

    if (inList) {
      flushList();
    }
    currentParagraph.push(trimmed);
  });

  flushParagraph();
  flushList();

  return elements;
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = blogPostsMap[slug];
  if (!post) notFound();

  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={blogStyles.content}>
        <div className={ui.card}>
          <div className={`${ui.cardBody} ${blogStyles.contentBody}`}>
            <div style={{ marginBottom: '24px' }}>
              <Link href="/blog" className={blogStyles.backLink}>
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
                  {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                <span>•</span>
                <span>{post.readTime}</span>
                <span>•</span>
                <span>By the Timezio team</span>
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
            {relatedPosts.length > 0 && (
              <div className={blogStyles.relatedSection}>
                <h2 className={blogStyles.relatedTitle}>Related Articles</h2>
                <div className={blogStyles.relatedGrid}>
                  {relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className={blogStyles.relatedCard}>
                      <h3 className={blogStyles.relatedCardTitle}>{relatedPost.title}</h3>
                      <p className={blogStyles.relatedCardExcerpt}>{relatedPost.excerpt}</p>
                      <div className={blogStyles.relatedCardMeta}>
                        <time dateTime={relatedPost.date}>
                          {new Date(relatedPost.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
              <Link href="/blog" className={`${ui.btnPrimary} ${blogStyles.backButton}`}>
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

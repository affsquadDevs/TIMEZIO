'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import blogStyles from '../blog.module.css';
import { TopBar } from '@/components/layout/TopBar';
import { Footer } from '@/components/layout/Footer';
import { blogPostsMap } from '@/data/blogPosts';
import Link from 'next/link';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = blogPostsMap[slug];

  useEffect(() => {
    if (!post) return;

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

    // Add article structured data
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      datePublished: post.date,
      dateModified: post.date,
      author: {
        '@type': 'Organization',
        name: 'Timezio',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Timezio',
      },
    };

    const breadcrumbScriptId = 'breadcrumb-schema';
    const articleScriptId = 'article-schema';
    
    // Remove existing scripts
    [breadcrumbScriptId, articleScriptId].forEach(id => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    // Add breadcrumb schema
    const breadcrumbScript = document.createElement('script');
    breadcrumbScript.id = breadcrumbScriptId;
    breadcrumbScript.type = 'application/ld+json';
    breadcrumbScript.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(breadcrumbScript);

    // Add article schema
    const articleScript = document.createElement('script');
    articleScript.id = articleScriptId;
    articleScript.type = 'application/ld+json';
    articleScript.text = JSON.stringify(articleSchema);
    document.head.appendChild(articleScript);

    return () => {
      [breadcrumbScriptId, articleScriptId].forEach(id => {
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
          elements.push(
            <p key={`p-${elements.length}`} style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '16px' }}>
              {paragraph.split(/\*\*(.*?)\*\*/g).map((part, i) => 
                i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part}</strong> : part
              )}
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


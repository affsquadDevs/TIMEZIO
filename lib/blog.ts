import { blogPosts, blogPostsMap, type BlogPost } from '@/data/blogPosts';
import { defaultLocale } from '@/i18n/routing';

// Per-locale blog translations: slug -> { title, excerpt, content, readTime }.
// Files live in data/blog/<locale>.json and are filled by the translation step;
// any missing field (or whole post) falls back to the English source.
type BlogTranslations = Record<
  string,
  { title?: string; excerpt?: string; content?: string; readTime?: string }
>;

async function loadTranslations(locale: string): Promise<BlogTranslations> {
  if (locale === defaultLocale) return {};
  try {
    return ((await import(`../data/blog/${locale}.json`)).default ?? {}) as BlogTranslations;
  } catch {
    return {};
  }
}

function merge(post: BlogPost, tr: BlogTranslations): BlogPost {
  const t = tr[post.slug];
  if (!t) return post;
  return {
    ...post,
    title: t.title ?? post.title,
    excerpt: t.excerpt ?? post.excerpt,
    content: t.content ?? post.content,
    readTime: t.readTime ?? post.readTime,
  };
}

export async function getAllPosts(locale: string): Promise<BlogPost[]> {
  const tr = await loadTranslations(locale);
  return blogPosts.map((p) => merge(p, tr));
}

export async function getPost(locale: string, slug: string): Promise<BlogPost | undefined> {
  const base = blogPostsMap[slug];
  if (!base) return undefined;
  const tr = await loadTranslations(locale);
  return merge(base, tr);
}

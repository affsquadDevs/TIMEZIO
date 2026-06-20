import type { Metadata } from 'next';
import { locales, defaultLocale, type Locale } from '@/i18n/routing';
import { LOCALE_META } from '@/i18n/locales';
import { SITE_NAME, OG_IMAGE } from '@/lib/site';

// Build the site-relative path for a given locale. English (default) has no
// prefix; every other locale is prefixed, e.g. /de, /de/about.
export function localizedPath(locale: Locale, path: string): string {
  const p = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  if (locale === defaultLocale) return p || '/';
  return `/${locale}${p}` || `/${locale}`;
}

// canonical + hreflang alternates (incl. x-default → English) for a route.
// `path` is the locale-agnostic path, e.g. '/' or '/time/new-york'.
export function buildAlternates(locale: Locale, path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[LOCALE_META[l].hreflang] = localizedPath(l, path);
  }
  languages['x-default'] = localizedPath(defaultLocale, path);
  return { canonical: localizedPath(locale, path), languages };
}

// Build a full Metadata object for a page: translated title/description +
// canonical + hreflang alternates + OpenGraph/Twitter + robots. Relative URLs
// resolve against metadataBase (set once in the [locale] root layout).
export function pageMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  index?: boolean;
  type?: 'website' | 'article';
  publishedTime?: string;
}): Metadata {
  const alt =
    opts.index === false
      ? { canonical: localizedPath(opts.locale, opts.path) }
      : buildAlternates(opts.locale, opts.path);
  const robots =
    opts.index === false
      ? { index: false, follow: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' as const, 'max-snippet': -1 } };
  return {
    title: opts.title,
    description: opts.description,
    alternates: alt,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: alt.canonical,
      siteName: SITE_NAME,
      type: opts.type ?? 'website',
      locale: OG_LOCALE[opts.locale],
      ...(opts.type === 'article' && opts.publishedTime
        ? { publishedTime: opts.publishedTime, modifiedTime: opts.publishedTime }
        : {}),
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: { card: 'summary_large_image', title: opts.title, description: opts.description, images: [OG_IMAGE] },
    robots,
  };
}

// hreflang language map (absolute URLs) for a sitemap entry's alternates.
export function sitemapLanguages(path: string, siteUrl: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[LOCALE_META[l].hreflang] = `${siteUrl}${localizedPath(l, path)}`;
  return languages;
}

// OpenGraph locale codes (BCP47-ish, region-qualified).
export const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  pl: 'pl_PL',
  es: 'es_ES',
  pt: 'pt_PT',
  fr: 'fr_FR',
  it: 'it_IT',
  de: 'de_DE',
  uk: 'uk_UA',
  sv: 'sv_SE',
  cs: 'cs_CZ',
  el: 'el_GR',
};

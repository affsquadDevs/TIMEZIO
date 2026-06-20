import { locales, defaultLocale, type Locale } from '@/i18n/routing';
import { LOCALE_META } from '@/i18n/locales';

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

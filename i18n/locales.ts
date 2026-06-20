import type { Locale } from './routing';

// Native display names + hreflang codes for the language switcher and for the
// <link rel="alternate" hreflang> tags. hreflang uses the same ISO 639-1 codes.
export const LOCALE_META: Record<Locale, { native: string; english: string; hreflang: string }> = {
  en: { native: 'English', english: 'English', hreflang: 'en' },
  pl: { native: 'Polski', english: 'Polish', hreflang: 'pl' },
  es: { native: 'Español', english: 'Spanish', hreflang: 'es' },
  pt: { native: 'Português', english: 'Portuguese', hreflang: 'pt' },
  fr: { native: 'Français', english: 'French', hreflang: 'fr' },
  it: { native: 'Italiano', english: 'Italian', hreflang: 'it' },
  de: { native: 'Deutsch', english: 'German', hreflang: 'de' },
  uk: { native: 'Українська', english: 'Ukrainian', hreflang: 'uk' },
  sv: { native: 'Svenska', english: 'Swedish', hreflang: 'sv' },
  cs: { native: 'Čeština', english: 'Czech', hreflang: 'cs' },
  el: { native: 'Ελληνικά', english: 'Greek', hreflang: 'el' },
};

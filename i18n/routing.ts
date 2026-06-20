import { defineRouting } from 'next-intl/routing';

// English is the default and is served at the root (no prefix). The other
// locales are served under their prefix, e.g. /de, /pl, /es. Note the correct
// ISO 639-1 codes: Ukrainian = "uk" (not "ua") and Czech = "cs" (not "cz").
export const locales = ['en', 'pl', 'es', 'pt', 'fr', 'it', 'de', 'uk', 'sv', 'cs', 'el'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Default locale (en) has no prefix; every other locale is prefixed.
  localePrefix: 'as-needed',
  // We emit our own <link rel="alternate" hreflang> tags in generateMetadata.
  alternateLinks: false,
});

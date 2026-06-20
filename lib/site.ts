// Centralized site constants. Single source of truth for the canonical host so
// canonical tags, sitemap, robots, and JSON-LD never drift apart.
// The production site is served on the www host (apex 301s to www), so www is canonical.
export const SITE_URL = 'https://www.timezio.com';
export const SITE_NAME = 'Timezio';
export const SITE_LOGO = `${SITE_URL}/logo.png`;
export const OG_IMAGE = `${SITE_URL}/og-image.png`;

// Contact + operator identity (E-E-A-T / AdSense trust signals).
export const CONTACT_EMAIL = 'hello@timezio.com';
export const OPERATOR_NAME = 'AffSquad';
export const OPERATOR_DESC =
  'Timezio is built and operated by AffSquad, an independent studio that makes free, privacy-respecting web utilities.';

/** Absolute URL for a site-relative path. */
export const abs = (path: string): string =>
  path.startsWith('http') ? path : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Run on every path EXCEPT:
  //  - /api/*            (route handlers)
  //  - /_next, /_vercel  (framework internals)
  //  - anything with a "." (static files, sitemap.xml, robots.txt, ads.txt,
  //    og-image.png, logo.png, the Google verification .html, favicon, etc.)
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import "../globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_URL, SITE_NAME, SITE_LOGO, OG_IMAGE, CONTACT_EMAIL } from "@/lib/site";
import { routing, type Locale } from "@/i18n/routing";
import { locales } from "@/i18n/routing";
import { LOCALE_META } from "@/i18n/locales";
import { buildAlternates, OG_LOCALE } from "@/lib/i18nMeta";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const brandFont = Space_Grotesk({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const lc = locale as Locale;
  const alt = buildAlternates(lc, "/");
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Timezio – Time Zone Converter & Meeting Planner",
      template: `%s | ${SITE_NAME}`,
    },
    description:
      "Instant time zone converter, world clock, DST-aware meeting planner, and timezone comparison on an interactive globe.",
    icons: { icon: "/icon.ico", shortcut: "/icon.ico" },
    applicationName: SITE_NAME,
    alternates: alt,
    openGraph: {
      title: "Timezio – Time Zone Converter & Meeting Planner",
      description:
        "Convert time zones, plan meetings across cities, and explore daylight saving time on a 3D globe.",
      url: alt.canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: OG_LOCALE[lc],
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Timezio – time zone converter & meeting planner" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Timezio – Time Zone Converter & Meeting Planner",
      description:
        "DST-aware time zone converter, world clock, and meeting planner on an interactive globe.",
      site: "@timezio",
      creator: "@timezio",
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: locales.map((l) => LOCALE_META[l].hreflang),
};

const softwareLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  description:
    "Time zone converter, meeting planner, and world clock on an interactive globe with DST-aware data.",
  operatingSystem: "All",
  creator: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  image: OG_IMAGE,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", url: SITE_URL },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: SITE_LOGO,
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: CONTACT_EMAIL,
      availableLanguage: locales.map((l) => LOCALE_META[l].hreflang),
    },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{const raw=localStorage.getItem('timezio-store');const parsed=raw?JSON.parse(raw):null;const theme=parsed?.state?.theme||'dark';document.documentElement.setAttribute('data-theme',theme);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
        {/* Google Consent Mode v2 — default to denied before any tag loads. */}
        <script
          id="consent-default"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}var c='denied';try{if(localStorage.getItem('timezio-consent')==='granted')c='granted';}catch(e){}gtag('consent','default',{ad_storage:c,ad_user_data:c,ad_personalization:c,analytics_storage:c,functionality_storage:'granted',security_storage:'granted',wait_for_update:500});gtag('set','url_passthrough',true);`,
          }}
        />
        <JsonLd data={websiteLd} id="ld-website" />
        <JsonLd data={softwareLd} id="ld-software" />
        <JsonLd data={organizationLd} id="ld-organization" />
        {/* AdSense loader in initial HTML so review/crawl see the publisher tag. */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2980943706375055"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${brandFont.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NBPPQRXS"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NBPPQRXS');`}
        </Script>
        {/* End Google Tag Manager */}

        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <ToastProvider>
              {children}
              <ConsentBanner />
            </ToastProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brandFont = Space_Grotesk({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://timezio.com"),
  title: {
    default: "Timezio – Time Zone Converter & Meeting Planner",
    template: "%s | Timezio",
  },
  description:
    "Instant time zone converter, world clock, DST-aware meeting planner, and timezone comparison on an interactive globe.",
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
  },
  keywords: [
    "time zone converter",
    "world clock",
    "meeting planner",
    "DST",
    "daylight saving time",
    "UTC converter",
    "timezone map",
    "time difference calculator",
    "international meeting planner",
    "remote work scheduling",
  ],
  applicationName: "Timezio",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Timezio – Time Zone Converter & Meeting Planner",
    description:
      "Convert time zones, plan meetings across cities, and explore daylight saving time on a 3D globe.",
    url: "https://timezio.com",
    siteName: "Timezio",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Timezio – Time Zone Converter & Meeting Planner",
    description:
      "DST-aware time zone converter, world clock, and meeting planner on an interactive globe.",
    site: "@timezio",
    creator: "@timezio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'last-modified': new Date().toISOString(),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{const raw=localStorage.getItem('timezio-store');const parsed=raw?JSON.parse(raw):null;const theme=parsed?.state?.theme||'dark';document.documentElement.setAttribute('data-theme',theme);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`,
          }}
        />
        <script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Timezio',
              url: 'https://timezio.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://timezio.com/?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      <script
        id="ld-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Timezio',
            url: 'https://timezio.com',
            applicationCategory: 'BusinessApplication',
            description:
              'Time zone converter, meeting planner, and world clock on an interactive globe with DST-aware data.',
            operatingSystem: 'All',
            creator: {
              '@type': 'Organization',
              name: 'Timezio',
              url: 'https://timezio.com',
            },
            screenshot: 'https://timezio.com/globe.svg',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              url: 'https://timezio.com',
            },
          }),
        }}
      />
      <link rel="preload" href="/globe.svg" as="image" />
      <script
        id="ld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Timezio',
            url: 'https://timezio.com',
            logo: 'https://timezio.com/globe.svg',
            contactPoint: [
              {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: 'hello@affsquad.com',
                availableLanguage: ['en'],
              },
            ],
          }),
        }}
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

        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2980943706375055"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ThemeProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

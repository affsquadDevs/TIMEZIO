'use client';

import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AppShell } from "@/components/layout/AppShell";

export default function ExplorePage() {
  const heading = "Explore Time Zones";
  const description =
    "Pick any point on the globe to see the local time, UTC offset, and daylight saving status. Use Explore to understand where time changes across borders.";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Explore", url: "/explore" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: heading,
    description,
    url: "https://timezio.com/explore",
    inLanguage: "en-US",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: toBreadcrumbList(breadcrumbs),
    },
    publisher: {
      "@type": "Organization",
      name: "Timezio",
      url: "https://timezio.com",
      logo: { "@type": "ImageObject", url: "https://timezio.com/globe.svg" },
    },
  };

  return (
    <>
      <SEOHead structuredData={structuredData} id="explore-schema" />
      <BreadcrumbSchema items={breadcrumbs} />
      <AppShell
        defaultTab="explore"
        heading={heading}
        description={description}
        ctas={[
          { href: "/time", label: "Current time in major cities" },
          { href: "/convert", label: "Popular time zone converters" },
          { href: "/dst", label: "Daylight saving time checker" },
        ]}
      />
    </>
  );
}

function toBreadcrumbList(items: Array<{ name: string; url: string }>) {
  return items.map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: item.name,
    item: item.url.startsWith("http") ? item.url : `https://timezio.com${item.url}`,
  }));
}



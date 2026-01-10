'use client';

import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AppShell } from "@/components/layout/AppShell";

export default function ComparePage() {
  const heading = "Compare Time Zones";
  const description =
    "Compare multiple time zones side-by-side with DST-aware offsets. Add cities, choose a base location, and verify the time difference before you schedule.";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: heading,
    description,
    url: "https://timezio.com/compare",
    inLanguage: "en-US",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: understandBreadcrumbs(breadcrumbs),
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
      <SEOHead structuredData={structuredData} id="compare-schema" />
      <BreadcrumbSchema items={breadcrumbs} />
      <AppShell
        defaultTab="compare"
        heading={heading}
        description={description}
        ctas={[
          { href: "/convert", label: "Popular time zone converters" },
          { href: "/meeting", label: "Best meeting times by city pair" },
          { href: "/dst", label: "Daylight saving time checker" },
        ]}
      />
    </>
  );
}

function understandBreadcrumbs(items: Array<{ name: string; url: string }>) {
  return items.map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: item.name,
    item: item.url.startsWith("http") ? item.url : `https://timezio.com${item.url}`,
  }));
}



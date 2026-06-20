'use client';

import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AppShell } from "@/components/layout/AppShell";

export default function SavedPage() {
  const heading = "Saved";
  const description =
    "Save your frequently used locations so you can return instantly to their current time, offset, and daylight saving status.";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Saved", url: "/saved" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: heading,
    description,
    url: "https://www.timezio.com/saved",
    inLanguage: "en-US",
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: toBreadcrumbList(breadcrumbs),
    },
    publisher: {
      "@type": "Organization",
      name: "Timezio",
      url: "https://www.timezio.com",
      logo: { "@type": "ImageObject", url: "https://www.timezio.com/og-image.png" },
    },
  };

  return (
    <>
      <SEOHead structuredData={structuredData} id="saved-schema" />
      <BreadcrumbSchema items={breadcrumbs} />
      <AppShell
        defaultTab="saved"
        heading={heading}
        description={description}
        ctas={[
          { href: "/explore", label: "Explore time zones" },
          { href: "/compare", label: "Compare time zones" },
          { href: "/planner", label: "Plan a meeting across time zones" },
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
    item: item.url.startsWith("http") ? item.url : `https://www.timezio.com${item.url}`,
  }));
}



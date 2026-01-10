'use client';

import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AppShell } from "@/components/layout/AppShell";

export default function PlannerPage() {
  const heading = "Meeting Planner";
  const description =
    "Plan meetings across multiple time zones. Add participants, set working hours, and find overlap windows automatically — fully DST-aware.";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Planner", url: "/planner" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: heading,
    description,
    url: "https://timezio.com/planner",
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
      <SEOHead structuredData={structuredData} id="planner-schema" />
      <BreadcrumbSchema items={breadcrumbs} />
      <AppShell
        defaultTab="planner"
        heading={heading}
        description={description}
        ctas={[
          { href: "/meeting", label: "Best meeting times by city pair" },
          { href: "/compare", label: "Compare time zones" },
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



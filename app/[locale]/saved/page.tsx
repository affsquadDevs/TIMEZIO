'use client';

import { useTranslations } from "next-intl";
import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AppShell } from "@/components/layout/AppShell";
import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/site";

const CTA_HREFS = ["/explore", "/compare", "/planner"];

export default function SavedPage() {
  const t = useTranslations("pages.saved");
  const tc = useTranslations("common");
  const heading = t("heading");
  const description = t("description");
  const ctaLabels = t.raw("ctas") as string[];

  const breadcrumbs = [
    { name: tc("breadcrumbHome"), url: "/" },
    { name: t("breadcrumb"), url: "/saved" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: heading,
    description,
    url: `${SITE_URL}/saved`,
    breadcrumb: { "@type": "BreadcrumbList", itemListElement: toBreadcrumbList(breadcrumbs) },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: SITE_LOGO },
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
        ctas={ctaLabels.map((label, i) => ({ href: CTA_HREFS[i], label }))}
      />
    </>
  );
}

function toBreadcrumbList(items: Array<{ name: string; url: string }>) {
  return items.map((item, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: item.name,
    item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
  }));
}

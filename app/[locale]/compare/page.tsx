'use client';

import { useTranslations } from "next-intl";
import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AppShell } from "@/components/layout/AppShell";
import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/site";

const CTA_HREFS = ["/convert", "/meeting", "/dst"];

export default function ComparePage() {
  const t = useTranslations("pages.compare");
  const tc = useTranslations("common");
  const heading = t("heading");
  const description = t("description");
  const ctaLabels = t.raw("ctas") as string[];
  const paragraphs = t.raw("articleParagraphs") as string[];

  const breadcrumbs = [
    { name: tc("breadcrumbHome"), url: "/" },
    { name: t("breadcrumb"), url: "/compare" },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: heading,
    description,
    url: `${SITE_URL}/compare`,
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
      <SEOHead structuredData={structuredData} id="compare-schema" />
      <BreadcrumbSchema items={breadcrumbs} />
      <AppShell
        defaultTab="compare"
        heading={heading}
        description={description}
        ctas={ctaLabels.map((label, i) => ({ href: CTA_HREFS[i], label }))}
        article={
          <>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
              {t("articleH2")}
            </h2>
            {paragraphs.map((p, i) => (
              <p key={i} style={{ margin: i < paragraphs.length - 1 ? "0 0 12px" : 0 }}>{p}</p>
            ))}
          </>
        }
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

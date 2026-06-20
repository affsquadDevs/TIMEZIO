'use client';

import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AppShell } from "@/components/layout/AppShell";
import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/site";

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
    url: `${SITE_URL}/compare`,
    inLanguage: "en-US",
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
        ctas={[
          { href: "/convert", label: "Popular time zone converters" },
          { href: "/meeting", label: "Best meeting times by city pair" },
          { href: "/dst", label: "Daylight saving time checker" },
        ]}
        article={
          <>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
              Compare several cities at once
            </h2>
            <p style={{ margin: "0 0 12px" }}>
              Add up to six cities and Timezio lines up their current local times in a single view. Pick one as the
              &ldquo;base&rdquo; and every other city shows its difference relative to it, so you can answer questions like
              &ldquo;when it&rsquo;s 9:00 AM in Berlin, what time is it in New York and Singapore?&rdquo; at a glance. The
              offsets are calculated from official IANA data and update in real time, including the one-hour shifts that
              happen when a region enters or leaves daylight saving time.
            </p>
            <p style={{ margin: "0 0 12px" }}>
              Comparing is most useful when the difference isn&rsquo;t obvious. Many country pairs sit a fractional number
              of hours apart, and several change their clocks on different weekends, so the gap between two cities can be
              nine hours one month and ten the next. Lining the cities up side by side catches those edge cases before they
              turn into a missed call. For a date in the future, change the date and the comparison recalculates with the
              correct DST rules for that day.
            </p>
            <p style={{ margin: 0 }}>
              When you&rsquo;ve confirmed the difference, copy the share link to send the exact comparison to your team, or
              move the same set of cities into the Planner to find a meeting slot that works for everyone.
            </p>
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

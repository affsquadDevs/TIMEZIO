'use client';

import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AppShell } from "@/components/layout/AppShell";
import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/site";

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
    url: `${SITE_URL}/explore`,
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
        article={
          <>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
              How to explore the globe
            </h2>
            <p style={{ margin: "0 0 12px" }}>
              The interactive 3D globe turns time zones into something you can see rather than calculate. Click any
              location and Timezio reads its exact latitude and longitude, looks up the matching IANA time zone, and shows
              the current local time, the UTC offset, and whether daylight saving time is currently in effect. Because the
              data comes from the official IANA time zone database, it covers the awkward cases too — half-hour offsets
              like India (UTC+5:30), 45-minute offsets like Nepal, and regions that change their clocks on different dates.
            </p>
            <p style={{ margin: "0 0 12px" }}>
              Explore is the quickest way to answer &ldquo;what time is it there right now?&rdquo; without typing a city
              name. Spin the globe to a continent, click a coastline, and read the time instantly. When you want to line up
              several places at once, switch to Compare; when you need to find a slot that works for a team, jump to the
              Planner. Every view stays in sync, so a city you click here is ready to compare or schedule with one tap.
            </p>
            <p style={{ margin: 0 }}>
              Time zones are political as much as geographic — borders, exceptions, and seasonal rules all shift the clock.
              Seeing them on a globe makes those boundaries obvious, which is why Explore is a good starting point before
              you convert a specific time or book an international call.
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

'use client';

import { SEOHead } from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { AppShell } from "@/components/layout/AppShell";
import { SITE_URL, SITE_NAME, SITE_LOGO } from "@/lib/site";

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
    url: `${SITE_URL}/planner`,
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
        article={
          <>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>
              Find a time that works for everyone
            </h2>
            <p style={{ margin: "0 0 12px" }}>
              Add each participant by city, set their working hours, and the planner overlays every schedule to surface the
              windows when everyone is available. Instead of mentally juggling offsets, you get a ranked list of slots that
              fall inside each person&rsquo;s working day, with early-morning and late-night times de-prioritized so nobody
              has to take a 6 a.m. call. Every calculation is daylight-saving aware, so a slot that works this week still
              works after a region changes its clocks.
            </p>
            <p style={{ margin: "0 0 12px" }}>
              The planner is built for distributed teams, client calls across continents, and catching up with friends or
              family abroad. Set a meeting duration, choose a date, and adjust each participant&rsquo;s hours if they work
              an unusual shift. You can also widen the search when there is no clean overlap — a common situation for pairs
              that are ten or more hours apart, where someone has to take an edge slot. For Google Calendar invites and Meet
              links, connect your account in the planner and confirm a slot.
            </p>
            <p style={{ margin: 0 }}>
              Already know the two cities? The pre-built{" "}
              <span style={{ fontWeight: 600 }}>best-meeting-time</span> pages show the overlap for popular pairs without
              any setup.
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

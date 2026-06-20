import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import citiesData from "@/data/cities.top200.json";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Current Time in Major Cities Worldwide",
  description:
    "Check the current local time in cities around the world. Each page shows live local time, UTC offset, time zone, and daylight saving status — DST-aware and updated in real time.",
  alternates: { canonical: "/time" },
  openGraph: {
    title: "Current Time in Major Cities Worldwide | Timezio",
    description: "See the current local time, UTC offset, and DST status for cities around the world.",
    url: `${SITE_URL}/time`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "World clock on Timezio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Current Time in Major Cities Worldwide | Timezio",
    description: "Check local time in cities worldwide, DST-aware.",
    images: [OG_IMAGE],
  },
};

type CityRow = { id: string; label: string };

export default function TimeHubPage() {
  const cities = (citiesData as CityRow[])
    .map((c) => ({ slug: c.id.replace(/_/g, "-"), label: c.label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={styles.main}>
        <div className={ui.card} style={{ width: "100%" }}>
          <div className={ui.cardBody}>
            <h1 className={ui.title} style={{ marginBottom: "12px" }}>
              Current Time in Major Cities Worldwide
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.7 }}>
              Pick a city to see its current local time, the exact UTC offset, the IANA time zone it uses, and whether
              daylight saving time is in effect right now. Every page updates in real time and is calculated from the
              official IANA time zone database, so the awkward cases — half-hour offsets, regions that change clocks on
              different dates, and places that don&rsquo;t observe DST at all — are handled correctly.
            </p>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.7 }}>
              These world-clock pages are the quickest way to check &ldquo;what time is it there?&rdquo; before you call,
              travel, or schedule. To convert a specific time between two places use the{" "}
              <Link href="/convert" className={ui.link}>converters</Link>, to line up several cities use{" "}
              <Link href="/compare" className={ui.link}>Compare</Link>, and to find a slot that works for a group use the{" "}
              <Link href="/planner" className={ui.link}>Meeting Planner</Link>.
            </p>
            <div className={ui.divider} />
            <h2 className={ui.title} style={{ fontSize: "18px", margin: "8px 0 12px" }}>
              Cities ({cities.length})
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "10px",
              }}
            >
              {cities.map((city) => (
                <li key={city.slug}>
                  <Link href={`/time/${city.slug}`} className={ui.link}>
                    {city.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

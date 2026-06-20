import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { popularConverters } from "@/data/seoLinks";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Popular Time Zone Converters",
  description:
    "Convert time between zones instantly: PST to EST, UTC to EST, GMT to EST, CET to EST, IST to EST and more. Each converter is DST-aware and shows a full hour-by-hour table.",
  alternates: { canonical: "/convert" },
  openGraph: {
    title: "Popular Time Zone Converters | Timezio",
    description: "Instant, DST-aware converters for PST↔EST, UTC↔EST, GMT↔EST, CET↔EST, IST↔EST.",
    url: `${SITE_URL}/convert`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Time zone converters on Timezio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Popular Time Zone Converters | Timezio",
    description: "Instant converters for PST↔EST, UTC↔EST, GMT↔EST, CET↔EST, IST↔EST.",
    images: [OG_IMAGE],
  },
};

export default function ConvertHubPage() {
  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={styles.main}>
        <div className={ui.card} style={{ width: "100%" }}>
          <div className={ui.cardBody}>
            <h1 className={ui.title} style={{ marginBottom: "12px" }}>
              Popular Time Zone Converters
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.7 }}>
              A time zone converter answers a deceptively tricky question: when it&rsquo;s a given time in one place, what
              time is it somewhere else? The catch is that the gap between two zones isn&rsquo;t fixed. Daylight saving time
              shifts it by an hour, the two regions often change their clocks on different weekends, and some zones sit a
              fractional number of hours apart. Each converter below uses official IANA data, so the result is correct on
              any date — including the weeks around a clock change when manual math usually goes wrong.
            </p>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.7 }}>
              Every converter page includes a full hour-by-hour table for the current day, the live offset between the two
              zones, and notes on which side observes daylight saving time. Need to check a city rather than an
              abbreviation? Browse the{" "}
              <Link href="/time" className={ui.link}>world clock</Link>, or jump to{" "}
              <Link href="/compare" className={ui.link}>Compare</Link> to line up more than two places at once.
            </p>
            <div className={ui.divider} />
            <h2 className={ui.title} style={{ fontSize: "18px", margin: "8px 0 12px" }}>
              Converters
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
              {popularConverters.map((item) => (
                <li key={item.slug}>
                  <Link href={`/convert/${item.slug}`} className={ui.link}>
                    {item.label}
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

import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { popularCities } from "@/data/seoLinks";

export const metadata: Metadata = {
  title: "Current Time in Major Cities | Timezio",
  description: "Check current local time in popular cities worldwide. DST-aware and updated in real time.",
  alternates: { canonical: "/time" },
  openGraph: {
    title: "Current Time in Major Cities | Timezio",
    description: "See the current local time in major cities with DST awareness.",
    url: "https://timezio.com/time",
    siteName: "Timezio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Current Time in Major Cities | Timezio",
    description: "Check local time in popular cities worldwide, DST-aware.",
  },
};

export default function TimeHubPage() {
  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={styles.main}>
        <div className={ui.card} style={{ width: "100%" }}>
          <div className={ui.cardBody}>
            <h1 className={ui.title} style={{ marginBottom: "12px" }}>
              Current Time in Major Cities
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              Jump to a city to see the current local time, UTC offset, and daylight saving status.
            </p>
            <div className={ui.divider} />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
              {popularCities.map((city) => (
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


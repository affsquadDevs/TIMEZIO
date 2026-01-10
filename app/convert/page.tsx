import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { popularConverters } from "@/data/seoLinks";

export const metadata: Metadata = {
  title: "Popular Time Zone Converters | Timezio",
  description: "Convert time zones instantly. PST to EST, UTC to EST, GMT to EST, CET to EST, IST to EST and more.",
  alternates: { canonical: "/convert" },
  openGraph: {
    title: "Popular Time Zone Converters | Timezio",
    description: "Convert time zones instantly across popular pairs like PST↔EST, UTC↔EST, GMT↔EST.",
    url: "https://timezio.com/convert",
    siteName: "Timezio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Popular Time Zone Converters | Timezio",
    description: "Instant converters for PST↔EST, UTC↔EST, GMT↔EST, CET↔EST, IST↔EST.",
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
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              Jump to the most-used time zone conversions. Each converter is DST-aware and shows current offsets.
            </p>
            <div className={ui.divider} />
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


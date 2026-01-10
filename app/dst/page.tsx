import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { popularDst } from "@/data/seoLinks";

export const metadata: Metadata = {
  title: "Daylight Saving Time Checker | Timezio",
  description: "Track DST status and changes by country. See start and end dates for popular regions.",
  alternates: { canonical: "/dst" },
  openGraph: {
    title: "Daylight Saving Time Checker | Timezio",
    description: "DST status and change dates for popular regions.",
    url: "https://timezio.com/dst",
    siteName: "Timezio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daylight Saving Time Checker | Timezio",
    description: "Track DST start and end dates by country.",
  },
};

export default function DstHubPage() {
  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={styles.main}>
        <div className={ui.card} style={{ width: "100%" }}>
          <div className={ui.cardBody}>
            <h1 className={ui.title} style={{ marginBottom: "12px" }}>
              Daylight Saving Time by Country
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              Check whether a country is in DST right now and when clocks change next.
            </p>
            <div className={ui.divider} />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
              {popularDst.map((item) => (
                <li key={item.slug}>
                  <Link href={`/dst/${item.slug}`} className={ui.link}>
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


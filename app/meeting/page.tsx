import Link from "next/link";
import type { Metadata } from "next";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { popularMeetings } from "@/data/seoLinks";

export const metadata: Metadata = {
  title: "Best Meeting Times Across Time Zones | Timezio",
  description: "Find overlap hours for popular city pairs and plan meetings across time zones.",
  alternates: { canonical: "/meeting" },
  openGraph: {
    title: "Best Meeting Times Across Time Zones | Timezio",
    description: "Overlap windows for popular city pairs to schedule meetings easily.",
    url: "https://timezio.com/meeting",
    siteName: "Timezio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Meeting Times Across Time Zones | Timezio",
    description: "Find overlap hours for popular city pairs.",
  },
};

export default function MeetingHubPage() {
  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={styles.main}>
        <div className={ui.card} style={{ width: "100%" }}>
          <div className={ui.cardBody}>
            <h1 className={ui.title} style={{ marginBottom: "12px" }}>
              Best Meeting Times by City Pair
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              See overlap windows for common routes. Use the Planner tab above to fine-tune working hours per participant.
            </p>
            <div className={ui.divider} />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
              {popularMeetings.map((item) => (
                <li key={item.slug}>
                  <Link href={`/meeting/${item.slug}`} className={ui.link}>
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


import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { popularMeetings } from "@/data/seoLinks";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Best Meeting Times Across Time Zones",
  description: "Find overlapping working hours for popular city pairs. Each page shows a shared-hours table and the best slot, fully daylight-saving aware.",
  alternates: { canonical: "/meeting" },
  openGraph: {
    title: "Best Meeting Times Across Time Zones | Timezio",
    description: "Overlap windows for popular city pairs to schedule meetings easily.",
    url: `${SITE_URL}/meeting`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Meeting planner on Timezio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Meeting Times Across Time Zones | Timezio",
    description: "Find overlap hours for popular city pairs.",
    images: [OG_IMAGE],
  },
};

export default async function MeetingHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.meetingHub");

  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={styles.main}>
        <div className={ui.card} style={{ width: "100%" }}>
          <div className={ui.cardBody}>
            <h1 className={ui.title} style={{ marginBottom: "12px" }}>{t("title")}</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "12px", lineHeight: 1.7 }}>{t("intro1")}</p>
            <p style={{ color: "var(--text-secondary)", marginBottom: "20px", lineHeight: 1.7 }}>
              {t.rich("intro2", {
                planner: (c) => <Link href="/planner" className={ui.link}>{c}</Link>,
                compare: (c) => <Link href="/compare" className={ui.link}>{c}</Link>,
              })}
            </p>
            <div className={ui.divider} />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
              {popularMeetings.map((item) => (
                <li key={item.slug}>
                  <Link href={`/meeting/${item.slug}`} className={ui.link}>{item.label}</Link>
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

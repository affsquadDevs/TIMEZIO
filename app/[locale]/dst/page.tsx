import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { popularDst } from "@/data/seoLinks";
import { SITE_URL, SITE_NAME, OG_IMAGE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Daylight Saving Time Checker",
  description: "Is a region observing daylight saving time right now? Check DST status, the current UTC offset, and the exact next clock-change dates for countries worldwide.",
  alternates: { canonical: "/dst" },
  openGraph: {
    title: "Daylight Saving Time Checker | Timezio",
    description: "DST status and change dates for regions worldwide.",
    url: `${SITE_URL}/dst`,
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Daylight saving time checker on Timezio" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Daylight Saving Time Checker | Timezio",
    description: "Track DST start and end dates by country.",
    images: [OG_IMAGE],
  },
};

export default async function DstHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.dstHub");

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
                compare: (c) => <Link href="/compare" className={ui.link}>{c}</Link>,
                planner: (c) => <Link href="/planner" className={ui.link}>{c}</Link>,
              })}
            </p>
            <div className={ui.divider} />
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "12px" }}>
              {popularDst.map((item) => (
                <li key={item.slug}>
                  <Link href={`/dst/${item.slug}`} className={ui.link}>{item.label}</Link>
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

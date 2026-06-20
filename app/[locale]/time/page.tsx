import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

export default async function TimeHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.timeHub");

  const cities = (citiesData as CityRow[])
    .map((c) => ({ slug: c.id.replace(/_/g, "-"), label: c.label }))
    .sort((a, b) => a.label.localeCompare(b.label));

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
                convert: (c) => <Link href="/convert" className={ui.link}>{c}</Link>,
                compare: (c) => <Link href="/compare" className={ui.link}>{c}</Link>,
                planner: (c) => <Link href="/planner" className={ui.link}>{c}</Link>,
              })}
            </p>
            <div className={ui.divider} />
            <h2 className={ui.title} style={{ fontSize: "18px", margin: "8px 0 12px" }}>
              {t("listHeading", { count: cities.length })}
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
                  <Link href={`/time/${city.slug}`} className={ui.link}>{city.label}</Link>
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

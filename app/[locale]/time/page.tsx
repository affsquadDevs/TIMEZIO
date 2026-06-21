import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import citiesData from "@/data/cities.top200.json";
import { pageMetadata } from "@/lib/i18nMeta";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale: locale as Locale, path: "/time", title: t("timeHub.title"), description: t("timeHub.description") });
}

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

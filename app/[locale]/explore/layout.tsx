import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/i18nMeta";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale: locale as Locale, path: "/explore", title: t("explore.title"), description: t("explore.description") });
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

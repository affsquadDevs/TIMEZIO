import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { pageMetadata } from "@/lib/i18nMeta";
import type { Locale } from "@/i18n/routing";

// Saved locations live in the visitor's browser (localStorage), so the page has
// no shared, indexable content — keep it out of the index.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata({ locale: locale as Locale, path: "/saved", title: t("saved.title"), description: t("saved.description"), index: false });
}

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

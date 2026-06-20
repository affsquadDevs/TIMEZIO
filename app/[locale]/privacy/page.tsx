import { setRequestLocale, getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { LegalDocView, type LegalDoc } from '@/components/legal/LegalDocView';
import { localizedPath } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';
import { SITE_URL } from '@/lib/site';

type Params = { locale: string };

export default async function PrivacyPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');
  const tc = await getTranslations('common');
  const doc = t.raw('privacy') as LegalDoc;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: tc('breadcrumbHome'), item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: doc.title, item: `${SITE_URL}${localizedPath(locale as Locale, '/privacy')}` },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} id="ld-breadcrumb" />
      <LegalDocView doc={doc} />
    </>
  );
}

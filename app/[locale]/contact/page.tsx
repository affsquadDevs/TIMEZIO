import { setRequestLocale, getTranslations } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { LegalDocView, type LegalDoc } from '@/components/legal/LegalDocView';
import { localizedPath } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';
import { SITE_URL, SITE_NAME, CONTACT_EMAIL } from '@/lib/site';

type Params = { locale: string };

export default async function ContactPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('legal');
  const tc = await getTranslations('common');
  const doc = t.raw('contact') as LegalDoc;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: tc('breadcrumbHome'), item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: doc.title, item: `${SITE_URL}${localizedPath(locale as Locale, '/contact')}` },
    ],
  };
  const contactSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    mainEntity: { '@type': 'Organization', name: SITE_NAME, email: CONTACT_EMAIL },
  };

  return (
    <>
      <JsonLd data={breadcrumb} id="ld-breadcrumb" />
      <JsonLd data={contactSchema} id="ld-contact" />
      <LegalDocView doc={doc} />
    </>
  );
}

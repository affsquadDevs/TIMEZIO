import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { pageMetadata } from '@/lib/i18nMeta';
import type { Locale } from '@/i18n/routing';

// Functional Google Calendar / Meet planner (OAuth lands here). Useful as an app
// feature but not an SEO landing page — keep it out of the index.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return pageMetadata({ locale: locale as Locale, path: '/meeting-planner', title: t('meetingPlanner.title'), description: t('planner.description'), index: false });
}

export default function MeetingPlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

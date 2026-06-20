'use client';

import { AppShell } from '@/components/layout/AppShell';
import { useTranslations } from 'next-intl';

export default function TimeZoneConverterClient() {
  const t = useTranslations('ui.converter');
  return (
    <AppShell
      defaultTab="explore"
      heading={t('heading')}
      description={t('description')}
      ctas={[
        { href: '/compare', label: t('compareCta') },
        { href: '/planner', label: t('plannerCta') },
      ]}
    />
  );
}



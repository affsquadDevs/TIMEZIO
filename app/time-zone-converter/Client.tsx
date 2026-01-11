'use client';

import { AppShell } from '@/components/layout/AppShell';

export default function TimeZoneConverterClient() {
  return (
    <AppShell
      defaultTab="explore"
      heading="Time Zone Converter"
      description="Explore and convert time zones on an interactive globe, check local times, and find overlaps for meetings. Fully DST-aware and powered by official IANA data."
      ctas={[
        { href: '/compare', label: 'Compare time zones' },
        { href: '/planner', label: 'Plan a meeting' },
      ]}
    />
  );
}


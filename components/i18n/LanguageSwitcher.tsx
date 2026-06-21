'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { LOCALE_META } from '@/i18n/locales';

// Switches locale while preserving the current path. next-intl's usePathname
// returns the path WITHOUT the locale prefix, and router.replace re-applies it.
export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('language');

  return (
    <select
      aria-label={t('select')}
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      style={{
        appearance: 'none',
        background: 'var(--card-bg)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        maxWidth: '9rem',
      }}
    >
      {routing.locales.map((l) => (
        <option key={l} value={l}>
          {LOCALE_META[l].native}
        </option>
      ))}
    </select>
  );
}

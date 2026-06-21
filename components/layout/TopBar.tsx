'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import styles from './layout.module.css';
import ui from '@/components/ui/ui.module.css';

import { useAppStore } from '@/store/useAppStore';
import { buildShareUrl } from '@/utils/share';
import { CopyButton } from '@/components/ui/CopyButton';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

export function TopBar() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const toggle24h = useAppStore((s) => s.toggle24h);
  const use24h = useAppStore((s) => s.use24h);
  const tab = useAppStore((s) => s.tab);
  const selectedId = useAppStore((s) => s.selectedId);
  const locationsById = useAppStore((s) => s.locationsById);
  const compare = useAppStore((s) => s.compare);
  const savedIds = useAppStore((s) => s.savedIds);

  const shareUrl = useMemo(() => {
    const locations = Object.values(locationsById);
    return buildShareUrl({
      tab,
      selectedId: selectedId ?? undefined,
      locations,
      compareIds: compare.items,
      compareBaseId: compare.baseId,
      savedIds,
    });
  }, [tab, selectedId, locationsById, compare.baseId, compare.items, savedIds]);

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <header className={styles.topBar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 3vw, 32px)', flex: 1, minWidth: 0 }}>
        <Link href="/" className={styles.brand} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div className={styles.brandTitle}>Timezio</div>
        </Link>

        <nav className={styles.nav}>
          <Link
            href="/blog"
            className={`${styles.navLink} ${isActive('/blog') ? styles.navLinkActive : ''}`}
          >
            {t('blog')}
          </Link>
          <Link
            href="/about"
            className={`${styles.navLink} ${isActive('/about') ? styles.navLinkActive : ''}`}
          >
            {t('about')}
          </Link>
        </nav>
      </div>

      <div className={styles.topActions}>
        <button className={ui.btn} onClick={toggle24h} title={t('toggleHourFormat')}>
          {use24h ? '24h' : '12h'}
        </button>
        <ThemeToggle />
        <LanguageSwitcher />
        <CopyButton text={shareUrl} label={t('copyLink')} />
      </div>
    </header>
  );
}

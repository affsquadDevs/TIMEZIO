'use client';

import { useTranslations } from 'next-intl';
import { useAppStore } from '@/store/useAppStore';
import styles from './ui.module.css';

export function ThemeToggle() {
  const t = useTranslations('ui.themeToggle');
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const isLight = theme === 'light';
  const emoji = isLight ? '🌙' : '☀️';
  const text = isLight ? t('dark') : t('light');

  return (
    <button
      className={styles.btn}
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      title={t('switchTitle', { theme: text.toLowerCase() })}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        minWidth: 'auto',
        padding: '8px 12px'
      }}
    >
      <span>{emoji}</span>
      <span>{text}</span>
    </button>
  );
}




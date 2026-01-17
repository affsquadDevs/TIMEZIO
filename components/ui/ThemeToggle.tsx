'use client';

import { useAppStore } from '@/store/useAppStore';
import styles from './ui.module.css';

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const isLight = theme === 'light';
  const emoji = isLight ? '🌙' : '☀️';
  const text = isLight ? 'Dark' : 'Light';

  return (
    <button
      className={styles.btn}
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      title={`Switch to ${text.toLowerCase()} theme`}
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




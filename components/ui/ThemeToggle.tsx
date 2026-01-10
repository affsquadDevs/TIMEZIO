'use client';

import { useAppStore } from '@/store/useAppStore';
import styles from './ui.module.css';

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <button
      className={styles.btn}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        minWidth: 'auto',
        padding: '8px 12px'
      }}
    >
      {theme === 'light' ? '🌙' : '☀️'}
      <span style={{ fontSize: '14px' }}>{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}




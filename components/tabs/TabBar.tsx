import type { AppTab } from '@/types/domain';
import { useAppStore } from '@/store/useAppStore';
import { useTranslations } from 'next-intl';
import styles from './tabs.module.css';

const TABS: { id: AppTab; labelKey: string }[] = [
  { id: 'explore', labelKey: 'explore' },
  { id: 'planner', labelKey: 'planner' },
  { id: 'compare', labelKey: 'compare' },
  { id: 'dst', labelKey: 'dst' },
  { id: 'saved', labelKey: 'saved' },
];

export function TabBar(props: { compact?: boolean }) {
  const t = useTranslations('ui.tabBar');
  const tab = useAppStore((s) => s.tab);
  const setTab = useAppStore((s) => s.setTab);

  return (
    <div className={styles.tabBar} data-compact={props.compact ? '1' : '0'}>
      {TABS.map((tabItem) => (
        <button
          key={tabItem.id}
          className={`${styles.tabBtn} ${tab === tabItem.id ? styles.tabBtnActive : ''}`}
          onClick={() => setTab(tabItem.id)}
        >
          {t(tabItem.labelKey)}
        </button>
      ))}
    </div>
  );
}





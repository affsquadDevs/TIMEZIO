import type { AppTab } from '@/types/domain';
import { useAppStore } from '@/store/useAppStore';
import styles from './tabs.module.css';

const TABS: { id: AppTab; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'compare', label: 'Compare' },
  { id: 'planner', label: 'Planner' },
  { id: 'dst', label: 'DST' },
  { id: 'saved', label: 'Saved' },
];

export function TabBar(props: { compact?: boolean }) {
  const tab = useAppStore((s) => s.tab);
  const setTab = useAppStore((s) => s.setTab);

  return (
    <div className={styles.tabBar} data-compact={props.compact ? '1' : '0'}>
      {TABS.map((t) => (
        <button
          key={t.id}
          className={`${styles.tabBtn} ${tab === t.id ? styles.tabBtnActive : ''}`}
          onClick={() => setTab(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}





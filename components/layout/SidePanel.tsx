import styles from './layout.module.css';
import { ExploreTab } from '@/features/explore/ExploreTab';
import { CompareTab } from '@/features/compare/CompareTab';
import { PlannerTab } from '@/features/planner/PlannerTab';
import { DstTab } from '@/features/dst/DstTab';
import { SavedTab } from '@/features/saved/SavedTab';
import { useAppStore } from '@/store/useAppStore';

export function SidePanel() {
  const tab = useAppStore((s) => s.tab);
  return (
    <aside className={styles.panelWrap}>
      {tab === 'explore' && <ExploreTab />}
      {tab === 'compare' && <CompareTab />}
      {tab === 'planner' && <PlannerTab />}
      {tab === 'dst' && <DstTab />}
      {tab === 'saved' && <SavedTab />}
    </aside>
  );
}




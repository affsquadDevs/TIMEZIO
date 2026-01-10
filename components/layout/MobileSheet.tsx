import styles from './layout.module.css';
import { TabBar } from '@/components/tabs/TabBar';
import { ExploreTab } from '@/features/explore/ExploreTab';
import { CompareTab } from '@/features/compare/CompareTab';
import { PlannerTab } from '@/features/planner/PlannerTab';
import { DstTab } from '@/features/dst/DstTab';
import { SavedTab } from '@/features/saved/SavedTab';
import { useAppStore } from '@/store/useAppStore';

export function MobileSheet() {
  const tab = useAppStore((s) => s.tab);
  return (
    <div className={styles.sheet}>
      <div className={styles.sheetHandle} />
      <div className={styles.sheetInner}>
        <TabBar compact />
        {tab === 'explore' && <ExploreTab />}
        {tab === 'compare' && <CompareTab />}
        {tab === 'planner' && <PlannerTab />}
        {tab === 'dst' && <DstTab />}
        {tab === 'saved' && <SavedTab />}
      </div>
    </div>
  );
}





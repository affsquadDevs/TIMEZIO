'use client';

import { useEffect, useMemo } from 'react';
import styles from '@/components/layout/layout.module.css';
import GlobeCanvas from '@/components/globe/GlobeCanvas';
import { TopBar } from '@/components/layout/TopBar';
import { TabBar } from '@/components/tabs/TabBar';
import { SidePanel } from '@/components/layout/SidePanel';
import { MobileSheet } from '@/components/layout/MobileSheet';
import { Footer } from '@/components/layout/Footer';
import { useAppStore, useSelectedLocation } from '@/store/useAppStore';
import type { AppTab } from '@/types/domain';

export type StageLocation = { lat: number; lng: number; label: string };
export type StageInit = {
  tab: AppTab;
  mode: 'select' | 'compare' | 'planner';
  locations: StageLocation[];
  focus: { lat: number; lng: number; altitude: number };
};

// Client "stage": the interactive globe + app chrome. The server page passes the
// resolved locations via `init` (no params-in-useEffect gate) and the SEO text
// body as `children`, which is server-rendered into the initial HTML.
export function PageStage({ init, children }: { init: StageInit; children: React.ReactNode }) {
  const pickLocationFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const addToCompare = useAppStore((s) => s.addToCompare);
  const addPlannerParticipant = useAppStore((s) => s.addPlannerParticipant);
  const selectLocation = useAppStore((s) => s.selectLocation);
  const setTab = useAppStore((s) => s.setTab);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const compare = useAppStore((s) => s.compare);
  const locationsById = useAppStore((s) => s.locationsById);
  const focusTarget = useAppStore((s) => s.focusTarget);
  const selected = useSelectedLocation();
  const timezoneMode = useAppStore((s) => s.timezoneMode);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (init.mode === 'compare') clearCompare();
      const locs = init.locations.map((l) => pickLocationFromLatLng(l.lat, l.lng, 'search', l.label));
      if (init.mode === 'compare') {
        locs.forEach((l) => addToCompare(l.id));
      } else if (init.mode === 'planner') {
        locs.forEach((l) => addPlannerParticipant(l.id, l.label));
      }
      if (locs[0]) selectLocation(locs[0].id);
      setTab(init.tab);
      requestFocus(init.focus);
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!focusTarget) return;
    const t = window.setTimeout(() => requestFocus(null), 0);
    return () => window.clearTimeout(t);
  }, [focusTarget, requestFocus]);

  const markers = useMemo(() => {
    const ms: { id: string; lat: number; lng: number; color?: string; size?: number }[] = [];
    if (selected) ms.push({ id: `sel_${selected.id}`, lat: selected.lat, lng: selected.lng, color: '#ef4444', size: 0.55 });
    for (const id of compare.items) {
      const loc = locationsById[id];
      if (!loc) continue;
      ms.push({
        id: `cmp_${id}`,
        lat: loc.lat,
        lng: loc.lng,
        color: compare.baseId === id ? '#22c55e' : '#60a5fa',
        size: compare.baseId === id ? 0.6 : 0.42,
      });
    }
    return ms;
  }, [selected, compare.items, compare.baseId, locationsById]);

  return (
    <div className={styles.layout}>
      <TopBar />
      <div className={styles.tabBarContainer}>
        <TabBar />
      </div>
      <div className={styles.contentArea}>
        <div className={styles.main}>
          <div className={styles.globeWrap}>
            <GlobeCanvas
              focusTarget={focusTarget}
              markers={markers}
              selectedLocation={selected ? { tz: selected.tz } : null}
              timezoneMode={timezoneMode}
              onPickLocation={(lat, lng) => {
                pickLocationFromLatLng(lat, lng, 'click');
              }}
            />
          </div>
          <div className={styles.desktopOnly}>
            <SidePanel />
          </div>
        </div>
        <div className={styles.mobileOnly}>
          <MobileSheet />
        </div>
        {children}
      </div>
      <Footer />
    </div>
  );
}

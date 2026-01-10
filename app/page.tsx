'use client';

import { useEffect, useMemo, useRef } from 'react';
import styles from '@/components/layout/layout.module.css';

import GlobeCanvas, { GlobeCanvasHandle } from '@/components/globe/GlobeCanvas';
import { TopBar } from '@/components/layout/TopBar';
import { SidePanel } from '@/components/layout/SidePanel';
import { MobileSheet } from '@/components/layout/MobileSheet';
import { Footer } from '@/components/layout/Footer';
import { TabBar } from '@/components/tabs/TabBar';

import { useAppStore, useSelectedLocation } from '@/store/useAppStore';

export default function Home() {
  const globeRef = useRef<GlobeCanvasHandle>(null);

  const hydrateFromUrl = useAppStore((s) => s.hydrateFromUrl);
  const pickFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const compare = useAppStore((s) => s.compare);
  const locationsById = useAppStore((s) => s.locationsById);
  const focusTarget = useAppStore((s) => s.focusTarget);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const selected = useSelectedLocation();
  const timezoneMode = useAppStore((s) => s.timezoneMode);

  useEffect(() => {
    hydrateFromUrl();
    // Default selection (only when nothing is selected/loaded)
    const s = useAppStore.getState();
    if (!s.selectedId && Object.keys(s.locationsById).length === 0) {
      const ny = s.pickLocationFromLatLng(40.7128, -74.006, 'search', 'New York, US');
      s.requestFocus({ lat: ny.lat, lng: ny.lng, altitude: 1.6 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear focusTarget after it's been passed down once.
  useEffect(() => {
    if (!focusTarget) return;
    const t = window.setTimeout(() => requestFocus(null), 0);
    return () => window.clearTimeout(t);
  }, [focusTarget, requestFocus]);

  const markers = useMemo(() => {
    const ms: { id: string; lat: number; lng: number; color?: string; size?: number }[] = [];

    // selected marker
    if (selected) ms.push({ id: `sel_${selected.id}`, lat: selected.lat, lng: selected.lng, color: '#ef4444', size: 0.55 });

    // compare markers
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
      <div className={styles.main}>
        <div className={styles.globeWrap}>
          <GlobeCanvas
            ref={globeRef}
            focusTarget={focusTarget}
            markers={markers}
            selectedLocation={selected ? { tz: selected.tz } : null}
            timezoneMode={timezoneMode}
            onPickLocation={(lat, lng) => {
              pickFromLatLng(lat, lng, 'click');
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

      <Footer />
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef } from 'react';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';

import GlobeCanvas, { GlobeCanvasHandle } from '@/components/globe/GlobeCanvas';
import { TopBar } from '@/components/layout/TopBar';
import { SidePanel } from '@/components/layout/SidePanel';
import { MobileSheet } from '@/components/layout/MobileSheet';
import { Footer } from '@/components/layout/Footer';
import { TabBar } from '@/components/tabs/TabBar';
import Link from 'next/link';

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

  useEffect(() => {
    // (schema is injected globally in app/layout.tsx)
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
          <div style={{ marginTop: '20px', padding: '0 16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <div className={ui.card}>
              <div className={ui.cardBody}>
                <h1 className={styles.marketingTitle}>
                  Time Zone Converter & Meeting Planner
                </h1>
                <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px', wordBreak: 'break-word' }}>
                  Instantly convert time zones, plan meetings across cities, and explore daylight saving time on an interactive 3D globe. All calculations are DST-aware and based on official IANA timezone data.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px', width: '100%' }}>
                  <Link href="/convert" className={ui.link} style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, wordBreak: 'break-word' }}>
                    → Popular Time Zone Converters
                  </Link>
                  <Link href="/time" className={ui.link} style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, wordBreak: 'break-word' }}>
                    → Current Time in Major Cities
                  </Link>
                  <Link href="/meeting" className={ui.link} style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, wordBreak: 'break-word' }}>
                    → Best Meeting Times by City Pair
                  </Link>
                  <Link href="/dst" className={ui.link} style={{ fontSize: 'clamp(12px, 2vw, 14px)', fontWeight: 600, wordBreak: 'break-word' }}>
                    → Daylight Saving Time Checker
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mobileOnly}>
        <MobileSheet />
      </div>

      <Footer />
    </div>
  );
}

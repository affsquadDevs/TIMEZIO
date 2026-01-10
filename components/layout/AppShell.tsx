'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import styles from '@/components/layout/layout.module.css';
import ui from '@/components/ui/ui.module.css';
import GlobeCanvas, { GlobeCanvasHandle } from '@/components/globe/GlobeCanvas';
import { TopBar } from '@/components/layout/TopBar';
import { SidePanel } from '@/components/layout/SidePanel';
import { MobileSheet } from '@/components/layout/MobileSheet';
import { Footer } from '@/components/layout/Footer';
import { TabBar } from '@/components/tabs/TabBar';
import { useAppStore, useSelectedLocation } from '@/store/useAppStore';
import type { AppTab } from '@/types/domain';

type AppShellProps = {
  defaultTab?: AppTab;
  heading: string;
  description: string;
  ctas?: Array<{ href: string; label: string }>;
};

export function AppShell({ defaultTab, heading, description, ctas = [] }: AppShellProps) {
  const globeRef = useRef<GlobeCanvasHandle>(null);

  const hydrateFromUrl = useAppStore((s) => s.hydrateFromUrl);
  const pickFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const compare = useAppStore((s) => s.compare);
  const locationsById = useAppStore((s) => s.locationsById);
  const focusTarget = useAppStore((s) => s.focusTarget);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const selected = useSelectedLocation();
  const timezoneMode = useAppStore((s) => s.timezoneMode);
  const setTab = useAppStore((s) => s.setTab);

  useEffect(() => {
    hydrateFromUrl();

    const s = useAppStore.getState();
    if (!s.selectedId && Object.keys(s.locationsById).length === 0) {
      const ny = s.pickLocationFromLatLng(40.7128, -74.006, 'search', 'New York, US');
      s.requestFocus({ lat: ny.lat, lng: ny.lng, altitude: 1.6 });
    }

    // If the URL doesn't contain shared state, apply the default tab.
    if (defaultTab) {
      const hasShare = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('s');
      if (!hasShare) setTab(defaultTab);
    }
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
          <div style={{ marginTop: '20px', padding: '0 16px' }}>
            <div className={ui.card}>
              <div className={ui.cardBody}>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: '1.2' }}>
                  {heading}
                </h1>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
                  {description}
                </p>
                {ctas.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                    {ctas.map((cta) => (
                      <Link key={cta.href} href={cta.href} className={ui.link} style={{ fontSize: '14px', fontWeight: 600 }}>
                        → {cta.label}
                      </Link>
                    ))}
                  </div>
                )}
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



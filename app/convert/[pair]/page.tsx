'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from "next/link";
import styles from "@/components/layout/layout.module.css";
import ui from "@/components/ui/ui.module.css";
import { TopBar } from "@/components/layout/TopBar";
import { Footer } from "@/components/layout/Footer";
import { TabBar } from "@/components/tabs/TabBar";
import { SidePanel } from "@/components/layout/SidePanel";
import { MobileSheet } from "@/components/layout/MobileSheet";
import GlobeCanvas, { GlobeCanvasHandle } from '@/components/globe/GlobeCanvas';
import { popularConverters } from "@/data/seoLinks";
import { useAppStore, useSelectedLocation } from "@/store/useAppStore";
import { parseCityPair } from "@/utils/cityMapper";
import { FAQSection } from "@/components/seo/FAQSection";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { SEOHead } from "@/components/seo/SEOHead";
import { getConvertFAQs } from "@/data/seoFAQs";

type Params = { pair: string };

const toTitle = (text: string) =>
  text
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const parsePair = (pair: string | undefined) => {
  if (!pair) return { from: "From", to: "To" };
  const normalized = pair.toLowerCase();
  const parts = normalized.includes("-to-") ? normalized.split("-to-") : [];
  const from = parts[0] ?? "";
  const to = parts[1] ?? "";
  return {
    from: from ? toTitle(from) : "From",
    to: to ? toTitle(to) : "To",
  };
};

export default function ConvertPairPage({ params }: { params: Promise<Params> }) {
  const [pair, setPair] = useState<string | null>(null);
  const globeRef = useRef<GlobeCanvasHandle>(null);
  
  useEffect(() => {
    params.then((resolved) => setPair(resolved.pair));
  }, [params]);

  const pickLocationFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const addToCompare = useAppStore((s) => s.addToCompare);
  const selectLocation = useAppStore((s) => s.selectLocation);
  const setTab = useAppStore((s) => s.setTab);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const compare = useAppStore((s) => s.compare);
  const locationsById = useAppStore((s) => s.locationsById);
  const focusTarget = useAppStore((s) => s.focusTarget);
  const selected = useSelectedLocation();
  const timezoneMode = useAppStore((s) => s.timezoneMode);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!pair || initialized) return;
    
    // Small delay to ensure store is ready
    const timer = setTimeout(() => {
      const { from, to } = parseCityPair(pair);
      if (from && to) {
        clearCompare();
        const locFrom = pickLocationFromLatLng(from.lat, from.lng, 'search', from.label);
        const locTo = pickLocationFromLatLng(to.lat, to.lng, 'search', to.label);
        addToCompare(locFrom.id);
        addToCompare(locTo.id);
        selectLocation(locFrom.id);
        setTab('compare');
        requestFocus({ lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2, altitude: 2.5 });
        setInitialized(true);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pair, initialized, pickLocationFromLatLng, addToCompare, selectLocation, setTab, requestFocus, clearCompare]);

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

  if (!pair) return null;
  
  const { from, to } = parsePair(pair);
  const heading = `${from} → ${to} Time Converter`;
  const infoDescription = `Convert time instantly between ${from} and ${to} with automatic daylight saving time awareness. The interactive globe above shows both locations, and you can use the Compare tab to see current offsets, time differences, and DST status in real-time.`;
  const faqs = getConvertFAQs(from, to);
  const tips = [
    {
      text: `Use the Compare tab to see side-by-side UTC offsets for ${from} and ${to} at any moment.`,
      link: { href: "/compare", label: "Open Compare" },
    },
    {
      text: "Drag the timeline to preview DST shifts and avoid planning during transitions.",
    },
    {
      text: `Bookmark this converter if you revisit ${from} ↔ ${to} frequently — the globe keeps your cities highlighted.`,
    },
  ];
  const highlights = [
    `Live offset display highlights the real-time difference between ${from} and ${to}.`,
    "Automatic DST detection keeps the converter accurate across transitions.",
    "Interactive globe shows both cities simultaneously for visual confirmation.",
  ];
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Convert', url: '/convert' },
    { name: `${from} to ${to}`, url: `/convert/${pair}` },
  ];

  const canonicalUrl = `/convert/${pair}`;
  const pageUrl = `https://timezio.com${canonicalUrl}`;
  const absoluteBreadcrumbs = breadcrumbs.map((item) => ({
    ...item,
    url: item.url.startsWith("http") ? item.url : `https://timezio.com${item.url}`,
  }));
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: heading,
    description: infoDescription,
    url: pageUrl,
    inLanguage: 'en-US',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: absoluteBreadcrumbs.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: item.url,
      })),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Timezio',
      url: 'https://timezio.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://timezio.com/globe.svg',
      },
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: tips.map((tip, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: tip.text,
      })),
    },
    hasPart: highlights.map((text) => ({
      '@type': 'CreativeWork',
      name: text,
    })),
  };

  return (
    <>
      <SEOHead structuredData={structuredData} />
      <BreadcrumbSchema items={breadcrumbs} />
      <div className={styles.layout}>
        <TopBar />
        <div className={styles.tabBarContainer}>
          <TabBar />
        </div>
        <div className={styles.contentArea}>
          <div className={styles.main}>
            <div className={styles.globeWrap}>
              <GlobeCanvas
                ref={globeRef}
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
          <div className={styles.infoSection}>
            <div className={styles.infoCardWrapper}>
              <div className={ui.card}>
                <div className={ui.cardBody}>
                  <h1 className={ui.title} style={{ marginBottom: '12px', fontSize: '24px' }}>
                    {heading}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                    {infoDescription}
                  </p>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '8px', fontWeight: 600 }}>
                      Pro tips
                    </h3>
                    <ul
                      role="list"
                      aria-label="Tips for better time conversion"
                      style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '6px' }}
                    >
                      {tips.map((tip, idx) => (
                        <li
                          key={`tip-${idx}`}
                          style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}
                        >
                          <span style={{ color: 'var(--highlight)' }}>→</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                            {tip.text}
                            {tip.link && (
                              <>
                                {' '}
                                <Link href={tip.link.href} className={ui.link} style={{ fontSize: '14px' }}>
                                  {tip.link.label}
                                </Link>
                              </>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '12px' }}>
                      <h4 style={{ fontSize: '15px', marginBottom: '6px', fontWeight: 600 }}>Highlights</h4>
                      <ul style={{ listStyle: 'disc', paddingLeft: '16px', margin: 0, color: 'var(--text-secondary)', fontSize: '14px', display: 'grid', gap: '4px' }}>
                        {highlights.map((item, idx) => (
                          <li key={`highlight-${idx}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className={ui.divider} />
                  <h2 className={ui.title} style={{ fontSize: '18px', marginBottom: '12px' }}>
                    Related Converters
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                    {popularConverters.slice(0, 5).map((item) => (
                      <li key={item.slug}>
                        <Link href={`/convert/${item.slug}`} className={ui.link} style={{ fontSize: '14px' }}>
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <FAQSection faqs={faqs} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}


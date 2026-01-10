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
import { popularMeetings } from "@/data/seoLinks";
import { useAppStore, useSelectedLocation } from "@/store/useAppStore";
import { parseMeetingPair } from "@/utils/cityMapper";
import { FAQSection } from "@/components/seo/FAQSection";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { SEOHead } from "@/components/seo/SEOHead";
import { getMeetingFAQs } from "@/data/seoFAQs";

type Params = { pair: string };

const toTitle = (text: string) =>
  text
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const parsePair = (pair: string | undefined) => {
  if (!pair) return { from: "City A", to: "City B" };
  const normalized = pair.toLowerCase();
  const parts = normalized.includes("-to-") ? normalized.split("-to-") : [];
  const from = parts[0] ?? "";
  const to = parts[1] ?? "";
  return {
    from: from ? toTitle(from) : "City A",
    to: to ? toTitle(to) : "City B",
  };
};

export default function MeetingPairPage({ params }: { params: Promise<Params> }) {
  const [pair, setPair] = useState<string | null>(null);
  const globeRef = useRef<GlobeCanvasHandle>(null);
  
  useEffect(() => {
    params.then((resolved) => setPair(resolved.pair));
  }, [params]);

  const pickLocationFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const addPlannerParticipant = useAppStore((s) => s.addPlannerParticipant);
  const selectLocation = useAppStore((s) => s.selectLocation);
  const setTab = useAppStore((s) => s.setTab);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const locationsById = useAppStore((s) => s.locationsById);
  const focusTarget = useAppStore((s) => s.focusTarget);
  const selected = useSelectedLocation();
  const timezoneMode = useAppStore((s) => s.timezoneMode);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!pair || initialized) return;
    
    const timer = setTimeout(() => {
      const { cityA, cityB } = parseMeetingPair(pair);
      if (cityA && cityB) {
        const locA = pickLocationFromLatLng(cityA.lat, cityA.lng, 'search', cityA.label);
        const locB = pickLocationFromLatLng(cityB.lat, cityB.lng, 'search', cityB.label);
        const resA = addPlannerParticipant(locA.id, cityA.label);
        const resB = addPlannerParticipant(locB.id, cityB.label);
        if (resA.ok && resB.ok) {
          setTab('planner');
          selectLocation(locA.id);
          requestFocus({ lat: (cityA.lat + cityB.lat) / 2, lng: (cityA.lng + cityB.lng) / 2, altitude: 2.5 });
          setInitialized(true);
        }
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [pair, initialized, pickLocationFromLatLng, addPlannerParticipant, selectLocation, setTab, requestFocus]);

  useEffect(() => {
    if (!focusTarget) return;
    const t = window.setTimeout(() => requestFocus(null), 0);
    return () => window.clearTimeout(t);
  }, [focusTarget, requestFocus]);

  const markers = useMemo(() => {
    const ms: { id: string; lat: number; lng: number; color?: string; size?: number }[] = [];
    if (selected) ms.push({ id: `sel_${selected.id}`, lat: selected.lat, lng: selected.lng, color: '#ef4444', size: 0.55 });
    // Add markers for planner participants
    Object.values(locationsById).forEach((loc) => {
      if (!ms.find((m) => m.lat === loc.lat && m.lng === loc.lng)) {
        ms.push({ id: `ppt_${loc.id}`, lat: loc.lat, lng: loc.lng, color: '#8b5cf6', size: 0.4 });
      }
    });
    return ms;
  }, [selected, locationsById]);

  if (!pair) return null;
  
  const { from, to } = parsePair(pair);
  const heading = `Best Meeting Time: ${from} ↔ ${to}`;
  const infoDescription = `Find the best meeting time between ${from} and ${to}. Use the Planner tab above to add both cities, set working hours for each participant, and view overlap windows. Our tool automatically avoids early morning or late night hours when possible and accounts for daylight saving time changes.`;
  const faqs = getMeetingFAQs(from, to);
  const tips = [
    {
      text: `Add ${from} and ${to} in the Planner tab to see overlap windows that respect each participant's working hours.`,
      link: { href: "/planner", label: "Open Planner" },
    },
    {
      text: "Use the Compare tab before booking to verify offsets and prevent confusion around DST transitions.",
      link: { href: "/compare", label: "Open Compare" },
    },
    {
      text: `Set focus on the globe to the midpoint between ${from} and ${to} for a balanced map perspective.`,
    },
  ];
  const highlights = [
    `Planner reflects ${from} and ${to}'s availability to surface overlapping work hours.`,
    "Globe focus stays centered between the two cities for a balanced view.",
    "Quick links to Compare/Planner keep you within the scheduling flow.",
  ];
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Meeting Planner', url: '/meeting' },
    { name: `${from} to ${to}`, url: `/meeting/${pair}` },
  ];
  const canonicalUrl = `/meeting/${pair}`;
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
                      aria-label="Meeting planning tips"
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
                    More Popular Pairs
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                    {popularMeetings.slice(0, 5).map((item) => (
                      <li key={item.slug}>
                        <Link href={`/meeting/${item.slug}`} className={ui.link} style={{ fontSize: '14px' }}>
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

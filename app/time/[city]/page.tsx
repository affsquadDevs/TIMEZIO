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
import { popularCities } from "@/data/seoLinks";
import { useAppStore, useSelectedLocation } from "@/store/useAppStore";
import { findCityBySlug } from "@/utils/cityMapper";
import { FAQSection } from "@/components/seo/FAQSection";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { SEOHead } from "@/components/seo/SEOHead";
import { getTimeCityFAQs } from "@/data/seoFAQs";

type Params = { city: string };

const toTitle = (text: string) =>
  text
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function TimeCityPage({ params }: { params: Promise<Params> }) {
  const [citySlug, setCitySlug] = useState<string | null>(null);
  const globeRef = useRef<GlobeCanvasHandle>(null);
  
  useEffect(() => {
    params.then((resolved) => setCitySlug(resolved.city));
  }, [params]);

  const pickLocationFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const selectLocation = useAppStore((s) => s.selectLocation);
  const setTab = useAppStore((s) => s.setTab);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const focusTarget = useAppStore((s) => s.focusTarget);
  const selected = useSelectedLocation();
  const timezoneMode = useAppStore((s) => s.timezoneMode);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!citySlug || initialized) return;
    
    const timer = setTimeout(() => {
      const city = findCityBySlug(citySlug);
      if (city) {
        const loc = pickLocationFromLatLng(city.lat, city.lng, 'search', city.label);
        selectLocation(loc.id);
        setTab('explore');
        requestFocus({ lat: city.lat, lng: city.lng, altitude: 1.6 });
        setInitialized(true);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [citySlug, initialized, pickLocationFromLatLng, selectLocation, setTab, requestFocus]);

  useEffect(() => {
    if (!focusTarget) return;
    const t = window.setTimeout(() => requestFocus(null), 0);
    return () => window.clearTimeout(t);
  }, [focusTarget, requestFocus]);

  const markers = useMemo(() => {
    if (!selected) return [];
    return [{ id: `sel_${selected.id}`, lat: selected.lat, lng: selected.lng, color: '#ef4444', size: 0.55 }];
  }, [selected]);

  if (!citySlug) return null;
  
  const cityName = toTitle(citySlug);
  const infoDescription = `Check the current local time in ${cityName} right now. The interactive globe above shows the exact location, and you can use the Explore tab to view the current time, UTC offset, and daylight saving time status. All times update in real-time and automatically adjust for DST changes.`;
  const tips = [
    {
      text: `Pin ${cityName} to the globe so it stays highlighted even when you explore other regions.`,
      link: { href: `/explore`, label: "Open Explore" },
    },
    {
      text: `Use the Explore tab to compare ${cityName}'s current time with UTC or nearby cities.`,
    },
    {
      text: `Watch the DST badge when approaching transitions to avoid scheduling mistakes.`,
      link: { href: "/dst", label: "Check DST rules" },
    },
  ];
  const highlights = [
    `Live clock for ${cityName} shows UTC offset and DST status at a glance.`,
    `The globe keeps ${cityName} centered so you can quickly compare nearby regions.`,
    "Popular city links provide fast navigation for frequently checked time zones.",
  ];
  const faqs = getTimeCityFAQs(cityName);
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Time', url: '/time' },
    { name: cityName, url: `/time/${citySlug}` },
  ];
  const canonicalUrl = `/time/${citySlug}`;
  const pageUrl = `https://timezio.com${canonicalUrl}`;
  const absoluteBreadcrumbs = breadcrumbs.map((item) => ({
    ...item,
    url: item.url.startsWith("http") ? item.url : `https://timezio.com${item.url}`,
  }));
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Current Time in ${cityName}`,
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
                    Current Time in {cityName}
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
                      aria-label={`Tips for ${cityName}`}
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
                    Popular Cities
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                    {popularCities.slice(0, 6).map((city) => (
                      <li key={city.slug}>
                        <Link href={`/time/${city.slug}`} className={ui.link} style={{ fontSize: '14px' }}>
                          {city.label}
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


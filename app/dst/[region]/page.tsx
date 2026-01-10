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
import { popularDst } from "@/data/seoLinks";
import { useAppStore, useSelectedLocation } from "@/store/useAppStore";
import { findCityByRegion } from "@/utils/cityMapper";
import { FAQSection } from "@/components/seo/FAQSection";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { SEOHead } from "@/components/seo/SEOHead";
import { getDSTFAQs } from "@/data/seoFAQs";

type Params = { region: string };

const toTitle = (text: string) =>
  text
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function DstRegionPage({ params }: { params: Promise<Params> }) {
  const [regionSlug, setRegionSlug] = useState<string | null>(null);
  const globeRef = useRef<GlobeCanvasHandle>(null);
  
  useEffect(() => {
    params.then((resolved) => setRegionSlug(resolved.region));
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
    if (!regionSlug || initialized) return;
    
    const timer = setTimeout(() => {
      const city = findCityByRegion(regionSlug);
      if (city) {
        const loc = pickLocationFromLatLng(city.lat, city.lng, 'search', city.label);
        selectLocation(loc.id);
        setTab('dst');
        requestFocus({ lat: city.lat, lng: city.lng, altitude: 1.6 });
        setInitialized(true);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [regionSlug, initialized, pickLocationFromLatLng, selectLocation, setTab, requestFocus]);

  useEffect(() => {
    if (!focusTarget) return;
    const t = window.setTimeout(() => requestFocus(null), 0);
    return () => window.clearTimeout(t);
  }, [focusTarget, requestFocus]);

  const markers = useMemo(() => {
    if (!selected) return [];
    return [{ id: `sel_${selected.id}`, lat: selected.lat, lng: selected.lng, color: '#ef4444', size: 0.55 }];
  }, [selected]);

  if (!regionSlug) return null;
  
  const regionName = toTitle(regionSlug);
  const infoDescription = `Check whether ${regionName} is currently observing daylight saving time. Use the DST tab above to view detailed information about DST status, upcoming transitions, and how time offsets change throughout the year. All data is based on official IANA timezone rules.`;
  const faqs = getDSTFAQs(regionName);
  const tips = [
    {
      text: `Watch for the next DST transition listed in the DST tab and set reminders if it affects your team.`,
      link: { href: "/dst", label: "Open DST tab" },
    },
    {
      text: `Use the Turtle icon beside the globe to highlight ${regionName} while comparing it to neighboring regions.`,
    },
    {
      text: `Export the ${regionName} timeline from the Planner tab to share with collaborators who travel frequently.`,
      link: { href: "/planner", label: "Open Planner" },
    },
  ];
  const highlights = [
    `${regionName} DST status updates automatically from the IANA database.`,
    "Upcoming transitions are listed with dates so you can plan around changes.",
    "Compare nearby regions with a single globe tap to spot offset differences.",
  ];
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'DST', url: '/dst' },
    { name: regionName, url: `/dst/${regionSlug}` },
  ];
  const canonicalUrl = `/dst/${regionSlug}`;
  const pageUrl = `https://timezio.com${canonicalUrl}`;
  const absoluteBreadcrumbs = breadcrumbs.map((item) => ({
    ...item,
    url: item.url.startsWith("http") ? item.url : `https://timezio.com${item.url}`,
  }));
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${regionName} Daylight Saving Time`,
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
                    {regionName} Daylight Saving Time
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
                      aria-label={`DST tips for ${regionName}`}
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
                    Popular Regions
                  </h2>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
                    {popularDst.slice(0, 5).map((item) => (
                      <li key={item.slug}>
                        <Link href={`/dst/${item.slug}`} className={ui.link} style={{ fontSize: '14px' }}>
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

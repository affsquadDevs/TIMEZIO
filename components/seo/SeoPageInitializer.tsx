'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { findCityBySlug, parseCityPair, parseMeetingPair } from '@/utils/cityMapper';

type SeoPageInitializerProps = {
  type: 'convert' | 'time' | 'meeting' | 'dst';
  slug?: string;
};

export function SeoPageInitializer({ type, slug }: SeoPageInitializerProps) {
  const router = useRouter();
  const pickLocationFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const selectLocation = useAppStore((s) => s.selectLocation);
  const addToCompare = useAppStore((s) => s.addToCompare);
  const addPlannerParticipant = useAppStore((s) => s.addPlannerParticipant);
  const setTab = useAppStore((s) => s.setTab);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const clearCompare = useAppStore((s) => s.clearCompare);

  useEffect(() => {
    if (!slug) return;

    // Redirect to home with initialized state
    const initializeAndRedirect = () => {
      if (type === 'time') {
        const city = findCityBySlug(slug);
        if (city) {
          const loc = pickLocationFromLatLng(city.lat, city.lng, 'search', city.label);
          selectLocation(loc.id);
          setTab('explore');
          requestFocus({ lat: city.lat, lng: city.lng, altitude: 1.6 });
          router.push('/');
        }
      } else if (type === 'convert') {
        const { from, to } = parseCityPair(slug);
        if (from && to) {
          clearCompare();
          const locFrom = pickLocationFromLatLng(from.lat, from.lng, 'search', from.label);
          const locTo = pickLocationFromLatLng(to.lat, to.lng, 'search', to.label);
          addToCompare(locFrom.id);
          addToCompare(locTo.id);
          selectLocation(locFrom.id);
          setTab('compare');
          requestFocus({ lat: (from.lat + to.lat) / 2, lng: (from.lng + to.lng) / 2, altitude: 2.5 });
          router.push('/');
        }
      } else if (type === 'meeting') {
        const { cityA, cityB } = parseMeetingPair(slug);
        if (cityA && cityB) {
          const locA = pickLocationFromLatLng(cityA.lat, cityA.lng, 'search', cityA.label);
          const locB = pickLocationFromLatLng(cityB.lat, cityB.lng, 'search', cityB.label);
          
          // Clear planner and add participants
          const resA = addPlannerParticipant(locA.id, cityA.label);
          const resB = addPlannerParticipant(locB.id, cityB.label);
          
          if (resA.ok && resB.ok) {
            setTab('planner');
            selectLocation(locA.id);
            requestFocus({ lat: (cityA.lat + cityB.lat) / 2, lng: (cityA.lng + cityB.lng) / 2, altitude: 2.5 });
            router.push('/');
          }
        }
      } else if (type === 'dst') {
        // For DST, find a major city in that region
        const city = findCityBySlug(slug);
        if (city) {
          const loc = pickLocationFromLatLng(city.lat, city.lng, 'search', city.label);
          selectLocation(loc.id);
          setTab('dst');
          requestFocus({ lat: city.lat, lng: city.lng, altitude: 1.6 });
          router.push('/');
        }
      }
    };

    // Small delay to ensure store is hydrated
    const timer = setTimeout(initializeAndRedirect, 100);
    return () => clearTimeout(timer);
  }, [slug, type, router, pickLocationFromLatLng, selectLocation, addToCompare, addPlannerParticipant, setTab, requestFocus, clearCompare]);

  return null;
}


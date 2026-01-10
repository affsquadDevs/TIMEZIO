'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { DateTime } from 'luxon';
import { getTimezoneBandPolygons, type TimezoneMode } from '@/utils/timezoneBand';

export type GlobeMarker = { id: string; lat: number; lng: number; color?: string; size?: number };

export interface GlobeCanvasHandle {
  resetView: () => void;
  focusTo: (lat: number, lng: number, altitude?: number) => void;
}

export type GlobeCanvasProps = {
  onPickLocation: (lat: number, lng: number) => void;
  markers?: GlobeMarker[];
  focusTarget?: { lat: number; lng: number; altitude?: number } | null;
  selectedLocation?: { tz: string } | null;
  timezoneMode?: TimezoneMode;
};

const DEFAULT_ALTITUDE = 2.5;

const GlobeCanvas = forwardRef<GlobeCanvasHandle, GlobeCanvasProps>((props, ref) => {
  const globeRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [textureError, setTextureError] = useState(false);
  const [Globe, setGlobe] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const defaultAltitudeRef = useRef<number>(DEFAULT_ALTITUDE);

  const earthTextureUrl = 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg';

  useEffect(() => {
    setIsMounted(true);
    import('react-globe.gl').then((module) => setGlobe(() => module.default));
  }, []);

  function focusTo(lat: number, lng: number, altitude?: number) {
    globeRef.current?.pointOfView({ lat, lng, altitude: altitude ?? defaultAltitudeRef.current }, 900);
  }

  useImperativeHandle(ref, () => ({
    resetView: () => focusTo(0, 0),
    focusTo,
  }));

  // Make the planet slightly smaller on shorter viewports (so the globe frame matches the side panel visually).
  useEffect(() => {
    if (!isMounted) return;

    const computeDefaultAltitude = () => {
      const h = window.innerHeight;
      const w = window.innerWidth;
      // Shorter screens benefit from a more zoomed-out globe.
      // Keep it conservative so interactions still feel good.
      if (h <= 820) return 3.3;
      if (h <= 900) return 3.0;
      if (w >= 1400 && h <= 1000) return 2.9;
      return DEFAULT_ALTITUDE;
    };

    defaultAltitudeRef.current = computeDefaultAltitude();
  }, [isMounted]);

  useEffect(() => {
    if (!props.focusTarget) return;
    focusTo(props.focusTarget.lat, props.focusTarget.lng, props.focusTarget.altitude ?? 1.6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.focusTarget?.lat, props.focusTarget?.lng, props.focusTarget?.altitude]);

  const points = (props.markers ?? []).map((m) => ({
    ...m,
    color: m.color ?? '#ef4444',
    size: m.size ?? 0.45,
  }));

  // Generate timezone band polygons for SIMPLE mode
  const timezonePolygons = useMemo(() => {
    if (!props.selectedLocation || !props.selectedLocation.tz || props.timezoneMode !== 'simple') {
      return []; // Always return array
    }
    try {
      const now = DateTime.now();
      const bands = getTimezoneBandPolygons(props.selectedLocation.tz, now);
      if (!bands || bands.length === 0) return [];
      
      // React-globe.gl expects polygonsData in GeoJSON Feature format
      // Each object should have a geometry property with type "Polygon" and coordinates
      // GeoJSON Polygon format: coordinates = [[[lng, lat], [lng, lat], ...]] (array of rings, first is exterior)
      const result = bands
        .filter((band) => band.polygon && band.polygon.length >= 3)
        .map((band) => ({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [band.polygon], // Wrap in array for GeoJSON Polygon format
          },
        }));
      
      return result;
    } catch (error) {
      console.error('Error generating timezone band polygons:', error);
      return [];
    }
  }, [props.selectedLocation?.tz, props.timezoneMode]);

  if (!isMounted || !Globe) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              border: '2px solid rgba(59,130,246,0.25)',
              borderTopColor: 'rgba(59,130,246,0.95)',
              margin: '0 auto 10px auto',
              animation: 'spin 900ms linear infinite',
            }}
          />
          <div style={{ color: 'rgba(226,232,240,0.9)', fontWeight: 650 }}>Loading globe…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="globe-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      {isLoading && !textureError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(2,6,23,0.55)',
            zIndex: 10,
            color: 'rgba(226,232,240,0.9)',
            fontWeight: 650,
          }}
        >
          Loading texture…
        </div>
      )}
      {textureError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(2,6,23,0.55)',
            zIndex: 10,
            color: 'rgba(226,232,240,0.9)',
            fontWeight: 650,
          }}
        >
          Texture failed to load — showing default
        </div>
      )}

      <Globe
        ref={globeRef}
        globeImageUrl={earthTextureUrl}
        onGlobeReady={() => {
          setIsLoading(false);
          // Ensure initial view respects our default altitude (smaller planet).
          globeRef.current?.pointOfView({ lat: 0, lng: 0, altitude: defaultAltitudeRef.current }, 0);
        }}
        onGlobeImageError={() => {
          setTextureError(true);
          setIsLoading(false);
        }}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere
        atmosphereColor="#3b82f6"
        atmosphereAltitude={0.2}
        onGlobeClick={(ev: any) => {
          const lat = ev?.lat;
          const lng = ev?.lng;
          if (typeof lat === 'number' && typeof lng === 'number') props.onPickLocation(lat, lng);
        }}
        pointsData={points}
        pointColor="color"
        pointRadius="size"
        pointResolution={12}
        polygonsData={timezonePolygons}
        polygonGeoJsonGeometry="geometry"
        polygonAltitude={0.001}
        polygonColor="rgba(255, 235, 59, 0.3)"
        polygonCapColor="rgba(255, 235, 59, 0.4)"
        polygonSideColor="rgba(255, 235, 59, 0.25)"
        enablePointerInteraction
        animateIn
      />
    </div>
  );
});

GlobeCanvas.displayName = 'GlobeCanvas';

export default GlobeCanvas;



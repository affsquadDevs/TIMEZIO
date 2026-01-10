import { DateTime } from 'luxon';
import { getOffsetInfo } from './time';

export type TimezoneMode = 'simple' | 'real';

export type TimezoneBandPolygon = {
  id: string;
  polygon: Array<[number, number]>; // [lng, lat] - GeoJSON format for react-globe.gl
};

const BAND_WIDTH_DEG = 15; // degrees
const HALF_BAND = BAND_WIDTH_DEG / 2;

/**
 * Convert UTC offset (hours) to center longitude.
 * UTC+2 => +30°, UTC-5 => -75°, etc.
 */
export function offsetToCenterLng(offsetHours: number): number {
  return offsetHours * 15;
}

/**
 * Normalize longitude to [-180, 180] range
 */
function normalizeLng(lng: number): number {
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}

/**
 * Generate a simple timezone band polygon as a vertical strip.
 * Handles antimeridian crossing (±180°) by splitting into two polygons if needed.
 * Uses more points for smoother appearance on the sphere.
 */
export function generateSimpleTimezoneBand(offsetHours: number): TimezoneBandPolygon[] {
  const centerLng = offsetToCenterLng(offsetHours);
  let leftLng = centerLng - HALF_BAND;
  let rightLng = centerLng + HALF_BAND;

  // Normalize to [-180, 180] range
  leftLng = normalizeLng(leftLng);
  rightLng = normalizeLng(rightLng);

  const bands: TimezoneBandPolygon[] = [];
  const latPoints = 20; // Number of points along latitude for smoother curve

  // Generate latitude points
  const latCoords: number[] = [];
  for (let i = 0; i <= latPoints; i++) {
    const lat = -90 + (i / latPoints) * 180;
    latCoords.push(lat);
  }

  // Check if band crosses antimeridian (when left > right after normalization)
  if (leftLng > rightLng) {
    // Split into two polygons
    // Left part: from leftLng to 180
    const leftPolygon: Array<[number, number]> = [];
    for (const lat of latCoords) {
      leftPolygon.push([leftLng, lat]); // [lng, lat] - GeoJSON format
    }
    for (let i = latCoords.length - 1; i >= 0; i--) {
      leftPolygon.push([180, latCoords[i]]); // [lng, lat] - GeoJSON format
    }

    bands.push({
      id: 'band_left',
      polygon: leftPolygon,
    });

    // Right part: from -180 to rightLng
    const rightPolygon: Array<[number, number]> = [];
    for (const lat of latCoords) {
      rightPolygon.push([-180, lat]); // [lng, lat] - GeoJSON format
    }
    for (let i = latCoords.length - 1; i >= 0; i--) {
      rightPolygon.push([rightLng, latCoords[i]]); // [lng, lat] - GeoJSON format
    }

    bands.push({
      id: 'band_right',
      polygon: rightPolygon,
    });
  } else {
    // Single polygon, no antimeridian crossing
    const polygon: Array<[number, number]> = [];
    // Left edge: bottom to top
    for (const lat of latCoords) {
      polygon.push([leftLng, lat]); // [lng, lat] - GeoJSON format
    }
    // Right edge: top to bottom
    for (let i = latCoords.length - 1; i >= 0; i--) {
      polygon.push([rightLng, latCoords[i]]); // [lng, lat] - GeoJSON format
    }

    bands.push({
      id: 'band_main',
      polygon,
    });
  }

  return bands;
}

/**
 * Get timezone band polygons for a given timezone at a specific time.
 * Returns polygons for SIMPLE mode (based on UTC offset).
 */
export function getTimezoneBandPolygons(tz: string, at: DateTime): TimezoneBandPolygon[] {
  const info = getOffsetInfo(tz, at);
  return generateSimpleTimezoneBand(info.offsetHours);
}


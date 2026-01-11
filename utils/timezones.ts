/**
 * Utilities for working with IANA timezones
 */

import { DateTime } from 'luxon';

/**
 * Get all IANA timezones grouped by region
 * Returns an object with keys like 'Europe', 'America', 'Asia', etc.
 */
export function getAllTimezones(): Record<string, string[]> {
  const timezones: Record<string, string[]> = {};
  
  try {
    // Use Intl.supportedValuesOf if available (modern browsers)
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      const allTz = (Intl as any).supportedValuesOf('timeZone') as string[];
      for (const tz of allTz) {
        const [region] = tz.split('/');
        if (!timezones[region]) {
          timezones[region] = [];
        }
        timezones[region].push(tz);
      }
      
      // Sort each region's timezones
      for (const region in timezones) {
        timezones[region].sort();
      }
    } else {
      // Fallback: manually define common timezones
      const commonTimezones = [
        // Europe
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid',
        'Europe/Lisbon', 'Europe/Warsaw', 'Europe/Prague', 'Europe/Vienna', 'Europe/Zurich',
        'Europe/Stockholm', 'Europe/Oslo', 'Europe/Helsinki', 'Europe/Athens', 'Europe/Istanbul',
        'Europe/Moscow', 'Europe/Kyiv', 'Europe/Bucharest', 'Europe/Sofia', 'Europe/Budapest',
        'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Dublin', 'Europe/Copenhagen',
        
        // America
        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'America/Phoenix', 'America/Anchorage', 'America/Honolulu', 'America/Toronto',
        'America/Vancouver', 'America/Mexico_City', 'America/Sao_Paulo', 'America/Buenos_Aires',
        'America/Lima', 'America/Bogota', 'America/Santiago', 'America/Caracas',
        
        // Asia
        'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Seoul',
        'Asia/Dubai', 'Asia/Kolkata', 'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Manila',
        'Asia/Kuala_Lumpur', 'Asia/Dhaka', 'Asia/Karachi', 'Asia/Tehran', 'Asia/Riyadh',
        
        // Pacific
        'Pacific/Auckland', 'Pacific/Sydney', 'Pacific/Melbourne', 'Pacific/Brisbane',
        'Pacific/Honolulu', 'Pacific/Fiji', 'Pacific/Guam',
        
        // Africa
        'Africa/Cairo', 'Africa/Johannesburg', 'Africa/Lagos', 'Africa/Nairobi',
        'Africa/Casablanca', 'Africa/Tunis',
        
        // Other
        'Atlantic/Reykjavik', 'Indian/Mumbai', 'Indian/Dubai',
      ];
      
      for (const tz of commonTimezones) {
        const [region] = tz.split('/');
        if (!timezones[region]) {
          timezones[region] = [];
        }
        timezones[region].push(tz);
      }
      
      // Sort each region
      for (const region in timezones) {
        timezones[region].sort();
      }
    }
  } catch (error) {
    console.error('Failed to get timezones:', error);
    // Return at least UTC as fallback
    return { 'UTC': ['UTC'] };
  }
  
  return timezones;
}

/**
 * Get formatted timezone name for display
 */
export function formatTimezoneName(tz: string): string {
  try {
    const dt = DateTime.now().setZone(tz);
    const offset = dt.toFormat('ZZZZ'); // e.g., "+02:00"
    const abbreviation = dt.toFormat('ZZZ'); // e.g., "EET"
    const parts = tz.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    return `${city} (${abbreviation} ${offset})`;
  } catch {
    return tz;
  }
}

/**
 * Search timezones by query (case-insensitive)
 */
export function searchTimezones(query: string): string[] {
  if (!query) return [];
  
  const allTz: string[] = [];
  const tzMap = getAllTimezones();
  
  for (const region in tzMap) {
    allTz.push(...tzMap[region]);
  }
  
  const lowerQuery = query.toLowerCase();
  return allTz.filter((tz) => {
    const formatted = formatTimezoneName(tz).toLowerCase();
    return tz.toLowerCase().includes(lowerQuery) || formatted.includes(lowerQuery);
  });
}


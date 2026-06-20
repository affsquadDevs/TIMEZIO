// Server-side timezone facts and tables. No 'use client' — these run during SSR/ISR
// so that real, per-instance data (offsets, DST dates, conversion/overlap tables)
// is present in the initial HTML for crawlers and AdSense review.
//
// All date/time formatting accepts a `locale` so month/day names and time
// formats localize (e.g. "dimanche 1 novembre 2026", "14:30").
import { DateTime } from 'luxon';
import { findCityBySlug, findCityByRegion } from '@/utils/cityMapper';
import { findNextOffsetTransition } from '@/utils/time';

export type City = { id: string; label: string; lat: number; lng: number; tz: string };

/** Acronyms that should render uppercase in display names. */
const ACRONYMS = new Set([
  'us', 'uk', 'eu', 'usa', 'uae', 'dst',
  'utc', 'gmt', 'est', 'edt', 'pst', 'pdt', 'cst', 'cdt', 'mst', 'mdt',
  'cet', 'cest', 'ist', 'jst', 'kst', 'sgt', 'aest', 'aedt', 'nzst', 'nzdt',
  'hst', 'ast', 'bst', 'gst', 'eet', 'wet',
]);

/** Title-case a kebab slug, keeping known acronyms uppercase (e.g. "pst" -> "PST"). */
export function displayToken(token: string): string {
  return token
    .split('-')
    .filter(Boolean)
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ');
}

/** Canonical kebab slug for a city (derived from its data id). */
export function citySlug(city: City): string {
  return city.id.replace(/_/g, '-');
}

/** Short city name without the country suffix, e.g. "New York, US" -> "New York". */
export function cityShortName(city: City): string {
  return city.label.split(',')[0].trim();
}

/** Format an offset in minutes as e.g. "UTC+5:30" / "UTC-4" / "UTC+0". */
export function formatOffsetLabel(offsetMin: number): string {
  const sign = offsetMin >= 0 ? '+' : '-';
  const absMin = Math.abs(offsetMin);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  return `UTC${sign}${h}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

export type Transition = {
  whenDate: string; // localized, e.g. "Sunday, November 1, 2026"
  type: 'begins' | 'ends';
  fromOffsetLabel: string;
  toOffsetLabel: string;
};

/** Up to `count` upcoming DST/offset transitions for a zone. */
export function nextTransitions(tz: string, count = 2, locale = 'en'): Transition[] {
  const out: Transition[] = [];
  let cursor = DateTime.now().setZone(tz);
  for (let i = 0; i < count; i++) {
    const t = findNextOffsetTransition(tz, cursor);
    if (!t) break;
    const before = t.minus({ minutes: 1 });
    const begins = t.offset > before.offset; // spring forward => DST begins
    out.push({
      whenDate: t.setLocale(locale).toLocaleString(DateTime.DATE_HUGE),
      type: begins ? 'begins' : 'ends',
      fromOffsetLabel: formatOffsetLabel(before.offset),
      toOffsetLabel: formatOffsetLabel(t.offset),
    });
    cursor = t.plus({ hours: 1 });
  }
  return out;
}

export type ZoneFacts = {
  tz: string;
  nowDate: string;
  nowTime: string;
  offsetLabel: string;
  offsetMinutes: number;
  abbr: string | null;
  isDst: boolean;
  observesDst: boolean;
  transitions: Transition[];
};

export function getZoneFacts(tz: string, locale = 'en'): ZoneFacts {
  const now = DateTime.now().setZone(tz).setLocale(locale);
  const transitions = nextTransitions(tz, 2, locale);
  return {
    tz,
    nowDate: now.toLocaleString(DateTime.DATE_HUGE),
    nowTime: now.toLocaleString(DateTime.TIME_SIMPLE),
    offsetLabel: formatOffsetLabel(now.offset),
    offsetMinutes: now.offset,
    abbr: now.offsetNameShort ?? null,
    isDst: now.isInDST,
    observesDst: transitions.length > 0,
    transitions,
  };
}

// ---- City resolution -------------------------------------------------------

export function resolveCity(slug: string): City | null {
  return findCityBySlug(slug) as City | null;
}

// ---- Converter endpoints ---------------------------------------------------

type Endpoint = { zone: string; label: string; full: string };

const ABBR_ZONE: Record<string, Endpoint> = {
  utc: { zone: 'UTC', label: 'UTC', full: 'Coordinated Universal Time' },
  gmt: { zone: 'UTC', label: 'GMT', full: 'Greenwich Mean Time' },
  est: { zone: 'America/New_York', label: 'EST', full: 'Eastern Time (US & Canada)' },
  edt: { zone: 'America/New_York', label: 'EDT', full: 'Eastern Daylight Time (US & Canada)' },
  pst: { zone: 'America/Los_Angeles', label: 'PST', full: 'Pacific Time (US & Canada)' },
  pdt: { zone: 'America/Los_Angeles', label: 'PDT', full: 'Pacific Daylight Time (US & Canada)' },
  cst: { zone: 'America/Chicago', label: 'CST', full: 'Central Time (US & Canada)' },
  cdt: { zone: 'America/Chicago', label: 'CDT', full: 'Central Daylight Time (US & Canada)' },
  mst: { zone: 'America/Denver', label: 'MST', full: 'Mountain Time (US & Canada)' },
  mdt: { zone: 'America/Denver', label: 'MDT', full: 'Mountain Daylight Time (US & Canada)' },
  cet: { zone: 'Europe/Paris', label: 'CET', full: 'Central European Time' },
  cest: { zone: 'Europe/Paris', label: 'CEST', full: 'Central European Summer Time' },
  ist: { zone: 'Asia/Kolkata', label: 'IST', full: 'India Standard Time' },
  jst: { zone: 'Asia/Tokyo', label: 'JST', full: 'Japan Standard Time' },
  kst: { zone: 'Asia/Seoul', label: 'KST', full: 'Korea Standard Time' },
  sgt: { zone: 'Asia/Singapore', label: 'SGT', full: 'Singapore Time' },
  aest: { zone: 'Australia/Sydney', label: 'AEST', full: 'Australian Eastern Standard Time' },
  aedt: { zone: 'Australia/Sydney', label: 'AEDT', full: 'Australian Eastern Daylight Time' },
};

export function resolveEndpoint(slug: string): Endpoint | null {
  const key = slug.toLowerCase();
  if (ABBR_ZONE[key]) return ABBR_ZONE[key];
  const city = findCityBySlug(slug);
  if (city) return { zone: city.tz, label: displayToken(slug), full: city.label };
  return null;
}

export function parseConvertPair(pairSlug: string): { from: Endpoint; to: Endpoint } | null {
  const parts = pairSlug.toLowerCase().split('-to-');
  if (parts.length !== 2) return null;
  const from = resolveEndpoint(parts[0]);
  const to = resolveEndpoint(parts[1]);
  if (!from || !to) return null;
  return { from, to };
}

export type DayNote = 'same' | 'next' | 'prev';
export type ConvRow = { from: string; to: string; dayNote: DayNote };

/** A readable conversion table: key hours of the "from" zone mapped to the "to" zone. */
export function buildConversionTable(fromZone: string, toZone: string, locale = 'en'): ConvRow[] {
  const base = DateTime.now().setZone(fromZone).startOf('day');
  const hours = [0, 3, 6, 9, 12, 15, 18, 21];
  return hours.map((h) => {
    const f = base.set({ hour: h });
    const t = f.setZone(toZone);
    const dayDiff = Math.round(
      DateTime.fromISO(t.toFormat('yyyy-LL-dd')).diff(DateTime.fromISO(f.toFormat('yyyy-LL-dd')), 'days').days
    );
    const dayNote: DayNote = dayDiff === 0 ? 'same' : dayDiff > 0 ? 'next' : 'prev';
    return {
      from: f.setLocale(locale).toLocaleString(DateTime.TIME_SIMPLE),
      to: t.setLocale(locale).toLocaleString(DateTime.TIME_SIMPLE),
      dayNote,
    };
  });
}

/** Current whole/fractional-hour difference from -> to, e.g. +3, -5.5. */
export function offsetDiffHours(fromZone: string, toZone: string): number {
  const now = DateTime.now();
  const a = now.setZone(fromZone).offset;
  const b = now.setZone(toZone).offset;
  return (b - a) / 60;
}

/** Human-readable English difference (used by metadata that isn't locale-split yet). */
export function formatDiffHours(diff: number): string {
  if (diff === 0) return 'the same time (no difference)';
  const sign = diff > 0 ? 'ahead of' : 'behind';
  const absH = Math.abs(diff);
  const h = Math.floor(absH);
  const m = Math.round((absH - h) * 60);
  const human = `${h}${m ? `h ${m}m` : ' hour' + (h === 1 ? '' : 's')}`;
  return `${human} ${sign}`;
}

/** Structured difference for locale-safe sentence building. */
export type DiffParts = { h: number; m: number; dir: 'ahead' | 'behind' | 'same'; totalMinutes: number };
export function offsetDiffParts(fromZone: string, toZone: string): DiffParts {
  const now = DateTime.now();
  const totalMinutes = now.setZone(toZone).offset - now.setZone(fromZone).offset;
  const abs = Math.abs(totalMinutes);
  return {
    h: Math.floor(abs / 60),
    m: abs % 60,
    dir: totalMinutes === 0 ? 'same' : totalMinutes > 0 ? 'ahead' : 'behind',
    totalMinutes,
  };
}

// ---- Meeting overlap -------------------------------------------------------

export type OverlapRow = { a: string; b: string; overlap: boolean };

export function buildMeetingOverlap(zoneA: string, zoneB: string, locale = 'en') {
  const base = DateTime.now().setZone(zoneA).startOf('day');
  const rows: OverlapRow[] = [];
  const overlapHours: { a: string; b: string }[] = [];
  for (let h = 0; h < 24; h++) {
    const a = base.set({ hour: h }).setLocale(locale);
    const b = a.setZone(zoneB).setLocale(locale);
    const aWork = h >= 9 && h < 17;
    const bWork = b.hour >= 9 && b.hour < 17;
    const overlap = aWork && bWork;
    rows.push({ a: a.toLocaleString(DateTime.TIME_SIMPLE), b: b.toLocaleString(DateTime.TIME_SIMPLE), overlap });
    if (overlap) overlapHours.push({ a: a.toLocaleString(DateTime.TIME_SIMPLE), b: b.toLocaleString(DateTime.TIME_SIMPLE) });
  }
  const best = overlapHours.length ? overlapHours[Math.floor(overlapHours.length / 2)] : null;
  return { rows, overlapHours, best, hasOverlap: overlapHours.length > 0 };
}

// ---- DST regions -----------------------------------------------------------

export function getDstRegion(regionSlug: string, locale = 'en') {
  const city = findCityByRegion(regionSlug) as City | null;
  if (!city) return null;
  const facts = getZoneFacts(city.tz, locale);
  return {
    regionLabel: displayToken(regionSlug),
    city,
    facts,
    observesDst: facts.observesDst,
  };
}

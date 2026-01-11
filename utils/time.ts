import { DateTime } from 'luxon';
import type { IsoDate, Location, WorkingHours } from '@/types/domain';

export function formatTime(dt: DateTime, opts?: { use24h?: boolean }) {
  const use24h = opts?.use24h ?? true;
  return use24h ? dt.toFormat('yyyy-LL-dd HH:mm:ss') : dt.toFormat('yyyy-LL-dd hh:mm:ss a');
}

export function getOffsetInfo(tz: string, at: DateTime) {
  const dt = at.setZone(tz);
  const offsetHours = dt.offset / 60;
  const offsetLabel = offsetHours >= 0 ? `UTC+${offsetHours}` : `UTC${offsetHours}`;
  return {
    offsetMinutes: dt.offset,
    offsetHours,
    offsetLabel,
    isDst: dt.isInDST,
    offsetNameShort: dt.offsetNameShort ?? null,
  };
}

export function findNextOffsetTransition(tz: string, from: DateTime) {
  const start = from.setZone(tz).startOf('hour');
  const startOffset = start.offset;
  const maxHours = 24 * 370;
  const step = 6;

  let hi: DateTime | null = null;
  let lo: DateTime | null = null;

  for (let h = step; h <= maxHours; h += step) {
    const dt = start.plus({ hours: h });
    if (dt.offset !== startOffset) {
      hi = dt;
      lo = dt.minus({ hours: step });
      break;
    }
  }

  if (!hi || !lo) return null;

  let left = lo;
  let right = hi;
  while (right.diff(left, 'minutes').minutes > 1) {
    const mid = left.plus({ minutes: Math.floor(right.diff(left, 'minutes').minutes / 2) });
    if (mid.offset === startOffset) left = mid;
    else right = mid;
  }
  return right;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

export type TimeSlot = {
  startUtc: string; // ISO
  endUtc: string; // ISO
  localTimes: Record<string, string>; // participantId -> "HH:mm"
  qualityScore?: number; // 0-100, higher is better (accounts for time of day)
  localTimesFull: Record<string, DateTime>; // participantId -> full DateTime
};

export function calculateSlotQuality(
  slotStartUtc: DateTime,
  participants: Array<{ id: string; locationId: string }>,
  locationsById: Record<string, Location>,
  workingHours: Record<string, WorkingHours>,
  avoidEarlyHours: boolean,
  avoidLateHours: boolean,
  avoidLunch: boolean
): number {
  let score = 100;
  let participantCount = 0;

  for (const ppt of participants) {
    const loc = locationsById[ppt.locationId];
    if (!loc) continue;
    const local = slotStartUtc.setZone(loc.tz);
    if (!local.isValid) continue;

    participantCount++;
    const hour = local.hour;
    const minute = local.minute;
    const hourDecimal = hour + minute / 60;

    const hours = workingHours[ppt.id];
    if (hours) {
      const workStart = timeToMinutes(hours.start) / 60;
      const workEnd = timeToMinutes(hours.end) / 60;
      const workDuration = workEnd - workStart;
      const timeFromStart = hourDecimal - workStart;
      const positionInDay = timeFromStart / workDuration; // 0 = start, 1 = end

      // Penalize very early (before 8 AM)
      if (avoidEarlyHours && hour < 8) {
        score -= 30;
      }
      // Penalize very late (after 8 PM)
      if (avoidLateHours && hour >= 20) {
        score -= 30;
      }
      // Penalize early morning (8-9 AM) slightly
      if (hour >= 8 && hour < 9) {
        score -= 10;
      }
      // Penalize late evening (7-8 PM) slightly
      if (hour >= 19 && hour < 20) {
        score -= 10;
      }
      // Penalize lunch time (12:00-13:00)
      if (avoidLunch && hour === 12) {
        score -= 20;
      }
      // Bonus for mid-day (10 AM - 4 PM)
      if (hour >= 10 && hour < 16) {
        score += 5;
      }
      // Bonus for optimal position in work day (25%-75% of work day)
      if (positionInDay >= 0.25 && positionInDay <= 0.75) {
        score += 10;
      }
    }
  }

  return Math.max(0, Math.min(100, score / participantCount));
}

export function findMeetingSlots(
  participants: Array<{ id: string; locationId: string; name: string }>,
  workingHours: Record<string, WorkingHours>,
  locationsById: Record<string, Location>,
  date: IsoDate,
  durationMinutes: number,
  stepMinutes: number = 30,
  avoidEarlyHours: boolean = true,
  avoidLateHours: boolean = true,
  avoidLunch: boolean = false
): TimeSlot[] {
  if (participants.length === 0) return [];

  const slots: TimeSlot[] = [];
  // Normalize date in UTC to avoid shifts from the viewer's timezone
  const dateObj = DateTime.fromISO(date, { zone: 'utc' });
  if (!dateObj.isValid) return [];

  // Get working hours windows in UTC for each participant
  const utcWindows: Array<{ participantId: string; startUtc: DateTime; endUtc: DateTime; location: Location }> = [];

  for (const ppt of participants) {
    const loc = locationsById[ppt.locationId];
    if (!loc) continue;
    const hours = workingHours[ppt.id];
    if (!hours) continue;

    const startMinutes = timeToMinutes(hours.start);
    const endMinutes = timeToMinutes(hours.end);
    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;

    // Create DateTime in participant's timezone
    const localStart = dateObj.setZone(loc.tz).set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
    const localEnd = dateObj.setZone(loc.tz).set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });

    // Handle DST and edge cases
    if (!localStart.isValid || !localEnd.isValid) continue;
    if (localEnd <= localStart) {
      // Handle case where end time is next day (e.g., night shift)
      const localEndNext = localEnd.plus({ days: 1 });
      if (localEndNext.isValid) {
        const startUtc = localStart.toUTC();
        const endUtc = localEndNext.toUTC();
        if (endUtc > startUtc) {
          utcWindows.push({ participantId: ppt.id, startUtc, endUtc, location: loc });
        }
      }
      continue;
    }

    const startUtc = localStart.toUTC();
    const endUtc = localEnd.toUTC();

    if (endUtc <= startUtc) continue; // Skip invalid ranges

    utcWindows.push({ participantId: ppt.id, startUtc, endUtc, location: loc });
  }

  if (utcWindows.length === 0 || utcWindows.length < participants.length) return [];

  // Find overlap window (intersection of all windows)
  let overlapStart = utcWindows[0]?.startUtc;
  let overlapEnd = utcWindows[0]?.endUtc;

  for (let i = 1; i < utcWindows.length; i++) {
    const w = utcWindows[i];
    if (w.startUtc > overlapStart!) overlapStart = w.startUtc;
    if (w.endUtc < overlapEnd!) overlapEnd = w.endUtc;
  }

  if (!overlapStart || !overlapEnd || !overlapStart.isValid || !overlapEnd.isValid || overlapEnd <= overlapStart) {
    return []; // No overlap found
  }

  // Generate slots within overlap
  let current = overlapStart;
  const maxIterations = 1000; // Safety limit
  let iterations = 0;

  while (current.plus({ minutes: durationMinutes }) <= overlapEnd && iterations < maxIterations) {
    iterations++;
    const slotStart = current;
    const slotEnd = current.plus({ minutes: durationMinutes });

    if (!slotStart.isValid || !slotEnd.isValid) {
      current = current.plus({ minutes: stepMinutes });
      continue;
    }

    // Check if slot fits in all participant windows
    const fitsAll = utcWindows.every((w) => slotStart >= w.startUtc && slotEnd <= w.endUtc);

    if (fitsAll) {
      const localTimes: Record<string, string> = {};
      const localTimesFull: Record<string, DateTime> = {};
      let allValid = true;

      for (const ppt of participants) {
        const loc = locationsById[ppt.locationId];
        if (!loc) {
          allValid = false;
          break;
        }
        const local = slotStart.setZone(loc.tz);
        if (!local.isValid) {
          allValid = false;
          break;
        }
        localTimes[ppt.id] = minutesToTime(local.hour * 60 + local.minute);
        localTimesFull[ppt.id] = local;
      }

      if (allValid) {
        // Calculate quality score
        const qualityScore = calculateSlotQuality(
          slotStart,
          participants,
          locationsById,
          workingHours,
          avoidEarlyHours,
          avoidLateHours,
          avoidLunch
        );

        slots.push({
          startUtc: slotStart.toISO() ?? '',
          endUtc: slotEnd.toISO() ?? '',
          localTimes,
          localTimesFull,
          qualityScore,
        });
      }
    }

    current = current.plus({ minutes: stepMinutes });
  }

  // Sort by quality score (best first)
  slots.sort((a, b) => (b.qualityScore ?? 0) - (a.qualityScore ?? 0));

  return slots;
}

/**
 * Creates a manual time slot from user-selected time in a specific participant's timezone
 */
export function createManualTimeSlot(
  date: IsoDate,
  manualTime: string, // "HH:mm" in base participant's timezone or UTC if no participants
  baseParticipantId: string | null,
  participants: Array<{ id: string; locationId: string; name: string }>,
  locationsById: Record<string, Location>,
  durationMinutes: number
): TimeSlot | null {
  if (!manualTime || manualTime.trim() === '') return null;

  // Normalize date in UTC to keep the same calendar day for all timezones
  const dateObj = DateTime.fromISO(date, { zone: 'utc' });
  if (!dateObj.isValid) return null;

  const [hour, minute] = manualTime.split(':').map(Number);
  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour >= 24 || minute < 0 || minute >= 60) {
    return null;
  }

  let startUtc: DateTime;

  if (baseParticipantId && participants.length > 0) {
    const baseParticipant = participants.find((p) => p.id === baseParticipantId);
    if (!baseParticipant) return null;

    const baseLocation = locationsById[baseParticipant.locationId];
    if (!baseLocation) return null;

    // Create DateTime in base participant's timezone
    const localStart = dateObj.setZone(baseLocation.tz).set({ hour, minute, second: 0, millisecond: 0 });
    if (!localStart.isValid) return null;

    startUtc = localStart.toUTC();
  } else {
    // No participants or no base selected - use UTC
    startUtc = dateObj.setZone('UTC').set({ hour, minute, second: 0, millisecond: 0 });
    if (!startUtc.isValid) return null;
  }

  const endUtc = startUtc.plus({ minutes: durationMinutes });

  if (!startUtc.isValid || !endUtc.isValid) return null;

  // Calculate local times for all participants
  const localTimes: Record<string, string> = {};
  const localTimesFull: Record<string, DateTime> = {};

  for (const ppt of participants) {
    const loc = locationsById[ppt.locationId];
    if (!loc) continue;

    const local = startUtc.setZone(loc.tz);
    if (!local.isValid) continue;

    localTimes[ppt.id] = minutesToTime(local.hour * 60 + local.minute);
    localTimesFull[ppt.id] = local;
  }

  return {
    startUtc: startUtc.toISO() ?? '',
    endUtc: endUtc.toISO() ?? '',
    localTimes,
    localTimesFull,
    qualityScore: undefined, // Manual selection, no quality score
  };
}



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
};

export function findMeetingSlots(
  participants: Array<{ id: string; locationId: string; name: string }>,
  workingHours: Record<string, WorkingHours>,
  locationsById: Record<string, Location>,
  date: IsoDate,
  durationMinutes: number,
  stepMinutes: number = 30
): TimeSlot[] {
  if (participants.length === 0) return [];

  const slots: TimeSlot[] = [];
  const dateObj = DateTime.fromISO(date);

  // Get working hours windows in UTC for each participant
  const utcWindows: Array<{ participantId: string; startUtc: DateTime; endUtc: DateTime }> = [];

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

    const localStart = dateObj.setZone(loc.tz).set({ hour: startHour, minute: startMin, second: 0, millisecond: 0 });
    const localEnd = dateObj.setZone(loc.tz).set({ hour: endHour, minute: endMin, second: 0, millisecond: 0 });

    const startUtc = localStart.toUTC();
    const endUtc = localEnd.toUTC();

    if (endUtc <= startUtc) continue; // Skip invalid ranges

    utcWindows.push({ participantId: ppt.id, startUtc, endUtc });
  }

  if (utcWindows.length === 0) return [];

  // Find overlap window (intersection of all windows)
  const overlapStart = DateTime.max(...utcWindows.map((w) => w.startUtc));
  const overlapEnd = DateTime.min(...utcWindows.map((w) => w.endUtc));

  if (!overlapStart || !overlapEnd || overlapEnd <= overlapStart) return [];

  // Generate slots within overlap
  let current = overlapStart;
  while (current.plus({ minutes: durationMinutes }) <= overlapEnd) {
    const slotStart = current;
    const slotEnd = current.plus({ minutes: durationMinutes });

    // Check if slot fits in all participant windows
    const fitsAll = utcWindows.every((w) => slotStart >= w.startUtc && slotEnd <= w.endUtc);

    if (fitsAll) {
      const localTimes: Record<string, string> = {};
      for (const ppt of participants) {
        const loc = locationsById[ppt.locationId];
        if (!loc) continue;
        const local = slotStart.setZone(loc.tz);
        if (!local.isValid) continue;
        localTimes[ppt.id] = minutesToTime(local.hour * 60 + local.minute);
      }

      slots.push({
        startUtc: slotStart.toISO() ?? '',
        endUtc: slotEnd.toISO() ?? '',
        localTimes,
      });
    }

    current = current.plus({ minutes: stepMinutes });
  }

  return slots;
}



import { DateTime } from 'luxon';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import {
  parseParticipants,
  ProposedSlot,
  stringifySlots,
  SlotBreakdown,
  parseWorkHoursPolicy,
  getWorkHoursForParticipant,
  type WorkHours,
} from '@/lib/meeting';

export const runtime = 'nodejs';

type GenerateSlotsBody = {
  stepMinutes?: number;
  maxCandidates?: number;
  topN?: number;
  hardFilterNight?: boolean;
  fairness?: boolean;
};

const DEFAULT_STEP = 30;
const DEFAULT_MAX = 500;
const DEFAULT_TOP = 10;

function parseTime(timeStr: string): number {
  const [hours, minutes = '0'] = timeStr.split(':');
  return parseInt(hours, 10) + parseInt(minutes, 10) / 60;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const uid = request.cookies.get('uid')?.value;

  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session id' }, { status: 400 });
  }

  let body: GenerateSlotsBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const stepMinutes = body.stepMinutes ?? DEFAULT_STEP;
  const maxCandidates = body.maxCandidates ?? DEFAULT_MAX;
  const topN = body.topN ?? DEFAULT_TOP;
  const hardFilterNight = body.hardFilterNight ?? false;
  const fairness = body.fairness ?? false;

  if (stepMinutes <= 0 || maxCandidates <= 0 || topN <= 0) {
    return NextResponse.json({ error: 'Invalid slot generation parameters' }, { status: 400 });
  }

  try {
    const session = await prisma.meetingSession.findUnique({ where: { id: sessionId } });

    if (!session || session.creatorId !== uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const participants = parseParticipants(session.participants);
    const workHoursPolicy = parseWorkHoursPolicy(session.workHoursPolicy);

    const rangeStart = DateTime.fromISO(session.rangeFromISO, { zone: 'utc' });
    const rangeEnd = DateTime.fromISO(session.rangeToISO, { zone: 'utc' });

    if (!rangeStart.isValid || !rangeEnd.isValid || rangeStart >= rangeEnd) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
    }

    const candidates: ProposedSlot[] = [];
    let pointer = rangeStart;
    const stepDuration = { minutes: stepMinutes };

    while (
      pointer.plus({ minutes: session.durationMinutes }) <= rangeEnd &&
      candidates.length < maxCandidates
    ) {
      const slotStart = pointer;
      const slotEnd = slotStart.plus({ minutes: session.durationMinutes });

      const breakdown: SlotBreakdown[] = [];
      let totalScore = 0;
      let redCount = 0;

      for (const participant of participants) {
        const localStart = slotStart.setZone(participant.timezone);
        const localEnd = localStart.plus({ minutes: session.durationMinutes });

        let bucket: SlotBreakdown['bucket'] = 'red';
        let score = 0;

        if (localStart.isValid) {
          const hour = localStart.hour + localStart.minute / 60;
          const hourEnd = localEnd.isValid ? localEnd.hour + localEnd.minute / 60 : hour + session.durationMinutes / 60;
          const weekday = localStart.weekday; // 1=Monday, 7=Sunday
          const dayNames: (keyof WorkHours)[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          const dayName = dayNames[weekday - 1];

          // Hard night filter: check before processing (if any participant is outside 07:00-23:00, skip slot)
          if (hardFilterNight && (hour < 7 || hourEnd > 23)) {
            bucket = 'red';
            score = -4;
          } else {
            const participantWorkHours = getWorkHoursForParticipant(participant, workHoursPolicy);
            const dayWorkHours = participantWorkHours[dayName];

            // Weekend check (Sat/Sun with no work hours = red)
            if ((weekday === 6 || weekday === 7) && !dayWorkHours) {
              bucket = 'red';
              score = -3;
            } else if (dayWorkHours) {
              const workStart = parseTime(dayWorkHours.start);
              const workEnd = parseTime(dayWorkHours.end);

              // Night penalties
              if (hour >= 0 && hour < 7) {
                bucket = 'red';
                score = -4;
              } else if (hour >= 22 || hourEnd > 23) {
                bucket = 'red';
                score = -3;
              } else if (hour >= workStart && hourEnd <= workEnd) {
                bucket = 'green';
                score = 2;
              } else if (hour >= 7 && hourEnd <= 22) {
                bucket = 'yellow';
                score = 1;
              } else {
                bucket = 'red';
                score = -3;
              }
            } else {
              // No work hours defined, use default 09-18 Mon-Fri
              if (weekday >= 1 && weekday <= 5) {
                if (hour >= 0 && hour < 7) {
                  bucket = 'red';
                  score = -4;
                } else if (hour >= 22 || hourEnd > 23) {
                  bucket = 'red';
                  score = -3;
                } else if (hour >= 9 && hourEnd <= 18) {
                  bucket = 'green';
                  score = 2;
                } else if (hour >= 7 && hourEnd <= 22) {
                  bucket = 'yellow';
                  score = 1;
                } else {
                  bucket = 'red';
                  score = -3;
                }
              } else {
                bucket = 'red';
                score = -3;
              }
            }
          }
        }

        if (bucket === 'red') {
          redCount++;
        }

        totalScore += score;

        breakdown.push({
          name: participant.name,
          timezone: participant.timezone,
          localStart: localStart.isValid ? localStart.toISO() : slotStart.toISO(),
          localEnd: localEnd.isValid ? localEnd.toISO() : slotEnd.toISO(),
          bucket,
        });
      }

      // Fairness penalty: if 2+ users have red bucket, subtract 2 from score
      if (fairness && redCount >= 2) {
        totalScore -= 2;
      }

      // Skip slot if hard filter excluded all participants (breakdown is empty)
      // Also skip if hardFilterNight is enabled and any participant is outside 07:00-23:00
      if (breakdown.length === 0 || (hardFilterNight && breakdown.some((b) => b.bucket === 'red' && totalScore < -3))) {
        pointer = pointer.plus(stepDuration);
        continue;
      }

      candidates.push({
        startUtcISO: slotStart.toUTC().toISO(),
        endUtcISO: slotEnd.toUTC().toISO(),
        score: totalScore,
        breakdown,
      });

      pointer = pointer.plus(stepDuration);
    }

    const sorted = [...candidates].sort((a, b) => b.score - a.score);
    const topSlots = sorted.slice(0, topN);

    await prisma.meetingSession.update({
      where: { id: sessionId },
      data: {
        proposedSlots: stringifySlots(topSlots),
      },
    });

    return NextResponse.json({ proposedSlots: topSlots });
  } catch (error) {
    console.error('Generate slots failed', error);
    return NextResponse.json({ error: 'Failed to generate slots' }, { status: 500 });
  }
}


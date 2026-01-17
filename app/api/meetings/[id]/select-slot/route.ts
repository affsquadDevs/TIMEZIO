import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import {
  parseSlots,
  serializeSession,
  stringifySelectedSlot,
  SelectedSlot,
} from '@/lib/meeting';

export const runtime = 'nodejs';

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

  let body: SelectedSlot;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { startUtcISO, endUtcISO } = body;

  if (!startUtcISO || !endUtcISO) {
    return NextResponse.json({ error: 'startUtcISO and endUtcISO are required' }, { status: 400 });
  }

  try {
    const session = await prisma.meetingSession.findUnique({ where: { id: sessionId } });

    if (!session || session.creatorId !== uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const slots = parseSlots(session.proposedSlots);
    const matching = slots.length > 0
      ? slots.find((slot) => slot.startUtcISO === startUtcISO && slot.endUtcISO === endUtcISO)
      : null;

    const startDt = new Date(startUtcISO);
    const endDt = new Date(endUtcISO);
    const rangeFrom = new Date(session.rangeFromISO);
    const rangeTo = new Date(session.rangeToISO);

    if (isNaN(startDt.getTime()) || isNaN(endDt.getTime())) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    if (startDt >= endDt) {
      return NextResponse.json({ error: 'Start time must be before end time' }, { status: 400 });
    }

    if (rangeFrom && rangeTo && (startDt < rangeFrom || endDt > rangeTo)) {
      return NextResponse.json({ error: 'Slot is outside the allowed date range' }, { status: 400 });
    }

    if (slots.length > 0 && !matching) {
      console.warn(`Slot ${startUtcISO} not found in proposedSlots, but allowing selection (Manual mode or frontend-generated)`);
    }

    const selectedSlot: SelectedSlot = { startUtcISO, endUtcISO };

    const updated = await prisma.meetingSession.update({
      where: { id: sessionId },
      data: {
        selectedSlot: stringifySelectedSlot(selectedSlot),
      },
    });

    return NextResponse.json(serializeSession(updated));
  } catch (error) {
    console.error('Select slot failed', error);
    return NextResponse.json({ error: 'Failed to select slot' }, { status: 500 });
  }
}


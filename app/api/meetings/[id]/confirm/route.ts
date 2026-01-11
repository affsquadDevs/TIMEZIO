import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import {
  ConfirmedEvent,
  parseParticipants,
  parseSelectedSlot,
  serializeSession,
  stringifyConfirmedEvent,
} from '@/lib/meeting';
import { createMeetEvent } from '@/lib/google';

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

  try {
    const session = await prisma.meetingSession.findUnique({ where: { id: sessionId } });

    if (!session || session.creatorId !== uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const selectedSlot = parseSelectedSlot(session.selectedSlot);

    if (!selectedSlot) {
      return NextResponse.json({ error: 'No slot selected' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: uid } });

    if (!user || !user.refreshToken) {
      return NextResponse.json({ error: 'Google not connected' }, { status: 400 });
    }

    const participants = parseParticipants(session.participants);
    const attendees = participants
      .map((participant) => participant.email)
      .filter((email): email is string => typeof email === 'string' && email.length > 0);

    const meetEvent = await createMeetEvent({
      refreshToken: user.refreshToken,
      title: session.title,
      description: session.description ?? undefined,
      startUtcISO: selectedSlot.startUtcISO,
      endUtcISO: selectedSlot.endUtcISO,
      attendees,
    });

    if (!meetEvent.eventId || !meetEvent.meetLink) {
      return NextResponse.json({ error: 'Failed to create Meet event' }, { status: 500 });
    }

    const confirmedEvent: ConfirmedEvent = {
      eventId: meetEvent.eventId,
      meetLink: meetEvent.meetLink,
      startUtcISO: selectedSlot.startUtcISO,
      endUtcISO: selectedSlot.endUtcISO,
    };

    const updated = await prisma.meetingSession.update({
      where: { id: sessionId },
      data: {
        confirmedEvent: stringifyConfirmedEvent(confirmedEvent),
      },
    });

    return NextResponse.json(serializeSession(updated).confirmedEvent);
  } catch (error) {
    console.error('Confirm meeting failed', error);
    return NextResponse.json({ error: 'Failed to confirm meeting' }, { status: 500 });
  }
}


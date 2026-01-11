import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import {
  parsePollVotes,
  parseSlots,
  parseParticipants,
  stringifySelectedSlot,
  stringifyConfirmedEvent,
  type ConfirmedEvent,
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

    if (session.mode !== 'poll') {
      return NextResponse.json({ error: 'Session is not in poll mode' }, { status: 400 });
    }

    const pollVotes = parsePollVotes(session.pollVotes);
    if (!pollVotes || pollVotes.slots.length === 0) {
      return NextResponse.json({ error: 'No votes found' }, { status: 400 });
    }

    const proposedSlots = parseSlots(session.proposedSlots);

    // Find slot with most "yes" votes, tie-break by score
    let bestSlot = pollVotes.slots[0];
    let bestYesCount = Object.values(bestSlot.votes).filter((v) => v === 'yes').length;

    for (const slot of pollVotes.slots) {
      const yesCount = Object.values(slot.votes).filter((v) => v === 'yes').length;
      if (yesCount > bestYesCount) {
        bestSlot = slot;
        bestYesCount = yesCount;
      } else if (yesCount === bestYesCount) {
        // Tie-break: use score from proposedSlots
        const slotScore = proposedSlots.find(
          (s) => s.startUtcISO === slot.startUtcISO && s.endUtcISO === slot.endUtcISO
        )?.score ?? 0;
        const currentScore = proposedSlots.find(
          (s) => s.startUtcISO === bestSlot.startUtcISO && s.endUtcISO === bestSlot.endUtcISO
        )?.score ?? 0;

        if (slotScore > currentScore) {
          bestSlot = slot;
        }
      }
    }

    const selectedSlot = {
      startUtcISO: bestSlot.startUtcISO,
      endUtcISO: bestSlot.endUtcISO,
    };

    // Get creator user for refresh token
    const creator = await prisma.user.findUnique({ where: { id: session.creatorId } });
    if (!creator || !creator.refreshToken) {
      return NextResponse.json({ error: 'Organizer not connected' }, { status: 400 });
    }

    // Get participants for attendees
    const participants = parseParticipants(session.participants);
    const attendees = participants.filter((p) => p.email).map((p) => p.email!);

    // Create Meet event
    const meetResult = await createMeetEvent({
      refreshToken: creator.refreshToken,
      title: session.title,
      description: session.description,
      startUtcISO: selectedSlot.startUtcISO,
      endUtcISO: selectedSlot.endUtcISO,
      attendees,
      requestId: `poll-${Date.now()}`,
    });

    if (!meetResult.eventId || !meetResult.meetLink) {
      return NextResponse.json({ error: 'Failed to create Meet event' }, { status: 500 });
    }

    const confirmedEvent: ConfirmedEvent = {
      eventId: meetResult.eventId,
      meetLink: meetResult.meetLink,
      startUtcISO: selectedSlot.startUtcISO,
      endUtcISO: selectedSlot.endUtcISO,
    };

    // Update session
    await prisma.meetingSession.update({
      where: { id: sessionId },
      data: {
        selectedSlot: stringifySelectedSlot(selectedSlot),
        confirmedEvent: stringifyConfirmedEvent(confirmedEvent),
      },
    });

    return NextResponse.json({ confirmedEvent, selectedSlot });
  } catch (error) {
    console.error('Confirm best poll slot failed', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to confirm best slot';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


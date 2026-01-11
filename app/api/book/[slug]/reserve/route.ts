import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import {
  parseSlots,
  parseParticipants,
  stringifyParticipants,
  stringifySelectedSlot,
} from '@/lib/meeting';
import { createMeetEvent } from '@/lib/google';

export const runtime = 'nodejs';

type ReserveBody = {
  slot: {
    startUtcISO: string;
    endUtcISO: string;
  };
  name: string;
  email: string;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  let body: ReserveBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slot, name, email } = body;

  if (!slot?.startUtcISO || !slot?.endUtcISO || !name || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const session = await prisma.meetingSession.findUnique({
      where: { bookingSlug: slug, mode: 'booking' },
    });

    if (!session) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Check if already confirmed
    if (session.confirmedEvent) {
      return NextResponse.json(
        { error: 'This meeting has already been reserved' },
        { status: 409 }
      );
    }

    // Validate slot exists in proposedSlots
    const proposedSlots = parseSlots(session.proposedSlots);
    const slotExists = proposedSlots.some(
      (s) => s.startUtcISO === slot.startUtcISO && s.endUtcISO === slot.endUtcISO
    );

    if (!slotExists) {
      return NextResponse.json({ error: 'Invalid slot' }, { status: 400 });
    }

    // Get creator user for refresh token
    const creator = await prisma.user.findUnique({ where: { id: session.creatorId } });
    if (!creator || !creator.refreshToken) {
      return NextResponse.json({ error: 'Organizer not connected' }, { status: 400 });
    }

    // Add participant if email doesn't exist
    const participants = parseParticipants(session.participants);
    const existingParticipant = participants.find((p) => p.email === email);
    if (!existingParticipant) {
      participants.push({
        name,
        email,
        timezone: 'UTC',
        location: { lat: 0, lng: 0 },
      });
    }

    // Set selected slot
    const selectedSlot = { startUtcISO: slot.startUtcISO, endUtcISO: slot.endUtcISO };

    // Create Meet event
    const attendees = participants.filter((p) => p.email).map((p) => p.email!);
    const meetResult = await createMeetEvent({
      refreshToken: creator.refreshToken,
      title: session.title,
      description: session.description,
      startUtcISO: slot.startUtcISO,
      endUtcISO: slot.endUtcISO,
      attendees,
      requestId: `booking-${Date.now()}`,
    });

    if (!meetResult.eventId || !meetResult.meetLink) {
      return NextResponse.json({ error: 'Failed to create Meet event' }, { status: 500 });
    }

    const confirmedEvent = {
      eventId: meetResult.eventId,
      meetLink: meetResult.meetLink,
      startUtcISO: slot.startUtcISO,
      endUtcISO: slot.endUtcISO,
    };

    // Update session
    await prisma.meetingSession.update({
      where: { id: session.id },
      data: {
        participants: stringifyParticipants(participants),
        selectedSlot: stringifySelectedSlot(selectedSlot),
        confirmedEvent: JSON.stringify(confirmedEvent),
      },
    });

    return NextResponse.json({
      meetLink: meetResult.meetLink,
      eventId: meetResult.eventId,
      confirmedEvent,
    });
  } catch (error) {
    console.error('Reserve booking failed', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to reserve booking';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}


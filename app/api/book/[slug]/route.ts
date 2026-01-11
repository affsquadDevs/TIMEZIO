import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { serializeSession } from '@/lib/meeting';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
  }

  try {
    const session = await prisma.meetingSession.findUnique({
      where: { bookingSlug: slug, mode: 'booking' },
    });

    if (!session) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const serialized = serializeSession(session);

    // Public response - exclude sensitive data
    return NextResponse.json({
      id: session.id,
      title: session.title,
      description: session.description,
      durationMinutes: session.durationMinutes,
      rangeFromISO: session.rangeFromISO,
      rangeToISO: session.rangeToISO,
      proposedSlots: serialized.proposedSlots,
      participants: serialized.participants.map((p) => ({
        name: p.name,
        timezone: p.timezone,
        location: p.location,
      })),
      confirmedEvent: serialized.confirmedEvent ? {
        eventId: serialized.confirmedEvent.eventId,
        meetLink: serialized.confirmedEvent.meetLink,
        startUtcISO: serialized.confirmedEvent.startUtcISO,
        endUtcISO: serialized.confirmedEvent.endUtcISO,
      } : null,
    });
  } catch (error) {
    console.error('Get booking failed', error);
    return NextResponse.json({ error: 'Failed to get booking' }, { status: 500 });
  }
}


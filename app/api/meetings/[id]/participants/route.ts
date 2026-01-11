import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { parseParticipants, serializeSession, stringifyParticipants } from '@/lib/meeting';

export const runtime = 'nodejs';

type AddParticipantBody = {
  name: string;
  email?: string;
  timezone: string;
  location: {
    lat: number | string;
    lng: number | string;
    city?: string;
    countryCode?: string;
  };
};

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

  let body: AddParticipantBody;
  try {
    body = (await request.json()) as AddParticipantBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { name, email, timezone, location } = body;

  if (!name || !timezone || !location) {
    return NextResponse.json({ error: 'name, timezone, and location are required' }, { status: 400 });
  }

  const lat = Number(location.lat);
  const lng = Number(location.lng);

  if (Number.isNaN(lat) || lat < -90 || lat > 90) {
    return NextResponse.json({ error: 'Invalid latitude' }, { status: 400 });
  }

  if (Number.isNaN(lng) || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'Invalid longitude' }, { status: 400 });
  }

  try {
    const session = await prisma.meetingSession.findUnique({ where: { id: sessionId } });
    if (!session || session.creatorId !== uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const existing = parseParticipants(session.participants);
    const newParticipant = {
      name,
      email: email ?? undefined,
      timezone,
      location: {
        lat,
        lng,
        city: location.city,
        countryCode: location.countryCode,
      },
    };

    const updatedSession = await prisma.meetingSession.update({
      where: { id: sessionId },
      data: {
        participants: stringifyParticipants([...existing, newParticipant]),
      },
    });

    return NextResponse.json(serializeSession(updatedSession));
  } catch (error) {
    console.error('Add participant failed', error);
    return NextResponse.json({ error: 'Failed to add participant' }, { status: 500 });
  }
}


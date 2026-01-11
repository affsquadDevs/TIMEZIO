import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { serializeSession } from '@/lib/meeting';

export const runtime = 'nodejs';

type CreateMeetingBody = {
  title: string;
  description?: string;
  durationMinutes: number;
  rangeFromISO: string;
  rangeToISO: string;
};

export async function POST(request: NextRequest) {
  const uid = request.cookies.get('uid')?.value;

  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateMeetingBody;
  try {
    body = (await request.json()) as CreateMeetingBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, description, durationMinutes, rangeFromISO, rangeToISO } = body;

  if (!title || !rangeFromISO || !rangeToISO || !durationMinutes) {
    return NextResponse.json(
      { error: 'Missing required fields: title, durationMinutes, rangeFromISO, rangeToISO' },
      { status: 400 }
    );
  }

  const duration = Number(durationMinutes);
  if (Number.isNaN(duration) || duration <= 0) {
    return NextResponse.json({ error: 'durationMinutes must be a positive number' }, { status: 400 });
  }

  try {
    const session = await prisma.meetingSession.create({
      data: {
        creatorId: uid,
        title,
        description: description ?? null,
        durationMinutes: Math.floor(duration),
        rangeFromISO,
        rangeToISO,
        participants: '[]',
      },
    });

    return NextResponse.json(serializeSession(session));
  } catch (error) {
    console.error('Create meeting session failed', error);
    return NextResponse.json({ error: 'Failed to create meeting session' }, { status: 500 });
  }
}


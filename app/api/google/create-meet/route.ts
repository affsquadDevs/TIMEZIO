import { NextRequest, NextResponse } from 'next/server';

import { createMeetEvent } from '@/lib/google';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

type CreateMeetRequest = {
  title: string;
  description?: string;
  startUtcISO: string;
  endUtcISO: string;
  attendees?: string[];
};

export async function POST(request: NextRequest) {
  const uid = request.cookies.get('uid')?.value;

  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreateMeetRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { title, description, startUtcISO, endUtcISO, attendees = [] } = body;

  if (!title || !startUtcISO || !endUtcISO) {
    return NextResponse.json(
      { error: 'Missing required fields: title, startUtcISO, endUtcISO' },
      { status: 400 }
    );
  }

  if (attendees && !Array.isArray(attendees)) {
    return NextResponse.json({ error: 'attendees must be an array of strings' }, { status: 400 });
  }

  if (attendees.some((email) => typeof email !== 'string')) {
    return NextResponse.json({ error: 'All attendees must be strings' }, { status: 400 });
  }

  const startDate = new Date(startUtcISO);
  const endDate = new Date(endUtcISO);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
  }

  if (startDate >= endDate) {
    return NextResponse.json({ error: 'startUtcISO must be before endUtcISO' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: uid } });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    if (!user.refreshToken) {
      return NextResponse.json({ error: 'Google not connected' }, { status: 400 });
    }

    const event = await createMeetEvent({
      refreshToken: user.refreshToken,
      title,
      description,
      startUtcISO,
      endUtcISO,
      attendees,
    });

    return NextResponse.json(event);
  } catch (error: unknown) {
    console.error('Create Meet failed', error);

    const message = error instanceof Error ? error.message : 'Failed to create Meet event';
    let details: unknown = null;

    if (error && typeof error === 'object' && 'response' in error) {
      const response = (error as { response?: { data?: unknown } }).response;
      details = response?.data ?? null;
    }

    return NextResponse.json(
      {
        error: message,
        ...(details && typeof details === 'object' && details !== null ? { details } : {}),
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { serializeSession } from '@/lib/meeting';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session id' }, { status: 400 });
  }

  try {
    const session = await prisma.meetingSession.findUnique({
      where: { id: sessionId, mode: 'poll' },
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
      pollVotes: serialized.pollVotes,
      proposedSlots: serialized.proposedSlots,
    });
  } catch (error) {
    console.error('Get poll failed', error);
    return NextResponse.json({ error: 'Failed to get poll' }, { status: 500 });
  }
}


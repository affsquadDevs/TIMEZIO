import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { serializeSession } from '@/lib/meeting';

export const runtime = 'nodejs';

export async function GET(
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

    return NextResponse.json(serializeSession(session));
  } catch (error) {
    console.error('Fetch meeting session failed', error);
    return NextResponse.json({ error: 'Failed to load meeting session' }, { status: 500 });
  }
}

export async function PATCH(
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

  let body: { mode?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const session = await prisma.meetingSession.findUnique({ where: { id: sessionId } });

    if (!session || session.creatorId !== uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updateData: { mode?: string } = {};
    if (body.mode && ['instant', 'poll', 'booking'].includes(body.mode)) {
      updateData.mode = body.mode;
    }

    const updated = await prisma.meetingSession.update({
      where: { id: sessionId },
      data: updateData,
    });

    return NextResponse.json(serializeSession(updated));
  } catch (error) {
    console.error('Update meeting session failed', error);
    return NextResponse.json({ error: 'Failed to update meeting session' }, { status: 500 });
  }
}


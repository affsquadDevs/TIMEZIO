import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

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

    if (!session.proposedSlots || session.proposedSlots.trim() === '') {
      return NextResponse.json({ error: 'Generate slots first' }, { status: 400 });
    }

    const slug = nanoid(10);
    const baseUrl = process.env.APP_BASE_URL || request.nextUrl.origin;
    const publicUrl = `${baseUrl}/book/${slug}`;

    await prisma.meetingSession.update({
      where: { id: sessionId },
      data: {
        mode: 'booking',
        bookingSlug: slug,
      },
    });

    return NextResponse.json({ publicUrl, slug });
  } catch (error) {
    console.error('Enable booking failed', error);
    return NextResponse.json({ error: 'Failed to enable booking' }, { status: 500 });
  }
}


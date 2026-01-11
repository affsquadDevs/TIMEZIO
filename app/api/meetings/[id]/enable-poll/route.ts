import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { parseSlots, stringifyPollVotes, type PollVotes } from '@/lib/meeting';

export const runtime = 'nodejs';

type EnablePollBody = {
  topN?: number;
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

  let body: EnablePollBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const topN = body.topN ?? 8;

  try {
    const session = await prisma.meetingSession.findUnique({ where: { id: sessionId } });

    if (!session || session.creatorId !== uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const proposedSlots = parseSlots(session.proposedSlots);

    if (!proposedSlots || proposedSlots.length === 0) {
      return NextResponse.json({ error: 'Generate slots first' }, { status: 400 });
    }

    // Initialize pollVotes with topN slots
    const slotsForPoll = proposedSlots.slice(0, topN);
    const pollVotes: PollVotes = {
      slots: slotsForPoll.map((slot) => ({
        startUtcISO: slot.startUtcISO,
        endUtcISO: slot.endUtcISO,
        votes: {},
      })),
    };

    await prisma.meetingSession.update({
      where: { id: sessionId },
      data: {
        mode: 'poll',
        pollVotes: stringifyPollVotes(pollVotes),
      },
    });

    const baseUrl = process.env.APP_BASE_URL || request.nextUrl.origin;
    const publicUrl = `${baseUrl}/poll/${sessionId}`;

    return NextResponse.json({ publicUrl, pollVotes });
  } catch (error) {
    console.error('Enable poll failed', error);
    return NextResponse.json({ error: 'Failed to enable poll' }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { parsePollVotes, stringifyPollVotes, type PollVoteValue } from '@/lib/meeting';

export const runtime = 'nodejs';

type VoteBody = {
  voterName: string;
  voterEmail: string;
  votes: Array<{
    startUtcISO: string;
    endUtcISO: string;
    value: PollVoteValue;
  }>;
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params;
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session id' }, { status: 400 });
  }

  let body: VoteBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { voterName, voterEmail, votes } = body;

  if (!voterName || !voterEmail || !votes || !Array.isArray(votes)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const session = await prisma.meetingSession.findUnique({
      where: { id: sessionId, mode: 'poll' },
    });

    if (!session) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const pollVotes = parsePollVotes(session.pollVotes);
    if (!pollVotes) {
      return NextResponse.json({ error: 'Poll not initialized' }, { status: 400 });
    }

    // Update votes for each slot (create a new object to avoid mutation)
    const updatedPollVotes = {
      ...pollVotes,
      slots: pollVotes.slots.map((slot) => {
        const matchingVote = votes.find(
          (v) => v.startUtcISO === slot.startUtcISO && v.endUtcISO === slot.endUtcISO
        );
        if (matchingVote) {
          return {
            ...slot,
            votes: {
              ...slot.votes,
              [voterEmail]: matchingVote.value,
            },
          };
        }
        return slot;
      }),
    };

    // Update session
    await prisma.meetingSession.update({
      where: { id: sessionId },
      data: {
        pollVotes: stringifyPollVotes(updatedPollVotes),
      },
    });

    return NextResponse.json({ pollVotes: updatedPollVotes });
  } catch (error) {
    console.error('Vote failed', error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}


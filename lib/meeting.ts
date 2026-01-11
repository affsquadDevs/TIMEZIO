import { MeetingSession } from '@prisma/client';

export type ParticipantLocation = {
  lat: number;
  lng: number;
  city?: string;
  countryCode?: string;
};

export type WorkHoursDay = {
  start: string;
  end: string;
} | null;

export type WorkHours = {
  mon?: WorkHoursDay;
  tue?: WorkHoursDay;
  wed?: WorkHoursDay;
  thu?: WorkHoursDay;
  fri?: WorkHoursDay;
  sat?: WorkHoursDay;
  sun?: WorkHoursDay;
};

export type Participant = {
  name: string;
  email?: string;
  timezone: string;
  location: ParticipantLocation;
  workHours?: WorkHours;
};

export type PollVoteValue = 'yes' | 'maybe' | 'no';

export type PollSlotVote = {
  startUtcISO: string;
  endUtcISO: string;
  votes: Record<string, PollVoteValue>;
};

export type PollVotes = {
  slots: PollSlotVote[];
};

export type WorkHoursPolicy = {
  defaultStart: string;
  defaultEnd: string;
  weekendOff: boolean;
};

export type SlotBreakdown = {
  name: string;
  timezone: string;
  localStart: string;
  localEnd: string;
  bucket: 'green' | 'yellow' | 'red';
};

export type ProposedSlot = {
  startUtcISO: string;
  endUtcISO: string;
  score: number;
  breakdown: SlotBreakdown[];
};

export type SelectedSlot = {
  startUtcISO: string;
  endUtcISO: string;
};

export type ConfirmedEvent = {
  eventId: string;
  meetLink: string;
  startUtcISO: string;
  endUtcISO: string;
};

export type MeetingSessionPayload = Omit<
  MeetingSession,
  'participants' | 'proposedSlots' | 'selectedSlot' | 'confirmedEvent' | 'pollVotes' | 'workHoursPolicy'
> & {
  participants: Participant[];
  proposedSlots: ProposedSlot[];
  selectedSlot: SelectedSlot | null;
  confirmedEvent: ConfirmedEvent | null;
  pollVotes: PollVotes | null;
  workHoursPolicy: WorkHoursPolicy | null;
};

export function parseParticipants(value?: string | null): Participant[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fall through
  }

  return [];
}

export function stringifyParticipants(participants: Participant[]): string {
  return JSON.stringify(participants);
}

export function parseSlots(value?: string | null): ProposedSlot[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fall through
  }

  return [];
}

export function stringifySlots(slots: ProposedSlot[]): string {
  return JSON.stringify(slots);
}

export function parseSelectedSlot(value?: string | null): SelectedSlot | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed?.startUtcISO && parsed?.endUtcISO) {
      return parsed;
    }
  } catch {
    // fall through
  }

  return null;
}

export function stringifySelectedSlot(slot: SelectedSlot | null): string | null {
  return slot ? JSON.stringify(slot) : null;
}

export function parseConfirmedEvent(value?: string | null): ConfirmedEvent | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed?.eventId && parsed?.meetLink) {
      return parsed;
    }
  } catch {
    // fall through
  }

  return null;
}

export function stringifyConfirmedEvent(event: ConfirmedEvent | null): string | null {
  return event ? JSON.stringify(event) : null;
}

export function parsePollVotes(value?: string | null): PollVotes | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed?.slots && Array.isArray(parsed.slots)) {
      return parsed;
    }
  } catch {
    // fall through
  }

  return null;
}

export function stringifyPollVotes(votes: PollVotes | null): string | null {
  return votes ? JSON.stringify(votes) : null;
}

export function parseWorkHoursPolicy(value?: string | null): WorkHoursPolicy | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed?.defaultStart && parsed?.defaultEnd) {
      return parsed;
    }
  } catch {
    // fall through
  }

  return null;
}

export function stringifyWorkHoursPolicy(policy: WorkHoursPolicy | null): string | null {
  return policy ? JSON.stringify(policy) : null;
}

export function getDefaultWorkHours(): WorkHours {
  return {
    mon: { start: '09:00', end: '18:00' },
    tue: { start: '09:00', end: '18:00' },
    wed: { start: '09:00', end: '18:00' },
    thu: { start: '09:00', end: '18:00' },
    fri: { start: '09:00', end: '18:00' },
    sat: null,
    sun: null,
  };
}

export function getWorkHoursForParticipant(
  participant: Participant,
  policy: WorkHoursPolicy | null
): WorkHours {
  if (participant.workHours) {
    return participant.workHours;
  }

  if (policy) {
    const defaultHours: WorkHours = {
      mon: { start: policy.defaultStart, end: policy.defaultEnd },
      tue: { start: policy.defaultStart, end: policy.defaultEnd },
      wed: { start: policy.defaultStart, end: policy.defaultEnd },
      thu: { start: policy.defaultStart, end: policy.defaultEnd },
      fri: { start: policy.defaultStart, end: policy.defaultEnd },
      sat: policy.weekendOff ? null : { start: policy.defaultStart, end: policy.defaultEnd },
      sun: policy.weekendOff ? null : { start: policy.defaultStart, end: policy.defaultEnd },
    };
    return defaultHours;
  }

  return getDefaultWorkHours();
}

export function serializeSession(session: MeetingSession): MeetingSessionPayload {
  return {
    ...session,
    participants: parseParticipants(session.participants),
    proposedSlots: parseSlots(session.proposedSlots),
    selectedSlot: parseSelectedSlot(session.selectedSlot),
    confirmedEvent: parseConfirmedEvent(session.confirmedEvent),
    pollVotes: parsePollVotes(session.pollVotes),
    workHoursPolicy: parseWorkHoursPolicy(session.workHoursPolicy),
  };
}


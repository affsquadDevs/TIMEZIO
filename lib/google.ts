import { google, type calendar_v3 } from 'googleapis';

export function getOAuthClient() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
    throw new Error('Missing Google OAuth environment variables');
  }

  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
}

function extractMeetLink(event?: calendar_v3.Schema$Event | null) {
  return (
    event?.hangoutLink ??
    event?.conferenceData?.entryPoints?.find(
      (entry) => entry?.entryPointType === 'video'
    )?.uri ??
    null
  );
}

export type CreateMeetParams = {
  refreshToken: string;
  title: string;
  description?: string | null;
  startUtcISO: string;
  endUtcISO: string;
  attendees?: string[];
  requestId?: string;
};

export async function createMeetEvent(params: CreateMeetParams) {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ refresh_token: params.refreshToken });
  const { credentials } = await oauth2Client.refreshAccessToken();
  oauth2Client.setCredentials({
    access_token: credentials.access_token ?? undefined,
    refresh_token: params.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const event = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: {
      summary: params.title,
      description: params.description,
      start: {
        dateTime: params.startUtcISO,
        timeZone: 'UTC',
      },
      end: {
        dateTime: params.endUtcISO,
        timeZone: 'UTC',
      },
      attendees: (params.attendees ?? []).map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: params.requestId ?? `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    },
  });

  return {
    meetLink: extractMeetLink(event.data),
    eventId: event.data.id,
  };
}


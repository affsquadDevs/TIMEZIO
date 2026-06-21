import { google, type calendar_v3 } from 'googleapis';
import { SITE_URL } from '@/lib/site';

// In production the redirect URI is derived from the canonical www host, so the
// only required env vars are the client id + secret. GOOGLE_REDIRECT_URI is only
// consulted for local development (e.g. http://localhost:3000/...).
function resolveRedirectUri(explicit?: string): string {
  if (explicit) return explicit;
  if (process.env.NODE_ENV === 'production') return `${SITE_URL}/api/auth/google/callback`;
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback';
}

export function getOAuthClient(redirectUri?: string) {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

  const missing: string[] = [];
  if (!GOOGLE_CLIENT_ID) missing.push('GOOGLE_CLIENT_ID');
  if (!GOOGLE_CLIENT_SECRET) missing.push('GOOGLE_CLIENT_SECRET');
  if (missing.length) {
    throw new Error(`Missing Google OAuth environment variables: ${missing.join(', ')}`);
  }

  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, resolveRedirectUri(redirectUri));
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


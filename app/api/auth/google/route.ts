import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { getOAuthClient } from '@/lib/google';

export const runtime = 'nodejs';

const OAUTH_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/calendar.events',
];

const STATE_COOKIE = 'oauth_state';

function createState() {
  return crypto.randomBytes(16).toString('hex');
}

export async function GET(request: NextRequest) {
  try {
    const oauth2Client = getOAuthClient();
    const state = createState();

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: OAUTH_SCOPES,
      state,
    });

    const response = NextResponse.redirect(url);
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set(STATE_COOKIE, state, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth init failed', error);
    // Temporary diagnostic: ?diag=1 returns presence booleans only (never values).
    if (request.nextUrl.searchParams.get('diag') === '1') {
      return NextResponse.json(
        {
          error: 'OAuth init failed',
          message: error instanceof Error ? error.message : String(error),
          present: {
            GOOGLE_CLIENT_ID: Boolean(process.env.GOOGLE_CLIENT_ID),
            GOOGLE_CLIENT_SECRET: Boolean(process.env.GOOGLE_CLIENT_SECRET),
            GOOGLE_REDIRECT_URI: Boolean(process.env.GOOGLE_REDIRECT_URI),
            DATABASE_URL: Boolean(process.env.DATABASE_URL),
          },
          nodeEnv: process.env.NODE_ENV,
        },
        { status: 500 }
      );
    }
    return NextResponse.json({ error: 'OAuth init failed' }, { status: 500 });
  }
}


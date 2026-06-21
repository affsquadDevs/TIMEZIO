import crypto from 'crypto';
import { NextResponse } from 'next/server';

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

export async function GET() {
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
    return NextResponse.json({ error: 'OAuth init failed' }, { status: 500 });
  }
}


import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

import { getOAuthClient } from '@/lib/google';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

const STATE_COOKIE = 'oauth_state';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const storedState = request.cookies.get(STATE_COOKIE)?.value;

  if (!code) {
    return NextResponse.json({ error: 'Missing code' }, { status: 400 });
  }

  if (!storedState || storedState !== state) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const { data: profile } = await oauth2.userinfo.get();

    const email = profile.email;
    const googleId = profile.id ?? null;
    const name = profile.name ?? profile.given_name ?? null;

    if (!email || !googleId) {
      return NextResponse.json({ error: 'Unable to read Google profile' }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name: name ?? undefined,
        googleId,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
      },
      create: {
        email,
        name,
        googleId,
        refreshToken: tokens.refresh_token ?? null,
      },
    });

    const response = NextResponse.redirect(new URL('/meeting-planner', request.nextUrl.origin));
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('uid', user.id, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    response.cookies.delete(STATE_COOKIE);

    return response;
  } catch (error) {
    console.error('Google OAuth callback failed', error);
    return NextResponse.json({ error: 'OAuth callback failed' }, { status: 500 });
  }
}


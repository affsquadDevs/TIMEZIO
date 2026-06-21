import { NextRequest, NextResponse } from 'next/server';
import { getAllSiteUrls, submitUrls } from '@/lib/indexnow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Submission is gated by INDEXNOW_SECRET so the endpoint can't be abused to spam
// search engines with submissions on our behalf. It stays closed until that env
// var is set. Pass the secret via ?secret=, an x-indexnow-secret header, or an
// Authorization: Bearer <secret> header (works with Vercel Cron + CRON_SECRET).
function authorized(request: NextRequest): boolean {
  const secret = process.env.INDEXNOW_SECRET;
  if (!secret) return false;
  const q = request.nextUrl.searchParams.get('secret');
  const h = request.headers.get('x-indexnow-secret');
  const bearer = request.headers.get('authorization');
  return q === secret || h === secret || bearer === `Bearer ${secret}`;
}

async function handle(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized. Set INDEXNOW_SECRET and pass it via ?secret= or x-indexnow-secret.' },
      { status: 401 }
    );
  }

  // POST { "urls": [...] } submits a specific set; otherwise submit the whole site.
  let urls: string[] | undefined;
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      if (Array.isArray(body?.urls)) urls = body.urls.filter((u: unknown): u is string => typeof u === 'string');
    } catch {
      /* no/invalid body → submit all */
    }
  }

  const list = urls && urls.length ? urls : getAllSiteUrls();
  const result = await submitUrls(list);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function GET(request: NextRequest) {
  return handle(request);
}
export async function POST(request: NextRequest) {
  return handle(request);
}

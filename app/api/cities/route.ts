import { NextResponse } from 'next/server';

type ApiCity = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  tz: string;
};

type OpenMeteoResp = {
  results?: Array<{
    id?: number | string;
    name: string;
    country?: string;
    country_code?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
    timezone: string;
  }>;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 8) || 8, 1), 12);

  if (q.length < 2) {
    return NextResponse.json({ results: [] satisfies ApiCity[] }, { headers: { 'Cache-Control': 'no-store' } });
  }

  // Free geocoding API (no key) with timezone included.
  // Docs: https://open-meteo.com/en/docs/geocoding-api
  const upstream = new URL('https://geocoding-api.open-meteo.com/v1/search');
  upstream.searchParams.set('name', q);
  upstream.searchParams.set('count', String(limit));
  upstream.searchParams.set('language', 'en');
  upstream.searchParams.set('format', 'json');

  const res = await fetch(upstream.toString(), {
    // Avoid caching in dev and keep results fresh.
    cache: 'no-store',
  });

  if (!res.ok) {
    return NextResponse.json(
      { results: [] satisfies ApiCity[], error: `Upstream error (${res.status})` },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const data = (await res.json()) as OpenMeteoResp;
  const results: ApiCity[] = (data.results ?? []).map((r) => {
    const labelParts = [
      r.name,
      r.admin1 ? r.admin1 : null,
      r.country_code ? r.country_code.toUpperCase() : r.country ? r.country : null,
    ].filter(Boolean) as string[];

    const label = labelParts.join(', ');
    const lat = r.latitude;
    const lng = r.longitude;
    const tz = r.timezone;
    const id = `${tz}:${lat.toFixed(4)},${lng.toFixed(4)}`;

    return { id, label, lat, lng, tz };
  });

  return NextResponse.json({ results }, { headers: { 'Cache-Control': 'no-store' } });
}



import type { AppTab, Location } from '@/types/domain';

export type ShareState = {
  tab?: AppTab;
  selectedId?: string;
  locations?: Location[];
  compareIds?: string[];
  compareBaseId?: string | null;
  savedIds?: string[];
};

function packLocation(loc: Location) {
  return {
    id: loc.id,
    label: loc.label,
    lat: +loc.lat.toFixed(6),
    lng: +loc.lng.toFixed(6),
    tz: loc.tz,
    source: loc.source,
    pinned: !!loc.pinned,
  };
}

export function buildShareUrl(state: ShareState) {
  const url = new URL(typeof window !== 'undefined' ? window.location.href : 'https://example.invalid/');
  const params = url.searchParams;
  params.delete('s');

  const payload: ShareState = {
    tab: state.tab,
    selectedId: state.selectedId,
    locations: state.locations?.map(packLocation),
    compareIds: state.compareIds,
    compareBaseId: state.compareBaseId ?? null,
    savedIds: state.savedIds,
  };

  const json = JSON.stringify(payload);
  const b64 = typeof btoa !== 'undefined' ? btoa(unescape(encodeURIComponent(json))) : '';
  const b64url = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  params.set('s', b64url);
  return url.toString();
}

export function parseShareParams(search: string): ShareState | null {
  try {
    const params = new URLSearchParams(search.startsWith('?') ? search : `?${search}`);
    const s = params.get('s');
    if (!s) return null;
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const json = decodeURIComponent(escape(atob(padded)));
    const payload = JSON.parse(json) as ShareState;
    return payload;
  } catch {
    return null;
  }
}





'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

import type { Participant, SelectedSlot } from '@/lib/meeting';

const UPDATE_INTERVAL_MS = 30_000;
const JITTER_STEP = 0.00035;

export function formatLocalNow(timezone: string, reference: DateTime) {
  const local = reference.setZone(timezone);
  return local.isValid ? local.toFormat('HH:mm, dd LLL') : 'Invalid timezone';
}

export function formatSlotForUser(
  startUtcISO: string,
  endUtcISO: string,
  timezone: string
) {
  const start = DateTime.fromISO(startUtcISO, { zone: 'utc' }).setZone(timezone);
  const end = DateTime.fromISO(endUtcISO, { zone: 'utc' }).setZone(timezone);

  if (!start.isValid || !end.isValid) {
    return 'Invalid slot';
  }

  const sameDay = start.hasSame(end, 'day');
  const dayLabel = sameDay ? start.toFormat('dd LLL') : `${start.toFormat('dd LLL')} / ${end.toFormat('dd LLL')}`;
  return `${start.toFormat('HH:mm')}–${end.toFormat('HH:mm')}, ${dayLabel}`;
}

type ParticipantsLayerProps = {
  participants: Participant[];
  selectedSlot?: SelectedSlot | null;
};

type MarkerPayload = {
  key: string;
  participant: Participant;
  position: LatLngExpression;
};

export function ParticipantsLayer({ participants, selectedSlot }: ParticipantsLayerProps) {
  const [now, setNow] = useState(DateTime.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(DateTime.now()), UPDATE_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  const markers = useMemo(() => {
    const seen = new Map<string, number>();

    return participants
      .map((participant) => {
        const lat = Number(participant.location?.lat);
        const lng = Number(participant.location?.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          return null;
        }

        const key = `${lat.toFixed(5)}:${lng.toFixed(5)}`;
        const count = seen.get(key) ?? 0;
        seen.set(key, count + 1);

        const latOffset = ((count % 3) - 1) * JITTER_STEP;
        const lngOffset = (((count + 1) % 3) - 1) * JITTER_STEP;

        return {
          key: `${participant.name}-${participant.timezone}-${count}`,
          participant,
          position: [lat + latOffset, lng + lngOffset] as LatLngExpression,
        };
      })
      .filter((item): item is MarkerPayload => item !== null);
  }, [participants]);

  return (
    <>
      {markers.map(({ key, participant, position }) => {
        const cityLabel = participant.location?.city
          ? `${participant.location.city}${participant.location.countryCode ? `, ${participant.location.countryCode}` : ''}`
          : participant.location?.countryCode ?? '—';

        return (
          <Marker position={position} key={key}>
            <Popup closeButton={false} autoClose={false}>
              <div className="space-y-1 text-sm">
                <div className="font-semibold">{participant.name}</div>
                <div className="text-slate-500">{cityLabel}</div>
                <div>Timezone: {participant.timezone}</div>
                <div>Local time now: {formatLocalNow(participant.timezone, now)}</div>
                {selectedSlot && (
                  <div className="text-xs text-slate-600">
                    Meeting time for you:
                    <br />
                    {formatSlotForUser(
                      selectedSlot.startUtcISO,
                      selectedSlot.endUtcISO,
                      participant.timezone
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}


'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ProposedSlot, ConfirmedEvent } from '@/lib/meeting';

type BookingResponse = {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  rangeFromISO: string;
  rangeToISO: string;
  proposedSlots: ProposedSlot[];
  participants: Array<{ name: string; timezone: string; location: { lat: number; lng: number; city?: string } }>;
  confirmedEvent: ConfirmedEvent | null;
};

export default function BookPage() {
  const t = useTranslations('ui.book');
  const params = useParams();
  const slug = params?.slug as string;
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveForm, setReserveForm] = useState({
    name: '',
    email: '',
    selectedSlot: null as { startUtcISO: string; endUtcISO: string } | null,
  });

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/book/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setBooking(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(t('failedLoadBooking'));
        setLoading(false);
      });
  }, [slug]);

  const formatLocal = (iso: string, timezone: string) => {
    return DateTime.fromISO(iso, { zone: 'utc' })
      .setZone(timezone)
      .toLocaleString(DateTime.DATETIME_MED);
  };

  const formatUtc = (iso: string) => {
    return DateTime.fromISO(iso, { zone: 'utc' }).toLocaleString(DateTime.DATETIME_MED);
  };

  const handleReserve = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!reserveForm.selectedSlot || !reserveForm.name || !reserveForm.email) {
      setError(t('selectSlotProvideInfo'));
      return;
    }

    setReserving(true);

    try {
      const res = await fetch(`/api/book/${slug}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: reserveForm.selectedSlot,
          name: reserveForm.name,
          email: reserveForm.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('failedReserve'));
        return;
      }

      setBooking((prev) => (prev ? { ...prev, confirmedEvent: data.confirmedEvent } : null));
      setMessage(t('slotReserved'));
    } catch (err) {
      setError(t('failedReserveSlot'));
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const userTimezone = DateTime.now().zoneName || 'UTC';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold mb-2">{booking.title}</h1>
        {booking.description && <p className="text-gray-600">{booking.description}</p>}
        <p className="text-sm text-gray-500 mt-2">{t('duration', { minutes: booking.durationMinutes })}</p>
      </div>

      {message && <div className="text-green-600">{message}</div>}
      {error && <div className="text-red-600">{error}</div>}

      {booking.confirmedEvent ? (
        <div className="border rounded-md p-4 bg-green-50">
          <h2 className="text-lg font-semibold mb-2">{t('meetingReserved')}</h2>
          <p>
            <strong>{t('timeLabel')}</strong> {formatUtc(booking.confirmedEvent.startUtcISO)} →{' '}
            {formatUtc(booking.confirmedEvent.endUtcISO)} (UTC)
          </p>
          <p>
            <strong>{t('yourLocalTimeLabel')}</strong>{' '}
            {formatLocal(booking.confirmedEvent.startUtcISO, userTimezone)} →{' '}
            {formatLocal(booking.confirmedEvent.endUtcISO, userTimezone)}
          </p>
          <p className="mt-2">
            <strong>{t('meetLinkLabel')}</strong>{' '}
            <a href={booking.confirmedEvent.meetLink} className="text-blue-600 underline" target="_blank" rel="noreferrer">
              {booking.confirmedEvent.meetLink}
            </a>
          </p>
        </div>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">{t('availableSlots')}</h2>
            {booking.proposedSlots.length === 0 ? (
              <p>{t('noSlots')}</p>
            ) : (
              <div className="space-y-3">
                {booking.proposedSlots.map((slot) => (
                  <div
                    key={slot.startUtcISO}
                    className={`border rounded-md p-3 ${
                      reserveForm.selectedSlot?.startUtcISO === slot.startUtcISO
                        ? 'border-blue-500 bg-blue-50'
                        : 'cursor-pointer hover:bg-gray-50'
                    }`}
                    onClick={() =>
                      setReserveForm((prev) => ({
                        ...prev,
                        selectedSlot: { startUtcISO: slot.startUtcISO, endUtcISO: slot.endUtcISO },
                      }))
                    }
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div>
                          <strong>{t('utcLabel')}</strong> {formatUtc(slot.startUtcISO)} → {formatUtc(slot.endUtcISO)}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <strong>{t('yourTimeLabel', { timezone: userTimezone })}</strong>{' '}
                          {formatLocal(slot.startUtcISO, userTimezone)} →{' '}
                          {formatLocal(slot.endUtcISO, userTimezone)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{t('score', { score: slot.score })}</div>
                      </div>
                      <button
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReserveForm((prev) => ({
                            ...prev,
                            selectedSlot: { startUtcISO: slot.startUtcISO, endUtcISO: slot.endUtcISO },
                          }));
                        }}
                      >
                        {t('select')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {reserveForm.selectedSlot && (
            <section className="space-y-2 border-t pt-4">
              <h2 className="text-xl font-semibold">{t('reserveSlot')}</h2>
              <form className="grid gap-3" onSubmit={handleReserve}>
                <input
                  className="border px-2 py-1"
                  placeholder={t('yourName')}
                  value={reserveForm.name}
                  onChange={(e) => setReserveForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
                <input
                  className="border px-2 py-1"
                  type="email"
                  placeholder={t('yourEmail')}
                  value={reserveForm.email}
                  onChange={(e) => setReserveForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
                <button className="px-4 py-2 bg-green-600 text-white" type="submit" disabled={reserving}>
                  {reserving ? t('reserving') : t('reserveSlotButton')}
                </button>
              </form>
            </section>
          )}
        </>
      )}
    </div>
  );
}


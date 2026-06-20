'use client';

import { FormEvent, useEffect, useState } from 'react';
import { DateTime } from 'luxon';
import { useParams } from 'next/navigation';
import { ProposedSlot, PollVoteValue } from '@/lib/meeting';
import { useTranslations } from 'next-intl';

type PollSlot = {
  startUtcISO: string;
  endUtcISO: string;
  votes: Record<string, PollVoteValue>;
};

type PollResponse = {
  id: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  pollVotes: {
    slots: PollSlot[];
  };
  proposedSlots: ProposedSlot[];
};

export default function PollPage() {
  const t = useTranslations('ui.poll');
  const params = useParams();
  const sessionId = params?.id as string;
  const [poll, setPoll] = useState<PollResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [voteForm, setVoteForm] = useState({
    name: '',
    email: '',
    votes: {} as Record<string, PollVoteValue>,
  });

  useEffect(() => {
    if (!sessionId) return;

    fetch(`/api/poll/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPoll(data);
          // Initialize votes map
          const votes: Record<string, PollVoteValue> = {};
          data.pollVotes?.slots?.forEach((slot: PollSlot) => {
            votes[`${slot.startUtcISO}-${slot.endUtcISO}`] = 'no';
          });
          setVoteForm((prev) => ({ ...prev, votes }));
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(t('failedToLoad'));
        setLoading(false);
      });
  }, [sessionId]);

  const formatLocal = (iso: string, timezone: string) => {
    return DateTime.fromISO(iso, { zone: 'utc' })
      .setZone(timezone)
      .toLocaleString(DateTime.DATETIME_MED);
  };

  const formatUtc = (iso: string) => {
    return DateTime.fromISO(iso, { zone: 'utc' }).toLocaleString(DateTime.DATETIME_MED);
  };

  const getVoteCount = (slot: PollSlot, value: PollVoteValue) => {
    return Object.values(slot.votes).filter((v) => v === value).length;
  };

  const handleVote = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (!voteForm.name || !voteForm.email) {
      setError(t('provideNameEmail'));
      return;
    }

    const hasVote = Object.values(voteForm.votes).some((v) => v !== 'no');
    if (!hasVote) {
      setError(t('voteAtLeastOne'));
      return;
    }

    setSubmitting(true);

    try {
      const votes = Object.entries(voteForm.votes)
        .filter(([_, value]) => value !== 'no')
        .map(([key, value]) => {
          const [startUtcISO, endUtcISO] = key.split('-');
          return { startUtcISO, endUtcISO, value };
        });

      const res = await fetch(`/api/poll/${sessionId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName: voteForm.name,
          voterEmail: voteForm.email,
          votes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t('failedToSubmit'));
        return;
      }

      setPoll((prev) => (prev ? { ...prev, pollVotes: data.pollVotes } : null));
      setMessage(t('voteSubmitted'));
    } catch (err) {
      setError(t('failedToSubmit'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>{t('loading')}</p>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="p-6">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!poll) {
    return null;
  }

  const userTimezone = DateTime.now().zoneName || 'UTC';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold mb-2">{poll.title}</h1>
        {poll.description && <p className="text-gray-600">{poll.description}</p>}
        <p className="text-sm text-gray-500 mt-2">{t('duration', { minutes: poll.durationMinutes })}</p>
      </div>

      {message && <div className="text-green-600">{message}</div>}
      {error && <div className="text-red-600">{error}</div>}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('voteForSlots')}</h2>
        {poll.pollVotes?.slots?.length === 0 ? (
          <p>{t('noSlots')}</p>
        ) : (
          <div className="space-y-3">
            {poll.pollVotes?.slots?.map((slot, idx) => {
              const slotKey = `${slot.startUtcISO}-${slot.endUtcISO}`;
              const proposedSlot = poll.proposedSlots.find(
                (s) => s.startUtcISO === slot.startUtcISO && s.endUtcISO === slot.endUtcISO
              );
              const yesCount = getVoteCount(slot, 'yes');
              const maybeCount = getVoteCount(slot, 'maybe');
              const noCount = getVoteCount(slot, 'no');

              return (
                <div key={slotKey} className="border rounded-md p-3">
                  <div className="mb-2">
                    <div>
                      <strong>{t('utcLabel')}</strong> {formatUtc(slot.startUtcISO)} → {formatUtc(slot.endUtcISO)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <strong>{t('yourTimeLabel', { timezone: userTimezone })}</strong>{' '}
                      {formatLocal(slot.startUtcISO, userTimezone)} →{' '}
                      {formatLocal(slot.endUtcISO, userTimezone)}
                    </div>
                    {proposedSlot && <div className="text-xs text-gray-500 mt-1">{t('score', { score: proposedSlot.score })}</div>}
                  </div>

                  <div className="flex gap-2 mb-2">
                    <button
                      className={`px-3 py-1 text-sm rounded ${
                        voteForm.votes[slotKey] === 'yes'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      onClick={() =>
                        setVoteForm((prev) => ({
                          ...prev,
                          votes: { ...prev.votes, [slotKey]: voteForm.votes[slotKey] === 'yes' ? 'no' : 'yes' },
                        }))
                      }
                    >
                      {t('yes')}
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded ${
                        voteForm.votes[slotKey] === 'maybe'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      onClick={() =>
                        setVoteForm((prev) => ({
                          ...prev,
                          votes: { ...prev.votes, [slotKey]: voteForm.votes[slotKey] === 'maybe' ? 'no' : 'maybe' },
                        }))
                      }
                    >
                      {t('maybe')}
                    </button>
                    <button
                      className={`px-3 py-1 text-sm rounded ${
                        voteForm.votes[slotKey] === 'no' || !voteForm.votes[slotKey]
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      onClick={() =>
                        setVoteForm((prev) => ({
                          ...prev,
                          votes: { ...prev.votes, [slotKey]: 'no' },
                        }))
                      }
                    >
                      {t('no')}
                    </button>
                  </div>

                  <div className="text-xs text-gray-500">
                    {t('summary', { yes: yesCount, maybe: maybeCount, no: noCount })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-2 border-t pt-4">
        <h2 className="text-xl font-semibold">{t('submitYourVote')}</h2>
        <form className="grid gap-3" onSubmit={handleVote}>
          <input
            className="border px-2 py-1"
            placeholder={t('yourName')}
            value={voteForm.name}
            onChange={(e) => setVoteForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="border px-2 py-1"
            type="email"
            placeholder={t('yourEmail')}
            value={voteForm.email}
            onChange={(e) => setVoteForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <button className="px-4 py-2 bg-blue-600 text-white" type="submit" disabled={submitting}>
            {submitting ? t('submitting') : t('submitVote')}
          </button>
        </form>
      </section>
    </div>
  );
}


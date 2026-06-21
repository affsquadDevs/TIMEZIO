'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { DateTime } from 'luxon';
import tzLookup from 'tz-lookup';
import ui from '@/components/ui/ui.module.css';
import { CitySearch } from '@/features/search/CitySearch';
import { WorkingHoursEditor } from '@/components/ui/WorkingHoursEditor';
import { TimeRow } from '@/components/ui/TimeRow';
import { TimezoneSelector } from '@/components/ui/TimezoneSelector';
import { DatePicker } from '@/components/ui/DatePicker';
import { TimePicker } from '@/components/ui/TimePicker';
import { getUserTimezone, getCurrentUserTimezone } from '@/utils/userTimezone';

import { useAppStore } from '@/store/useAppStore';
import { formatTime, findMeetingSlots, createManualTimeSlot } from '@/utils/time';
import { useTicker } from '@/hooks/useTicker';
import type { TimeSlot } from '@/utils/time';
import { useToast } from '@/components/ui/Toast';

import type {
  ConfirmedEvent,
  Participant as BackendParticipant,
  ProposedSlot,
  SelectedSlot,
} from '@/lib/meeting';

type SessionResponse = {
  id: string;
  creatorId: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  rangeFromISO: string;
  rangeToISO: string;
  participants: BackendParticipant[];
  proposedSlots: ProposedSlot[];
  selectedSlot: SelectedSlot | null;
  confirmedEvent: ConfirmedEvent | null;
  mode: string;
  bookingSlug?: string | null;
  pollVotes?: unknown;
  createdAt: string;
  workHoursPolicy?: { defaultStart: string; defaultEnd: string; weekendOff: boolean } | null;
};

export function PlannerTab() {
  const t = useTranslations('ui.plannerTab');
  const { showToast } = useToast();
  const now = useTicker(1000);

  const planner = useAppStore((s) => s.planner);
  const locationsById = useAppStore((s) => s.locationsById);
  const compare = useAppStore((s) => s.compare);
  const pickFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const focusTarget = useAppStore((s) => s.focusTarget);
  const selected = useAppStore((s) => (s.selectedId ? s.locationsById[s.selectedId] : null));
  const upsertLocation = useAppStore((s) => s.upsertLocation);

  const addPlannerParticipant = useAppStore((s) => s.addPlannerParticipant);
  const removePlannerParticipant = useAppStore((s) => s.removePlannerParticipant);
  const updatePlannerParticipantName = useAppStore((s) => s.updatePlannerParticipantName);
  const setPlannerWorkingHours = useAppStore((s) => s.setPlannerWorkingHours);
  const setPlannerDuration = useAppStore((s) => s.setPlannerDuration);
  const setPlannerDate = useAppStore((s) => s.setPlannerDate);
  const setPlannerSelectedSlot = useAppStore((s) => s.setPlannerSelectedSlot);
  const setPlannerAvoidEarlyHours = useAppStore((s) => s.setPlannerAvoidEarlyHours);
  const setPlannerAvoidLateHours = useAppStore((s) => s.setPlannerAvoidLateHours);
  const setPlannerAvoidLunch = useAppStore((s) => s.setPlannerAvoidLunch);
  const setPlannerMode = useAppStore((s) => s.setPlannerMode);
  const setPlannerManualTime = useAppStore((s) => s.setPlannerManualTime);

  const [session, setSession] = useState<SessionResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionForm, setSessionForm] = useState({ title: '', description: '' });
  const [manualTimeInput, setManualTimeInput] = useState<string>('14:00');
  const [participantForm, setParticipantForm] = useState({ name: '', email: '' });
  const [participantAddMode, setParticipantAddMode] = useState<'simple' | 'detailed'>('detailed');
  const [participantEmails, setParticipantEmails] = useState<Record<string, string>>({});
  const [backendSlots, setBackendSlots] = useState<ProposedSlot[]>([]);
  const [userTimezone, setUserTimezone] = useState<string>(getCurrentUserTimezone());
  const [userTimezoneName, setUserTimezoneName] = useState<string>('Me');
  const [googleUser, setGoogleUser] = useState<{ connected: boolean; name?: string; email?: string } | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);
  const [includeWeekends, setIncludeWeekends] = useState(false);
  const normalizeTz = (tz: string | undefined, lat?: number, lng?: number) => {
    if (tz && tz.includes('/')) return tz;
    if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
      try {
        return tzLookup(lat, lng);
      } catch {
        return tz || 'UTC';
      }
    }
    return tz || 'UTC';
  };

  useEffect(() => {
    const saved = getUserTimezone();
    if (saved) {
      setUserTimezone(saved);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch('/api/user', { credentials: 'include' });
        const data = await res.json();
        setGoogleUser(data);
      } catch (err) {
        console.error('Failed to load user:', err);
        setGoogleUser({ connected: false });
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!focusTarget) return;
    const t = window.setTimeout(() => requestFocus(null), 0);
    return () => window.clearTimeout(t);
  }, [focusTarget, requestFocus]);

  const participants = planner.participants.map((ppt) => ({
    ...ppt,
    location: locationsById[ppt.locationId],
  })).filter((p) => !!p.location);

  const slots = useMemo(() => {
    if (participants.length < 2 || planner.mode !== 'auto') return [];
    
    const workingHoursWithDefaults: Record<string, { start: string; end: string }> = {};
    for (const ppt of planner.participants) {
      workingHoursWithDefaults[ppt.id] = planner.workingHours[ppt.id] || { start: '09:00', end: '17:00' };
    }
    
    return findMeetingSlots(
      planner.participants,
      workingHoursWithDefaults,
      locationsById,
      planner.date,
      planner.durationMinutes,
      15,
      planner.avoidEarlyHours,
      planner.avoidLateHours,
      planner.avoidLunch
    );
  }, [
    planner.participants,
    planner.workingHours,
    planner.date,
    planner.durationMinutes,
    planner.avoidEarlyHours,
    planner.avoidLateHours,
    planner.avoidLunch,
    planner.mode,
    locationsById,
  ]);

  const manualSlot = useMemo<TimeSlot | null>(() => {
    if (planner.mode !== 'manual') return null;
    const timeToUse = planner.manualTime || manualTimeInput || '14:00';
    if (!timeToUse) return null;
    return createManualTimeSlot(
      planner.date,
      timeToUse,
      planner.manualTimeBaseParticipantId,
      planner.participants,
      locationsById,
      planner.durationMinutes
    );
  }, [
    planner.mode,
    planner.manualTime,
    planner.manualTimeBaseParticipantId,
    planner.date,
    planner.durationMinutes,
    planner.participants,
    locationsById,
    manualTimeInput,
  ]);

  const availableSlots = backendSlots.length > 0 
    ? backendSlots.map((slot) => ({
        startUtc: slot.startUtcISO,
        endUtc: slot.endUtcISO,
        localTimes: slot.breakdown.reduce((acc, bd) => {
          acc[bd.name] = DateTime.fromISO(bd.localStart).toFormat('HH:mm');
          return acc;
        }, {} as Record<string, string>),
        qualityScore: slot.score,
        localTimesFull: slot.breakdown.reduce((acc, bd) => {
          acc[bd.name] = DateTime.fromISO(bd.localStart);
          return acc;
        }, {} as Record<string, DateTime>),
      }))
    : slots;

  const selectedSlot = planner.mode === 'auto'
    ? (planner.selectedSlotUtc 
        ? availableSlots.find((s) => s.startUtc === planner.selectedSlotUtc) || null
        : null)
    : manualSlot;

  const getErrorMessage = (value: unknown, fallback: string) => {
    if (value instanceof Error) return value.message;
    if (typeof value === 'string') return value;
    return fallback;
  };

  const resetMessages = () => {
    setError(null);
    setMessage(null);
  };

  const apiRequest = async <T = unknown>(url: string, options: RequestInit): Promise<T> => {
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
    const payload = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok) {
      const detail = payload && typeof payload.error === 'string' ? payload.error : 'Request failed';
      throw new Error(detail);
    }
    return payload as T;
  };

  const handleCreateSession = async () => {
    resetMessages();
    if (!sessionForm.title) {
      setError(t('errProvideTitle'));
      return;
    }

    try {
      const rangeFromISO = DateTime.fromISO(planner.date).startOf('day').toUTC().toISO()!;
      const rangeToISO = DateTime.fromISO(planner.date).endOf('day').toUTC().toISO()!;

      const data = await apiRequest<SessionResponse>('/api/meetings', {
        method: 'POST',
        body: JSON.stringify({
          title: sessionForm.title,
          description: sessionForm.description,
          durationMinutes: planner.durationMinutes,
          rangeFromISO,
          rangeToISO,
          workHoursPolicy: {
            defaultStart: '09:00',
            defaultEnd: '18:00',
            weekendOff: !includeWeekends,
          },
        }),
      });

      setSession(data);
      setMessage(t('msgSessionCreated'));

      const savedUserTz = getUserTimezone();
      const tzToUse = savedUserTz || userTimezone;
      
      if (tzToUse && tzToUse !== 'UTC') {
        try {
          let lat = 0;
          let lng = 0;
          
          const timezoneCoords: Record<string, [number, number]> = {
            'Europe/Kyiv': [50.4501, 30.5234],
            'America/New_York': [40.7128, -74.006],
            'America/Los_Angeles': [34.0522, -118.2437],
            'Europe/London': [51.5074, -0.1278],
            'Asia/Tokyo': [35.6762, 139.6503],
            'Europe/Paris': [48.8566, 2.3522],
            'Europe/Berlin': [52.52, 13.405],
            'Asia/Shanghai': [31.2304, 121.4737],
            'America/Chicago': [41.8781, -87.6298],
            'America/Denver': [39.7392, -104.9903],
          };

          if (timezoneCoords[tzToUse]) {
            [lat, lng] = timezoneCoords[tzToUse];
          } else {
            lat = 0;
            lng = 0;
          }

          const participantName = userTimezoneName || 'Me';
          const cityName = tzToUse.split('/').pop()?.replace(/_/g, ' ') || tzToUse;

          const updated = await apiRequest<SessionResponse>(`/api/meetings/${data.id}/participants`, {
            method: 'POST',
            body: JSON.stringify({
              name: participantName,
              email: undefined,
              timezone: normalizeTz(tzToUse, lat, lng),
              location: {
                lat,
                lng,
                city: cityName,
                countryCode: 'N/A',
              },
            }),
          });

          if (lat !== 0 && lng !== 0) {
            const loc = pickFromLatLng(lat, lng, 'search', participantName);
            const updatedLoc = { ...loc, tz: tzToUse };
            upsertLocation(updatedLoc);
            const res = addPlannerParticipant(updatedLoc.id, participantName);
            if (!res.ok && res.reason) {
              console.error('Failed to add participant to frontend:', res.reason);
            }
          }

          setSession(updated);
          setMessage(t('msgSessionCreatedWithTz'));
        } catch (err) {
          console.error('Failed to add user timezone:', err);
        }
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('errCreateSession')));
    }
  };

  useEffect(() => {
    if (!session?.id) return;

    const loadSession = async () => {
      try {
        const updated = await apiRequest<SessionResponse>(`/api/meetings/${session.id}`, { method: 'GET' });
        setSession(updated);
        if (updated.workHoursPolicy) {
          setIncludeWeekends(!updated.workHoursPolicy.weekendOff);
        }
        const emailMap: Record<string, string> = {};
        updated.participants.forEach((p) => {
          const frontendPpt = planner.participants.find((fp) => fp.name === p.name);
          if (frontendPpt && p.email) {
            emailMap[frontendPpt.id] = p.email;
          }
        });
        setParticipantEmails((prev) => ({ ...prev, ...emailMap }));
      } catch (err) {
        console.error('Failed to load session:', err);
      }
    };

    loadSession();
  }, [session?.id]);

  const handleAddParticipantFromForm = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();

    if (!session) {
      setError(t('errCreateSessionFirst'));
      return;
    }

    if (!participantForm.name) {
      setError(t('errNameRequired'));
      return;
    }

    const selectedLoc = selected || (participants.length > 0 ? participants[participants.length - 1].location : null);
    
    if (!selectedLoc) {
      setError(t('errSelectLocation'));
      return;
    }

    try {
      const updated = await apiRequest<SessionResponse>(`/api/meetings/${session.id}/participants`, {
        method: 'POST',
        body: JSON.stringify({
          name: participantForm.name,
          email: participantForm.email || undefined,
          timezone: normalizeTz(selectedLoc.tz, selectedLoc.lat, selectedLoc.lng),
          location: {
            lat: selectedLoc.lat,
            lng: selectedLoc.lng,
            city: selectedLoc.label.split(',')[0] || selectedLoc.label,
            countryCode: 'N/A',
          },
        }),
      });

      const loc = pickFromLatLng(selectedLoc.lat, selectedLoc.lng, 'search', participantForm.name);
      const res = addPlannerParticipant(loc.id, participantForm.name);
      
      if (res.ok && res.participantId) {
        if (participantForm.email) {
          setParticipantEmails((prev) => ({ ...prev, [res.participantId!]: participantForm.email }));
        }
        const backendPpt = updated.participants.find((p) => p.name === participantForm.name);
        if (backendPpt?.email && !participantForm.email) {
          setParticipantEmails((prev) => ({ ...prev, [res.participantId!]: backendPpt.email! }));
        }
      }

      setSession(updated);
      setParticipantForm({ name: '', email: '' });
      setMessage(t('msgParticipantAdded'));
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('errAddParticipant')));
    }
  };

  const handleAddParticipantFromGlobe = async (c: { lat: number; lng: number; label: string; tz: string }) => {
    resetMessages();

    if (!session) {
      showToast(t('errCreateSessionFirst'), 'error');
      return;
    }

    const loc = pickFromLatLng(c.lat, c.lng, 'search', c.label);
    requestFocus({ lat: loc.lat, lng: loc.lng, altitude: 1.6 });
    
    try {
      const updated = await apiRequest<SessionResponse>(`/api/meetings/${session.id}/participants`, {
        method: 'POST',
        body: JSON.stringify({
          name: c.label,
          email: `${c.label.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          timezone: normalizeTz(c.tz, c.lat, c.lng),
          location: {
            lat: c.lat,
            lng: c.lng,
            city: c.label.split(',')[0] || c.label,
            countryCode: 'N/A',
          },
        }),
      });
      
      const res = addPlannerParticipant(loc.id, c.label);
      if (res.ok && res.participantId) {
        const backendPpt = updated.participants.find((p) => p.name === c.label);
        if (backendPpt?.email) {
          setParticipantEmails((prev) => ({ ...prev, [res.participantId!]: backendPpt.email! }));
        }
      }
      
      setSession(updated);
      setMessage(t('msgParticipantAdded'));
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('errAddParticipantBackend')));
    }
  };

  const handleGenerateSlotsBackend = async () => {
    resetMessages();

    if (!session) {
      setError(t('errCreateSessionFirst'));
      return;
    }

    if (session.participants.length < 2) {
      setError(t('errAddTwoParticipants'));
      return;
    }

    try {
      const data = await apiRequest<{ proposedSlots: ProposedSlot[] }>(
        `/api/meetings/${session.id}/generate-slots`,
        {
          method: 'POST',
          body: JSON.stringify({
            stepMinutes: 30,
            maxCandidates: 500,
            topN: 15,
            hardFilterNight: planner.avoidEarlyHours || planner.avoidLateHours,
            fairness: false,
          }),
        },
      );

      setBackendSlots(data.proposedSlots);
      setSession((prev) => (prev ? { ...prev, proposedSlots: data.proposedSlots } : prev));
      setMessage(t('msgGeneratedSlots', { count: data.proposedSlots.length }));
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('errGenerateSlots')));
    }
  };

  const handleConfirmMeet = async () => {
    resetMessages();
    if (!session || !selectedSlot) {
      setError(t('errCreateSessionSelectSlot'));
      return;
    }

    try {
      const slotData = {
        startUtcISO: selectedSlot.startUtc,
        endUtcISO: selectedSlot.endUtc,
      };

      await apiRequest<SessionResponse>(`/api/meetings/${session.id}/select-slot`, {
        method: 'POST',
        body: JSON.stringify(slotData),
      });

      const confirmed = await apiRequest<ConfirmedEvent>(`/api/meetings/${session.id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({}),
      });

      setSession((prev) => (prev ? { ...prev, confirmedEvent: confirmed, selectedSlot: slotData } : prev));
      setMessage(t('msgMeetCreated', { link: confirmed.meetLink }));
      setConfirmSuccess(true);
      setTimeout(() => setConfirmSuccess(false), 1400);
    } catch (err: unknown) {
      setError(getErrorMessage(err, t('errCreateMeet')));
    }
  };

  return (
    <div className={ui.card} style={{ maxHeight: 'calc(100vh - 140px)', overflowY: 'auto', position: 'relative' }}>
      <div className={ui.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div className={ui.title}>{t('heading')}</div>
          <div className={ui.subtitle}>
            {t('intro')}
          </div>
        </div>

        <div>
          {googleUser?.connected ? (
            <div 
              className={ui.btn}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                fontSize: '14px', 
                fontWeight: 500,
                padding: '12px 16px',
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                cursor: 'default'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {googleUser.name || googleUser.email || t('connected')}
            </div>
          ) : (
            <a 
              href="/api/auth/google" 
              className={`${ui.btn} ${ui.btnPrimary}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 10,
                width: '100%',
                fontSize: '14px', 
                fontWeight: 600,
                padding: '12px 16px',
                textDecoration: 'none'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('connectGoogleCalendar')}
              <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 400 }}>
                {t('requiredForMeet')}
              </span>
            </a>
          )}
        </div>

        <div className={ui.divider} />

        <div>
          <div className={ui.label} style={{ marginBottom: 12 }}>{t('yourTimezone')}</div>
          <TimezoneSelector
            value={userTimezone}
            onChange={(tz) => {
              setUserTimezone(tz);
              if (typeof window !== 'undefined') {
                localStorage.setItem('timezio_user_timezone', tz);
              }
            }}
            showSaveOption={true}
            showClearOption={true}
          />
          <div style={{ marginTop: 12 }}>
            <input
              type="text"
              placeholder={t('yourNamePlaceholder')}
              value={userTimezoneName}
              onChange={(e) => setUserTimezoneName(e.target.value)}
              className={ui.input}
              style={{ fontSize: '13px', padding: '8px 12px', width: '100%' }}
            />
          </div>
        </div>

        {!session && (
          <>
            <div>
              <div className={ui.label} style={{ marginBottom: 8 }}>{t('createMeetingSession')}</div>
              <input
                type="text"
                placeholder={t('meetingTitlePlaceholder')}
                value={sessionForm.title}
                onChange={(e) => setSessionForm((prev) => ({ ...prev, title: e.target.value }))}
                className={ui.input}
                style={{ marginBottom: 8 }}
              />
              <input
                type="text"
                placeholder={t('descriptionPlaceholder')}
                value={sessionForm.description}
                onChange={(e) => setSessionForm((prev) => ({ ...prev, description: e.target.value }))}
                className={ui.input}
              />
              <button className={ui.btn} onClick={handleCreateSession} style={{ marginTop: 8, width: '100%' }}>
                {t('createSession')}
              </button>
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}
            {message && <div style={{ color: '#22c55e', fontSize: '13px' }}>{message}</div>}
          </>
        )}

        {session && (
          <>
            <div>
              <div className={ui.title} style={{ fontSize: 14 }}>{t('sessionLabel', { title: session.title })}</div>
              {session.description && <div className={ui.subtitle} style={{ fontSize: '12px' }}>{session.description}</div>}
            </div>

            <div>
              <div className={ui.label} style={{ marginBottom: 12, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>{t('mode')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <button
                  onClick={() => setPlannerMode('auto')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${planner.mode === 'auto' ? 'var(--highlight)' : 'var(--card-border)'}`,
                    backgroundColor: planner.mode === 'auto' ? 'var(--highlight)' : 'var(--card-bg)',
                    color: planner.mode === 'auto' ? 'var(--background)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (planner.mode !== 'auto') {
                      e.currentTarget.style.borderColor = 'var(--text-secondary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (planner.mode !== 'auto') {
                      e.currentTarget.style.borderColor = 'var(--card-border)';
                      e.currentTarget.style.transform = '';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{t('autoFindSlots')}</span>
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: 1.4 }}>
                    {t('autoFindSlotsDesc')}
                  </div>
                </button>
                <button
                  onClick={() => setPlannerMode('manual')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `2px solid ${planner.mode === 'manual' ? 'var(--highlight)' : 'var(--card-border)'}`,
                    backgroundColor: planner.mode === 'manual' ? 'var(--highlight)' : 'var(--card-bg)',
                    color: planner.mode === 'manual' ? 'var(--background)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    if (planner.mode !== 'manual') {
                      e.currentTarget.style.borderColor = 'var(--text-secondary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (planner.mode !== 'manual') {
                      e.currentTarget.style.borderColor = 'var(--card-border)';
                      e.currentTarget.style.transform = '';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{t('manualTimePick')}</span>
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: 1.4 }}>
                    {t('manualTimePickDesc')}
                  </div>
                </button>
              </div>
              <div style={{ 
                padding: '12px', 
                backgroundColor: 'var(--card-bg)', 
                borderRadius: '8px', 
                border: '1px solid var(--card-border)',
                fontSize: '12px', 
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                  {planner.mode === 'auto' ? t('howAutoFindWorks') : t('howManualPickWorks')}
                </div>
                {planner.mode === 'auto' ? (
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li>{t('autoBullet1')}</li>
                    <li>{t('autoBullet2')}</li>
                    <li>{t('autoBullet3')}</li>
                    <li>{t('autoBullet4')}</li>
                    <li>{t('autoBullet5')}</li>
                  </ul>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <li>{t('manualBullet1')}</li>
                    <li>{t('manualBullet2')}</li>
                    <li>{t('manualBullet3')}</li>
                    <li>{t('manualBullet4')}</li>
                    <li>{t('manualBullet5')}</li>
                  </ul>
                )}
              </div>
            </div>

            <div className={ui.divider} />

            <div>
              <div className={ui.label} style={{ marginBottom: 8 }}>{t('duration')}</div>
              <div className={ui.pillRow}>
                {[15, 30, 45, 60, 90, 120].map((mins) => (
                  <button
                    key={mins}
                    className={`${ui.btn} ${planner.durationMinutes === mins ? ui.btnPrimary : ''}`}
                    onClick={() => setPlannerDuration(mins as 15 | 30 | 45 | 60 | 90 | 120)}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  >
                    {mins === 120 ? t('twoHours') : t('minutes', { mins })}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className={ui.label} style={{ marginBottom: 8 }}>{t('date')}</div>
              <DatePicker
                value={planner.date}
                onChange={setPlannerDate}
              />
            </div>

            <div>
              <div className={ui.label} style={{ marginBottom: 12 }}>{t('preferences')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setIncludeWeekends(!includeWeekends)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--card-border)',
                    backgroundColor: includeWeekends ? 'var(--card-bg)' : 'var(--card-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--highlight)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: includeWeekends ? 'var(--highlight)' : 'var(--card-border)',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          position: 'absolute',
                          top: 2,
                          left: includeWeekends ? 22 : 2,
                          transition: 'left 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {t('includeWeekends')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {t('includeWeekendsDesc')}
                      </span>
                    </div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setPlannerAvoidEarlyHours(!planner.avoidEarlyHours)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--card-border)',
                    backgroundColor: planner.avoidEarlyHours ? 'var(--card-bg)' : 'var(--card-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--highlight)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: planner.avoidEarlyHours ? 'var(--highlight)' : 'var(--card-border)',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          position: 'absolute',
                          top: 2,
                          left: planner.avoidEarlyHours ? 22 : 2,
                          transition: 'left 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {t('avoidEarly')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('localTime')}</span>
                    </div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setPlannerAvoidLateHours(!planner.avoidLateHours)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--card-border)',
                    backgroundColor: planner.avoidLateHours ? 'var(--card-bg)' : 'var(--card-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--highlight)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: planner.avoidLateHours ? 'var(--highlight)' : 'var(--card-border)',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          position: 'absolute',
                          top: 2,
                          left: planner.avoidLateHours ? 22 : 2,
                          transition: 'left 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {t('avoidLate')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('localTime')}</span>
                    </div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setPlannerAvoidLunch(!planner.avoidLunch)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid var(--card-border)',
                    backgroundColor: planner.avoidLunch ? 'var(--card-bg)' : 'var(--card-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--highlight)';
                    e.currentTarget.style.transform = 'translateX(2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--card-border)';
                    e.currentTarget.style.transform = '';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: planner.avoidLunch ? 'var(--highlight)' : 'var(--card-border)',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                        flexShrink: 0,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          backgroundColor: '#fff',
                          position: 'absolute',
                          top: 2,
                          left: planner.avoidLunch ? 22 : 2,
                          transition: 'left 0.2s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {t('avoidLunch')}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t('lunchTime')}</span>
                    </div>
                  </div>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="6" x2="12" y2="12"></line>
                    <line x1="12" y1="18" x2="12" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>

            <div className={ui.divider} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className={ui.label}>{t('addParticipant')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '12px', color: participantAddMode === 'simple' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: participantAddMode === 'simple' ? 500 : 400 }}>
                    {t('quick')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setParticipantAddMode(participantAddMode === 'simple' ? 'detailed' : 'simple')}
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: participantAddMode === 'detailed' ? 'var(--highlight)' : 'var(--card-border)',
                      position: 'relative',
                      transition: 'background-color 0.2s ease',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#fff',
                        position: 'absolute',
                        top: 2,
                        left: participantAddMode === 'detailed' ? 22 : 2,
                        transition: 'left 0.2s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      }}
                    />
                  </button>
                  <span style={{ fontSize: '12px', color: participantAddMode === 'detailed' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: participantAddMode === 'detailed' ? 500 : 400 }}>
                    {t('withEmail')}
                  </span>
                </div>
              </div>
              
              {participantAddMode === 'simple' ? (
                <CitySearch
                  placeholder={t('searchCityPlaceholder')}
                  onPick={handleAddParticipantFromGlobe}
                />
              ) : (
                <form onSubmit={handleAddParticipantFromForm} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="text"
                    placeholder={t('namePlaceholder')}
                    value={participantForm.name}
                    onChange={(e) => setParticipantForm((prev) => ({ ...prev, name: e.target.value }))}
                    className={ui.input}
                    required
                  />
                  <input
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={participantForm.email}
                    onChange={(e) => setParticipantForm((prev) => ({ ...prev, email: e.target.value }))}
                    className={ui.input}
                  />
                  <button className={`${ui.btn} ${ui.btnPrimary}`} type="submit" style={{ width: '100%' }}>
                    {t('addParticipant')}
                  </button>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: -4 }}>
                    {t('clickGlobeHint')}
                  </div>
                </form>
              )}
              
              {compare.items.length > 0 && (
                <button
                  className={ui.btn}
                  style={{ marginTop: 8, width: '100%' }}
                  onClick={async () => {
                    for (const id of compare.items) {
                      const loc = locationsById[id];
                      if (loc && !planner.participants.some((p) => p.locationId === id)) {
                        const res = addPlannerParticipant(id, loc.label);
                        if (res.ok && session) {
                          try {
                            await apiRequest<SessionResponse>(`/api/meetings/${session.id}/participants`, {
                              method: 'POST',
                              body: JSON.stringify({
                                name: loc.label,
                                email: `${loc.label.toLowerCase().replace(/\s+/g, '.')}@example.com`,
                                timezone: loc.tz,
                                location: {
                                  lat: loc.lat,
                                  lng: loc.lng,
                                  city: loc.label.split(',')[0] || loc.label,
                                  countryCode: 'N/A',
                                },
                              }),
                            });
                          } catch (err) {
                            console.error('Failed to add participant:', err);
                          }
                        }
                      }
                    }
                    if (session) {
                      const updated = await apiRequest<SessionResponse>(`/api/meetings/${session.id}`, { method: 'GET' });
                      setSession(updated);
                    }
                  }}
                >
                  {t('addAllFromCompare', { count: compare.items.length })}
                </button>
              )}
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 8 }}>
                {t('clickGlobeFormHint')}
              </div>
            </div>

            {(participants.length > 0 || session.participants.length > 0) && (
              <>
                <div className={ui.divider} />
                <div>
                  <div className={ui.title} style={{ fontSize: 14, marginBottom: 8 }}>
                    {t('participantsCount', { count: Math.max(participants.length, session.participants.length) })}
                  </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {session.participants.map((backendPpt) => {
                      const frontendPpt = participants.find((fp) => fp.name === backendPpt.name);
                      const email = backendPpt.email || participantEmails[frontendPpt?.id || ''] || '';
                      
                      return (
                        <div key={backendPpt.name} className={ui.card} style={{ padding: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '13px' }}>{backendPpt.name}</div>
                              {email && (
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
                                  {email}
                                </div>
                              )}
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
                                {backendPpt.timezone}
                              </div>
                              {backendPpt.location?.city && (
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 2 }}>
                                  {backendPpt.location.city}
                                </div>
                              )}
                            </div>
                            <button
                              className={`${ui.btn} ${ui.btnDanger}`}
                              style={{ fontSize: 11, padding: '4px 8px' }}
                                      onClick={async () => {
                                if (session) {
                                  const updated = await apiRequest<SessionResponse>(`/api/meetings/${session.id}`, { method: 'GET' });
                                  const newParticipants = updated.participants.filter((p) => p.name !== backendPpt.name);
                                  setSession({ ...updated, participants: newParticipants });
                                }
                                if (frontendPpt) {
                                  removePlannerParticipant(frontendPpt.id);
                                }
                              }}
                            >
                              {t('remove')}
                            </button>
                          </div>
                          {frontendPpt && (
                            <WorkingHoursEditor
                              participantId={frontendPpt.id}
                              participantName={frontendPpt.name}
                              hours={planner.workingHours[frontendPpt.id] ?? { start: '09:00', end: '17:00' }}
                              onChange={(hours) => setPlannerWorkingHours(frontendPpt.id, hours)}
                            />
                          )}
                        </div>
                      );
                    })}
                    
                    {session.participants.length === 0 && participants.map((ppt) => (
                      <div key={ppt.id}>
                        <WorkingHoursEditor
                          participantId={ppt.id}
                          participantName={ppt.name}
                          hours={planner.workingHours[ppt.id] ?? { start: '09:00', end: '17:00' }}
                          onChange={(hours) => setPlannerWorkingHours(ppt.id, hours)}
                        />
                        <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                          <button
                            className={ui.btn}
                            style={{ fontSize: 12, padding: '6px 10px' }}
                            onClick={() => {
                              const newName = prompt(t('namePrompt'), ppt.name);
                              if (newName) updatePlannerParticipantName(ppt.id, newName);
                            }}
                          >
                            {t('rename')}
                          </button>
                          <button
                            className={`${ui.btn} ${ui.btnDanger}`}
                            style={{ fontSize: 12, padding: '6px 10px' }}
                            onClick={() => removePlannerParticipant(ppt.id)}
                          >
                            {t('remove')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {planner.mode === 'manual' && (
              <>
                <div className={ui.divider} />
                <div>
                  <div className={ui.label} style={{ marginBottom: 12 }}>{t('selectTime')}</div>
                  {participants.length > 0 && (
                    <div>
                      <div className={ui.label} style={{ marginBottom: 6, fontSize: '12px' }}>{t('baseTimezone')}</div>
                      <select
                        className={ui.input}
                        value={planner.manualTimeBaseParticipantId || participants[0]?.id || ''}
                        onChange={(e) => {
                          const participantId = e.target.value;
                          const time = planner.manualTime || manualTimeInput || '14:00';
                          setPlannerManualTime(time, participantId);
                        }}
                        style={{ marginBottom: 12 }}
                      >
                        {participants.map((ppt) => {
                          const loc = locationsById[ppt.locationId];
                          return (
                            <option key={ppt.id} value={ppt.id}>
                              {ppt.name} ({loc?.tz || t('unknown')})
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                  <div>
                    <div className={ui.label} style={{ marginBottom: 8, fontSize: '12px' }}>
                      {t('meetingTime')}{' '}
                      {participants.length > 0
                        ? t('meetingTimeTzSuffix', { name: participants.find((p) => p.id === planner.manualTimeBaseParticipantId)?.name || participants[0]?.name || 'UTC' })
                        : t('meetingTimeUtcSuffix')}
                    </div>
                    <TimePicker
                      value={planner.manualTime || manualTimeInput || '14:00'}
                      onChange={(time) => {
                        setManualTimeInput(time);
                        if (participants.length > 0) {
                          const baseId = planner.manualTimeBaseParticipantId || participants[0]?.id || null;
                          if (baseId) {
                            setPlannerManualTime(time, baseId);
                          }
                        } else {
                          setPlannerManualTime(time, null);
                        }
                      }}
                      durationMinutes={planner.durationMinutes}
                    />
                  </div>
                </div>
              </>
            )}

            {planner.mode === 'auto' && (participants.length >= 2 || session.participants.length >= 2) && (
              <>
                <div className={ui.divider} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                    <div className={ui.title} style={{ fontSize: 14, margin: 0 }}>
                      {t('availableSlots')}
                    </div>
                    {session && backendSlots.length === 0 && (
                      <button
                        className={ui.btn}
                        onClick={handleGenerateSlotsBackend}
                        style={{ fontSize: 12, padding: '6px 12px' }}
                      >
                        {t('generateSlots')}
                      </button>
                    )}
                  </div>
                  
                  {backendSlots.length === 0 && slots.length === 0 ? (
                    <div className={ui.subtitle}>
                      {session ? (
                        t('emptySlotsWithSession')
                      ) : (
                        t('emptySlotsNoSession')
                      )}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                      {availableSlots.slice(0, 15).map((slot, slotIdx) => {
                        const isSelected = slot.startUtc === planner.selectedSlotUtc;
                                const startDt = DateTime.fromISO(slot.startUtc);
                                if (!startDt.isValid) return null;

                                const backendSlot = backendSlots.find((bs) => bs.startUtcISO === slot.startUtc);
                        const qualityScore = backendSlot?.score ?? slot.qualityScore ?? 0;
                        const qualityColor = qualityScore >= 80 ? '#22c55e' : qualityScore >= 60 ? '#eab308' : '#ef4444';
                        const qualityLabel = qualityScore >= 80 ? t('qualityGreat') : qualityScore >= 60 ? t('qualityGood') : t('qualityFair');

                        return (
                          <div
                            key={slotIdx}
                            className={ui.card}
                            style={{
                              padding: 12,
                              cursor: 'pointer',
                              borderColor: isSelected ? 'var(--highlight)' : undefined,
                              borderWidth: isSelected ? '2px' : undefined,
                              transition: 'all 0.2s ease',
                            }}
                            onClick={() => setPlannerSelectedSlot(isSelected ? null : slot.startUtc)}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = 'var(--card-bg)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = '';
                                e.currentTarget.style.transform = '';
                              }
                            }}
                          >
                            <div className={ui.row} style={{ marginBottom: 8, flexWrap: 'wrap', gap: '6px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                                <div className={ui.mono} style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                                  {startDt.toFormat('HH:mm')} - {startDt.plus({ minutes: planner.durationMinutes }).toFormat('HH:mm')} UTC
                                </div>
                                <div
                                  style={{
                                    fontSize: 10,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    backgroundColor: qualityColor + '20',
                                    color: qualityColor,
                                    fontWeight: 600,
                                    border: `1px solid ${qualityColor}40`,
                                  }}
                                  title={t('qualityScoreTitle', { score: qualityScore.toFixed(0) })}
                                >
                                  {qualityLabel}
                                </div>
                              </div>
                              {isSelected && (
                                <span className={ui.badge} style={{ fontSize: 11, backgroundColor: 'var(--highlight)', color: 'var(--background)' }}>
                                  {t('selected')}
                                </span>
                              )}
                            </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                              {(() => {
                                const matchingBackendSlot = backendSlots.find((bs) => bs.startUtcISO === slot.startUtc);
                                
                                if (matchingBackendSlot && matchingBackendSlot.breakdown && matchingBackendSlot.breakdown.length > 0) {
                                  return matchingBackendSlot.breakdown.map((bd) => (
                                    <div
                                      key={bd.name}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 8,
                                        padding: '4px 0',
                                        flexWrap: 'wrap',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 12 }}>{bd.name}:</span>
                                        <span className={ui.mono} style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
                                          {DateTime.fromISO(bd.localStart).toFormat('HH:mm')}
                                        </span>
                                        <span style={{
                                          fontSize: 9,
                                          padding: '2px 4px',
                                          borderRadius: '3px',
                                          backgroundColor: bd.bucket === 'green' ? '#22c55e20' : bd.bucket === 'yellow' ? '#eab30820' : '#ef444420',
                                          color: bd.bucket === 'green' ? '#22c55e' : bd.bucket === 'yellow' ? '#eab308' : '#ef4444',
                                        }}>
                                          {bd.bucket}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                                        {bd.timezone.split('/').pop()}
                                      </div>
                                    </div>
                                  ));
                                } else {
                                  const participantsToShow = session.participants.length > 0
                                    ? session.participants.map((bp) => ({
                                        id: bp.name,
                                        name: bp.name,
                                        timezone: bp.timezone,
                                        location: bp.location ? { lat: bp.location.lat, lng: bp.location.lng, tz: bp.timezone } : null,
                                      }))
                                    : participants;

                                  return participantsToShow.map((ppt) => {
                                    const pptId = ppt.id || ppt.name;
                                    const localTime = slot.localTimes[pptId];
                                    const localTimeFull = slot.localTimesFull?.[pptId];
                                    const loc = ppt.location || (ppt as typeof participants[0]).location;
                                    if (!loc || !localTime) return null;

                                            const hour = localTimeFull?.hour ?? parseInt(localTime.split(':')[0]);
                                            const timeLabel = hour < 12 ? t('morning') : hour < 17 ? t('afternoon') : hour < 21 ? t('evening') : t('night');
                                            const tz = (loc as { tz?: string })?.tz || (ppt as { timezone?: string }).timezone || 'UTC';

                                    return (
                                      <div
                                        key={pptId}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          gap: 8,
                                          padding: '4px 0',
                                          flexWrap: 'wrap',
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, flex: 1 }}>
                                          <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 12 }}>{ppt.name}:</span>
                                          <span className={ui.mono} style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>
                                            {localTime}
                                          </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-secondary)' }}>
                                          <span>{timeLabel}</span>
                                          <span>•</span>
                                          <span style={{ fontFamily: 'monospace' }}>{tz.split('/').pop()}</span>
                                        </div>
                                      </div>
                                    );
                                  });
                                }
                              })()}
                            </div>
                          </div>
                        );
                      })}
                      {availableSlots.length > 15 && (
                        <div className={ui.subtitle} style={{ textAlign: 'center', padding: 8 }}>
                          {t('showingTopSlots', { total: availableSlots.length })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {selectedSlot && (planner.mode === 'auto' || planner.mode === 'manual') && (
              <>
                <div className={ui.divider} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <div className={ui.title} style={{ fontSize: 14, margin: 0 }}>
                      {planner.mode === 'manual' ? t('selectedTime') : t('selectedSlot')}
                    </div>
                  </div>
                  <div className={ui.card} style={{ padding: 12, backgroundColor: 'var(--card-bg)', marginBottom: 12 }}>
                    <TimeRow
                      label={t('utcTime')}
                      value={`${DateTime.fromISO(selectedSlot.startUtc).toFormat('HH:mm')} - ${DateTime.fromISO(selectedSlot.startUtc).plus({ minutes: planner.durationMinutes }).toFormat('HH:mm')}`}
                      mono
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(() => {
                      const participantsToShow = session.participants.length > 0 
                        ? session.participants.map((bp) => ({ id: bp.name, name: bp.name, timezone: bp.timezone, location: bp.location }))
                        : participants.map((p) => ({ id: p.id, name: p.name, timezone: p.location?.tz || 'UTC', location: p.location }));

                      return participantsToShow.map((ppt) => {
                        const pptId = ppt.id || ppt.name;
                        const localTime = selectedSlot.localTimes[pptId] || selectedSlot.localTimes[ppt.name];
                        const localTimeFull = selectedSlot.localTimesFull?.[pptId] || selectedSlot.localTimesFull?.[ppt.name];
                        const tz = ppt.timezone || (ppt.location as { tz?: string })?.tz || 'UTC';
                        if (!localTime) return null;

                        const dateStr = localTimeFull ? localTimeFull.toFormat('EEE, MMM dd') : planner.date;
                        const hour = localTimeFull?.hour ?? parseInt(localTime.split(':')[0]);

                        return (
                          <div key={pptId} className={ui.card} style={{ padding: 10 }}>
                            <TimeRow label={`${ppt.name}`} value={`${localTime} (${dateStr})`} mono />
                            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                              {tz} • {hour >= 6 && hour < 18 ? t('daytime') : t('nighttime')}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  <button
                    className={ui.btn}
                    onClick={handleConfirmMeet}
                    style={{
                      marginTop: 12,
                      width: '100%',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      boxShadow: confirmSuccess ? '0 0 0 10px rgba(34,197,94,0.18)' : 'none',
                      transform: confirmSuccess ? 'scale(1.015)' : 'scale(1)',
                    }}
                  >
                    {confirmSuccess ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        {t('confirmed')}
                      </>
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        {t('confirmCreateMeet')}
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {planner.mode === 'manual' && participants.length === 0 && (
              <div className={ui.card} style={{ padding: 16, textAlign: 'center', backgroundColor: 'var(--card-bg)', borderStyle: 'dashed' }}>
                <div className={ui.subtitle} style={{ margin: 0 }}>
                  {t('manualNeedParticipant')}
                </div>
              </div>
            )}

            {planner.mode === 'auto' && participants.length < 2 && (
              <div className={ui.card} style={{ padding: 16, textAlign: 'center', backgroundColor: 'var(--card-bg)', borderStyle: 'dashed' }}>
                <div className={ui.subtitle} style={{ margin: 0 }}>
                  {participants.length === 0
                    ? t('autoNeedTwoParticipants')
                    : t('autoNeedOneMoreParticipant')}
                </div>
              </div>
            )}

            {session.confirmedEvent && (
              <>
                <div className={ui.divider} />
                <div>
                  <div className={ui.title} style={{ fontSize: 14, marginBottom: 8 }}>{t('meetingConfirmed')}</div>
                  <div className={ui.card} style={{ padding: 12, backgroundColor: '#22c55e20', borderColor: '#22c55e' }}>
                    <div style={{ fontSize: '13px', marginBottom: 8, fontWeight: 600 }}>{t('googleMeetLink')}</div>
                    <a href={session.confirmedEvent.meetLink} target="_blank" rel="noopener noreferrer" className={ui.link} style={{ wordBreak: 'break-all' }}>
                      {session.confirmedEvent.meetLink}
                    </a>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 8 }}>
                      {t('eventId', { id: session.confirmedEvent.eventId })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && <div style={{ color: '#ef4444', fontSize: '13px' }}>{error}</div>}
            {message && <div style={{ color: '#22c55e', fontSize: '13px' }}>{message}</div>}
          </>
        )}
      </div>
    </div>
  );
}

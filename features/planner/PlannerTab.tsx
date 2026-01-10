import { useMemo } from 'react';
import { DateTime } from 'luxon';
import ui from '@/components/ui/ui.module.css';
import { useAppStore } from '@/store/useAppStore';
import { CitySearch } from '@/features/search/CitySearch';
import { LocationCard } from '@/components/ui/LocationCard';
import { WorkingHoursEditor } from '@/components/ui/WorkingHoursEditor';
import { TimeRow } from '@/components/ui/TimeRow';
import { formatTime, findMeetingSlots } from '@/utils/time';
import { useTicker } from '@/hooks/useTicker';

export function PlannerTab() {
  const now = useTicker(1000);
  const planner = useAppStore((s) => s.planner);
  const locationsById = useAppStore((s) => s.locationsById);
  const compare = useAppStore((s) => s.compare);
  const pickFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const requestFocus = useAppStore((s) => s.requestFocus);
  const use24h = useAppStore((s) => s.use24h);

  const addPlannerParticipant = useAppStore((s) => s.addPlannerParticipant);
  const removePlannerParticipant = useAppStore((s) => s.removePlannerParticipant);
  const updatePlannerParticipantName = useAppStore((s) => s.updatePlannerParticipantName);
  const setPlannerWorkingHours = useAppStore((s) => s.setPlannerWorkingHours);
  const setPlannerDuration = useAppStore((s) => s.setPlannerDuration);
  const setPlannerDate = useAppStore((s) => s.setPlannerDate);
  const setPlannerSelectedSlot = useAppStore((s) => s.setPlannerSelectedSlot);

  const participants = planner.participants.map((ppt) => ({
    ...ppt,
    location: locationsById[ppt.locationId],
  })).filter((p) => !!p.location);

  const slots = useMemo(() => {
    if (participants.length === 0) return [];
    return findMeetingSlots(
      planner.participants,
      planner.workingHours,
      locationsById,
      planner.date,
      planner.durationMinutes,
      30
    );
  }, [planner.participants, planner.workingHours, planner.date, planner.durationMinutes, locationsById]);

  const selectedSlot = planner.selectedSlotUtc ? slots.find((s) => s.startUtc === planner.selectedSlotUtc) : null;

  return (
    <div className={ui.card}>
      <div className={ui.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div className={ui.title}>Meeting Planner</div>
          <div className={ui.subtitle}>
            Add participants, set working hours, and find overlapping time slots across timezones.
          </div>
        </div>

        <div className={ui.divider} />

        <div>
          <div className={ui.label} style={{ marginBottom: 8 }}>Duration</div>
          <div className={ui.pillRow}>
            <button
              className={`${ui.btn} ${planner.durationMinutes === 30 ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerDuration(30)}
            >
              30 min
            </button>
            <button
              className={`${ui.btn} ${planner.durationMinutes === 60 ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerDuration(60)}
            >
              60 min
            </button>
          </div>
        </div>

        <div>
          <div className={ui.label} style={{ marginBottom: 8 }}>Date</div>
          <input
            type="date"
            value={planner.date}
            onChange={(e) => setPlannerDate(e.target.value)}
            className={ui.input}
          />
        </div>

        <div className={ui.divider} />

        <div>
          <div className={ui.label} style={{ marginBottom: 8 }}>Add Participant</div>
          <CitySearch
            placeholder="Search city to add as participant…"
            onPick={(c) => {
              const loc = pickFromLatLng(c.lat, c.lng, 'search', c.label);
              requestFocus({ lat: loc.lat, lng: loc.lng, altitude: 1.6 });
              const res = addPlannerParticipant(loc.id, c.label);
              if (!res.ok && res.reason) alert(res.reason);
            }}
          />
          {compare.items.length > 0 && (
            <button
              className={ui.btn}
              style={{ marginTop: 8, width: '100%' }}
              onClick={() => {
                for (const id of compare.items) {
                  const loc = locationsById[id];
                  if (loc && !planner.participants.some((p) => p.locationId === id)) {
                    addPlannerParticipant(id, loc.label);
                  }
                }
              }}
            >
              Add all from Compare ({compare.items.length})
            </button>
          )}
        </div>

        {participants.length > 0 && (
          <>
            <div className={ui.divider} />
            <div>
              <div className={ui.title} style={{ fontSize: 14, marginBottom: 8 }}>Participants ({participants.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {participants.map((ppt) => (
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
                          const newName = prompt('Name:', ppt.name);
                          if (newName) updatePlannerParticipantName(ppt.id, newName);
                        }}
                      >
                        Rename
                      </button>
                      <button
                        className={`${ui.btn} ${ui.btnDanger}`}
                        style={{ fontSize: 12, padding: '6px 10px' }}
                        onClick={() => removePlannerParticipant(ppt.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {participants.length >= 2 && (
          <>
            <div className={ui.divider} />
            <div>
              <div className={ui.title} style={{ fontSize: 14, marginBottom: 8 }}>
                Available Slots ({slots.length} found)
              </div>
              {slots.length === 0 ? (
                <div className={ui.subtitle}>No overlapping slots found for this date and working hours.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                  {slots.slice(0, 10).map((slot, idx) => {
                    const isSelected = slot.startUtc === planner.selectedSlotUtc;
                    const startDt = DateTime.fromISO(slot.startUtc);
                    if (!startDt.isValid) return null;
                    return (
                      <div
                        key={idx}
                        className={ui.card}
                        style={{
                          padding: 10,
                          cursor: 'pointer',
                          borderColor: isSelected ? 'var(--highlight)' : undefined,
                        }}
                        onClick={() => setPlannerSelectedSlot(isSelected ? null : slot.startUtc)}
                      >
                        <div className={ui.row} style={{ marginBottom: 6 }}>
                          <div className={ui.mono} style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                            {startDt.toFormat('HH:mm')} - {startDt.plus({ minutes: planner.durationMinutes }).toFormat('HH:mm')} UTC
                          </div>
                          {isSelected && <span className={ui.badge} style={{ fontSize: 11 }}>Selected</span>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
                          {participants.map((ppt) => {
                            const localTime = slot.localTimes[ppt.id];
                            const loc = ppt.location;
                            if (!loc || !localTime) return null;
                            return (
                              <div key={ppt.id} className={ui.row} style={{ padding: '2px 0' }}>
                                <span style={{ color: 'var(--text-primary)' }}>{ppt.name}:</span>
                                <span className={ui.mono} style={{ color: 'var(--text-primary)' }}>{localTime}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 10 }}>{loc.tz}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {slots.length > 10 && (
                    <div className={ui.subtitle} style={{ textAlign: 'center', padding: 8 }}>
                      Showing first 10 of {slots.length} slots
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {participants.length < 2 && (
          <div className={ui.subtitle} style={{ textAlign: 'center', padding: 12 }}>
            Add at least 2 participants to find meeting slots
          </div>
        )}

        {selectedSlot && (
          <>
            <div className={ui.divider} />
            <div>
              <div className={ui.title} style={{ fontSize: 14, marginBottom: 8 }}>Selected Slot</div>
              <TimeRow
                label="UTC"
                value={formatTime(DateTime.fromISO(selectedSlot.startUtc), { use24h }).split(' ')[1] || ''}
                mono
              />
              {participants.map((ppt) => {
                const localTime = selectedSlot.localTimes[ppt.id];
                const loc = ppt.location;
                if (!loc || !localTime) return null;
                return (
                  <TimeRow
                    key={ppt.id}
                    label={`${ppt.name} (${loc.tz})`}
                    value={localTime}
                    mono
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}



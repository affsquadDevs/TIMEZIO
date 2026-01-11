import { useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import ui from '@/components/ui/ui.module.css';
import { useAppStore } from '@/store/useAppStore';
import { CitySearch } from '@/features/search/CitySearch';
import { LocationCard } from '@/components/ui/LocationCard';
import { WorkingHoursEditor } from '@/components/ui/WorkingHoursEditor';
import { TimeRow } from '@/components/ui/TimeRow';
import { formatTime, findMeetingSlots, createManualTimeSlot } from '@/utils/time';
import { useTicker } from '@/hooks/useTicker';
import type { TimeSlot } from '@/utils/time';

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
  const setPlannerAvoidEarlyHours = useAppStore((s) => s.setPlannerAvoidEarlyHours);
  const setPlannerAvoidLateHours = useAppStore((s) => s.setPlannerAvoidLateHours);
  const setPlannerAvoidLunch = useAppStore((s) => s.setPlannerAvoidLunch);
  const setPlannerMode = useAppStore((s) => s.setPlannerMode);
  const setPlannerManualTime = useAppStore((s) => s.setPlannerManualTime);
  
  const [manualTimeInput, setManualTimeInput] = useState<string>('14:00');

  const participants = planner.participants.map((ppt) => ({
    ...ppt,
    location: locationsById[ppt.locationId],
  })).filter((p) => !!p.location);

  const slots = useMemo(() => {
    if (participants.length === 0) return [];
    if (planner.mode === 'auto') {
    return findMeetingSlots(
      planner.participants,
      planner.workingHours,
      locationsById,
      planner.date,
      planner.durationMinutes,
        15, // Smaller step for better granularity
        planner.avoidEarlyHours,
        planner.avoidLateHours,
        planner.avoidLunch
      );
    }
    return [];
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

  // Manual time slot calculation
  const manualSlot = useMemo<TimeSlot | null>(() => {
    if (planner.mode !== 'manual') {
      return null;
    }
    // Use manualTime from state or fallback to input
    const timeToUse = planner.manualTime || manualTimeInput || '14:00';
    if (!timeToUse) {
      return null;
    }
    // Allow calculation even with 0 participants (will use UTC)
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

  const selectedSlot = planner.mode === 'auto' 
    ? (planner.selectedSlotUtc ? slots.find((s) => s.startUtc === planner.selectedSlotUtc) : null)
    : manualSlot;

  return (
    <div className={ui.card}>
      <div className={ui.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div className={ui.title}>Meeting Planner</div>
          <div className={ui.subtitle}>
            Add participants from different time zones, set their working hours, and find the best meeting times. Choose between automatic slot finding or manual time selection. All calculations account for daylight saving time.
          </div>
        </div>

        <div className={ui.divider} />

        {/* Mode Selection */}
        <div>
          <div className={ui.label} style={{ marginBottom: 8 }}>Mode</div>
          <div className={ui.pillRow}>
            <button
              className={`${ui.btn} ${planner.mode === 'auto' ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerMode('auto')}
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              🔍 Auto Find Slots
            </button>
            <button
              className={`${ui.btn} ${planner.mode === 'manual' ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerMode('manual')}
              style={{ fontSize: '13px', padding: '8px 16px' }}
            >
              ⏰ Manual Time Pick
            </button>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 6 }}>
            {planner.mode === 'auto' 
              ? 'Automatically find the best available meeting times based on working hours'
              : 'Manually select a specific time and see it converted to all participants\' time zones'}
          </div>
        </div>

        <div className={ui.divider} />

        <div>
          <div className={ui.label} style={{ marginBottom: 8 }}>Duration</div>
          <div className={ui.pillRow}>
            <button
              className={`${ui.btn} ${planner.durationMinutes === 15 ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerDuration(15)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              15 min
            </button>
            <button
              className={`${ui.btn} ${planner.durationMinutes === 30 ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerDuration(30)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              30 min
            </button>
            <button
              className={`${ui.btn} ${planner.durationMinutes === 45 ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerDuration(45)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              45 min
            </button>
            <button
              className={`${ui.btn} ${planner.durationMinutes === 60 ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerDuration(60)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              60 min
            </button>
            <button
              className={`${ui.btn} ${planner.durationMinutes === 90 ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerDuration(90)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              90 min
            </button>
            <button
              className={`${ui.btn} ${planner.durationMinutes === 120 ? ui.btnPrimary : ''}`}
              onClick={() => setPlannerDuration(120)}
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              2 hours
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

        <div>
          <div className={ui.label} style={{ marginBottom: 8 }}>Preferences</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '13px', cursor: 'pointer', padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={planner.avoidEarlyHours}
                onChange={(e) => setPlannerAvoidEarlyHours(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ userSelect: 'none' }}>Avoid meetings before 8 AM local time</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '13px', cursor: 'pointer', padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={planner.avoidLateHours}
                onChange={(e) => setPlannerAvoidLateHours(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ userSelect: 'none' }}>Avoid meetings after 8 PM local time</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '13px', cursor: 'pointer', padding: '6px 0' }}>
              <input
                type="checkbox"
                checked={planner.avoidLunch}
                onChange={(e) => setPlannerAvoidLunch(e.target.checked)}
                style={{ cursor: 'pointer', width: '16px', height: '16px' }}
              />
              <span style={{ userSelect: 'none' }}>Avoid lunch time (12:00-13:00)</span>
            </label>
          </div>
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

        {/* Manual Time Selection */}
        {planner.mode === 'manual' && (
          <>
            <div className={ui.divider} />
            <div>
              <div className={ui.label} style={{ marginBottom: 12 }}>Select Time</div>
              {participants.length === 0 ? (
                <div className={ui.card} style={{ padding: 16, textAlign: 'center', backgroundColor: 'var(--card-bg)', borderStyle: 'dashed', marginBottom: 12 }}>
                  <div className={ui.subtitle} style={{ margin: 0, marginBottom: 8 }}>
                    👥 Add at least one participant to convert time to different time zones
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    You can still pick a time, but it will only show in UTC until you add participants
                  </div>
                </div>
              ) : null}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {participants.length > 0 && (
                  <div>
                    <div className={ui.label} style={{ marginBottom: 6, fontSize: '12px' }}>Base Timezone</div>
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
                            {ppt.name} ({loc?.tz || 'Unknown'})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                <div>
                  <div className={ui.label} style={{ marginBottom: 6, fontSize: '12px' }}>
                    Meeting Time {participants.length > 0 ? `(${participants.find((p) => p.id === planner.manualTimeBaseParticipantId)?.name || participants[0]?.name || 'UTC'}'s timezone)` : '(UTC)'}
                  </div>
                  <input
                    type="time"
                    value={planner.manualTime || manualTimeInput || '14:00'}
                    onChange={(e) => {
                      const time = e.target.value || '14:00';
                      setManualTimeInput(time);
                      if (participants.length > 0) {
                        const baseId = planner.manualTimeBaseParticipantId || participants[0]?.id || null;
                        if (baseId) {
                          setPlannerManualTime(time, baseId);
                        }
                      } else {
                        // If no participants, save time for UTC display
                        setPlannerManualTime(time, null);
                      }
                    }}
                    className={ui.input}
                    style={{ marginBottom: 8, fontSize: '14px', padding: '10px 12px', width: '100%', boxSizing: 'border-box' }}
                  />
                  {participants.length === 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      Add participants above to see time converted to their time zones
                    </div>
                  )}
                </div>
                {manualSlot && (
                  <div className={ui.card} style={{ padding: 12, backgroundColor: 'var(--card-bg)', marginTop: 8 }}>
                    <div className={ui.label} style={{ marginBottom: 8, fontSize: '12px' }}>
                      {participants.length > 0 ? 'Converted Times' : 'UTC Time'}
                    </div>
                    {participants.length === 0 ? (
                      <div style={{ fontSize: '13px' }}>
                        {DateTime.fromISO(manualSlot.startUtc).isValid && DateTime.fromISO(manualSlot.endUtc).isValid ? (
                          <>
                            <div className={ui.mono} style={{ fontWeight: 600, fontSize: '14px', marginBottom: 6 }}>
                              {DateTime.fromISO(manualSlot.startUtc).toFormat('HH:mm')} - {DateTime.fromISO(manualSlot.endUtc).toFormat('HH:mm')} UTC
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              Add participants above to see this time converted to their local time zones
                            </div>
                          </>
                        ) : (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                            Invalid time selected. Please choose a valid time.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {participants.map((ppt) => {
                          const localTime = manualSlot.localTimes[ppt.id];
                          const localTimeFull = manualSlot.localTimesFull?.[ppt.id];
                          const loc = locationsById[ppt.locationId];
                          if (!loc || !localTime) return null;

                          const hour = localTimeFull?.hour ?? parseInt(localTime.split(':')[0]);
                          const timeLabel = hour < 12 ? '🌅 Morning' : hour < 17 ? '☀️ Afternoon' : hour < 21 ? '🌆 Evening' : '🌙 Night';
                          const isInWorkingHours = (() => {
                            const hours = planner.workingHours[ppt.id];
                            if (!hours) return null;
                            const workStart = parseInt(hours.start.split(':')[0]);
                            const workEnd = parseInt(hours.end.split(':')[0]);
                            return hour >= workStart && hour < workEnd;
                          })();

                          return (
                            <div
                              key={ppt.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '6px 8px',
                                borderRadius: '6px',
                                backgroundColor: isInWorkingHours === true ? '#22c55e20' : isInWorkingHours === false ? '#ef444420' : 'transparent',
                                border: `1px solid ${isInWorkingHours === true ? '#22c55e40' : isInWorkingHours === false ? '#ef444440' : 'transparent'}`,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontWeight: 600, fontSize: '13px' }}>{ppt.name}:</span>
                                <span className={ui.mono} style={{ fontSize: '14px', fontWeight: 600 }}>
                                  {localTime}
                                </span>
                                {isInWorkingHours !== null && (
                                  <span style={{ fontSize: '10px', color: isInWorkingHours ? '#22c55e' : '#ef4444' }}>
                                    {isInWorkingHours ? '✓ In hours' : '⚠ Outside hours'}
                                  </span>
                                )}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {timeLabel} • {loc.tz.split('/').pop()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Auto Mode - Available Slots */}
        {planner.mode === 'auto' && participants.length >= 2 && (
          <>
            <div className={ui.divider} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <div className={ui.title} style={{ fontSize: 14, margin: 0 }}>
                Available Slots ({slots.length} found)
                </div>
                {slots.length > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Sorted by quality • Best times first
                  </div>
                )}
              </div>
              {slots.length === 0 ? (
                <div className={ui.subtitle}>No overlapping slots found for this date and working hours. Try adjusting working hours, date, or switch to manual mode.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                  {slots.slice(0, 15).map((slot, idx) => {
                    const isSelected = slot.startUtc === planner.selectedSlotUtc;
                    const startDt = DateTime.fromISO(slot.startUtc);
                    if (!startDt.isValid) return null;

                    const qualityScore = slot.qualityScore ?? 0;
                    const qualityColor = qualityScore >= 80 ? '#22c55e' : qualityScore >= 60 ? '#eab308' : '#ef4444';
                    const qualityLabel = qualityScore >= 80 ? 'Great' : qualityScore >= 60 ? 'Good' : 'Fair';

                    return (
                      <div
                        key={idx}
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
                              title={`Quality score: ${qualityScore.toFixed(0)}/100`}
                            >
                              {qualityLabel}
                            </div>
                          </div>
                          {isSelected && (
                            <span className={ui.badge} style={{ fontSize: 11, backgroundColor: 'var(--highlight)', color: 'var(--background)' }}>
                              Selected
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                          {participants.map((ppt) => {
                            const localTime = slot.localTimes[ppt.id];
                            const localTimeFull = slot.localTimesFull?.[ppt.id];
                            const loc = ppt.location;
                            if (!loc || !localTime) return null;

                            const hour = localTimeFull?.hour ?? parseInt(localTime.split(':')[0]);
                            const isDaytime = hour >= 6 && hour < 18;
                            const timeLabel = hour < 12 ? '🌅 Morning' : hour < 17 ? '☀️ Afternoon' : hour < 21 ? '🌆 Evening' : '🌙 Night';

                            return (
                              <div
                                key={ppt.id}
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
                                  <span style={{ fontFamily: 'monospace' }}>{loc.tz.split('/').pop()}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {slots.length > 15 && (
                    <div className={ui.subtitle} style={{ textAlign: 'center', padding: 8 }}>
                      Showing top 15 of {slots.length} available slots (sorted by quality)
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {((planner.mode === 'auto' && participants.length < 2) || (planner.mode === 'manual' && participants.length < 1)) && (
          <div className={ui.card} style={{ padding: 16, textAlign: 'center', backgroundColor: 'var(--card-bg)', borderStyle: 'dashed' }}>
            <div className={ui.subtitle} style={{ margin: 0 }}>
              {planner.mode === 'auto' 
                ? (participants.length === 0 
                    ? '👥 Add at least 2 participants to start finding meeting slots'
                    : '➕ Add one more participant to find available meeting times')
                : (participants.length === 0 
                    ? '👥 Add at least 1 participant to set manual meeting time'
                    : '✅ Select time above to see it converted to all time zones')}
            </div>
            {participants.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
                Search for cities above or add participants from the Compare tab
              </div>
            )}
          </div>
        )}

        {selectedSlot && (planner.mode === 'auto' || planner.mode === 'manual') && (
          <>
            <div className={ui.divider} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div className={ui.title} style={{ fontSize: 14, margin: 0 }}>
                  {planner.mode === 'manual' ? 'Selected Time' : 'Selected Slot'}
                </div>
                <button
                  className={ui.btn}
                  style={{ fontSize: 11, padding: '4px 8px' }}
                  onClick={() => {
                    const startDt = DateTime.fromISO(selectedSlot.startUtc);
                    if (!startDt.isValid) return;

                    let text = `${planner.mode === 'manual' ? 'Meeting Time' : 'Meeting Slot'}:\n`;
                    text += `Date: ${planner.date}\n`;
                    text += `UTC: ${startDt.toFormat('HH:mm')} - ${startDt.plus({ minutes: planner.durationMinutes }).toFormat('HH:mm')}\n\n`;
                    text += `Local times:\n`;
                    participants.forEach((ppt) => {
                      const localTime = selectedSlot.localTimes[ppt.id];
                      const localTimeFull = selectedSlot.localTimesFull?.[ppt.id];
                      const loc = ppt.location;
                      if (loc && localTime) {
                        const dateStr = localTimeFull ? localTimeFull.toFormat('EEE, MMM dd') : planner.date;
                        text += `${ppt.name} (${loc.tz}): ${localTime} on ${dateStr}\n`;
                      }
                    });
                    text += `\nDuration: ${planner.durationMinutes} minutes`;

                    navigator.clipboard.writeText(text).then(() => {
                      alert('Meeting details copied to clipboard!');
                    }).catch(() => {
                      // Fallback
                      prompt('Copy this text:', text);
                    });
                  }}
                >
                  📋 Copy Details
                </button>
              </div>
              <div className={ui.card} style={{ padding: 12, backgroundColor: 'var(--card-bg)', marginBottom: 12 }}>
              <TimeRow
                  label="UTC Time"
                  value={`${DateTime.fromISO(selectedSlot.startUtc).toFormat('HH:mm')} - ${DateTime.fromISO(selectedSlot.startUtc).plus({ minutes: planner.durationMinutes }).toFormat('HH:mm')}`}
                mono
              />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {participants.map((ppt) => {
                const localTime = selectedSlot.localTimes[ppt.id];
                  const localTimeFull = selectedSlot.localTimesFull?.[ppt.id];
                const loc = ppt.location;
                if (!loc || !localTime) return null;

                  const dateStr = localTimeFull ? localTimeFull.toFormat('EEE, MMM dd') : planner.date;
                  const hour = localTimeFull?.hour ?? parseInt(localTime.split(':')[0]);

                return (
                    <div key={ppt.id} className={ui.card} style={{ padding: 10 }}>
                  <TimeRow
                        label={`${ppt.name}`}
                        value={`${localTime} (${dateStr})`}
                    mono
                  />
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {loc.tz} • {hour >= 6 && hour < 18 ? '🌅 Daytime' : '🌙 Nighttime'}
                      </div>
                    </div>
                );
              })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



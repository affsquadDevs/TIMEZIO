import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DateTime } from 'luxon';
import tzLookup from 'tz-lookup';

import type { AppTab, CompareState, IsoDate, Location, LocationSource, PlannerParticipant, PlannerState, WorkingHours } from '@/types/domain';
import type { TimezoneMode } from '@/utils/timezoneBand';
import { makeId } from '@/utils/id';
import { parseShareParams } from '@/utils/share';

type FocusTarget = { lat: number; lng: number; altitude?: number } | null;

type AppState = {
  tab: AppTab;

  locationsById: Record<string, Location>;
  selectedId: string | null;

  compare: CompareState;
  planner: PlannerState;

  savedIds: string[];
  use24h: boolean;
  timezoneMode: TimezoneMode;
  theme: 'light' | 'dark';

  focusTarget: FocusTarget;

  setTab: (tab: AppTab) => void;
  toggle24h: () => void;
  setTimezoneMode: (mode: TimezoneMode) => void;
  setTheme: (theme: 'light' | 'dark') => void;

  upsertLocation: (loc: Location) => void;
  pickLocationFromLatLng: (lat: number, lng: number, source: LocationSource, label?: string) => Location;
  selectLocation: (id: string | null) => void;
  requestFocus: (target: FocusTarget) => void;

  addToCompare: (id: string) => { ok: boolean; reason?: string };
  removeFromCompare: (id: string) => void;
  setCompareBase: (id: string | null) => void;
  clearCompare: () => void;

  toggleSaved: (id: string) => void;
  removeSaved: (id: string) => void;

  // Planner actions
  addPlannerParticipant: (locationId: string, name?: string) => { ok: boolean; reason?: string; participantId?: string };
  removePlannerParticipant: (participantId: string) => void;
  updatePlannerParticipantName: (participantId: string, name: string) => void;
  setPlannerWorkingHours: (participantId: string, hours: WorkingHours) => void;
  setPlannerDuration: (minutes: 30 | 60) => void;
  setPlannerDate: (date: IsoDate) => void;
  setPlannerSelectedSlot: (slotUtc: string | null) => void;

  hydrateFromUrl: () => void;
};

const defaultPlanner: PlannerState = {
  participants: [],
  workingHours: {},
  durationMinutes: 30,
  date: DateTime.now().toFormat('yyyy-LL-dd'),
  selectedSlotUtc: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      tab: 'explore',

      locationsById: {},
      selectedId: null,

      compare: { baseId: null, items: [], mode: 'offset' },
      planner: defaultPlanner,

      savedIds: [],
      use24h: true,
      timezoneMode: 'simple',
      theme: 'light',

      focusTarget: null,

      setTab: (tab) => set({ tab }),
      toggle24h: () => set((s) => ({ use24h: !s.use24h })),
      setTimezoneMode: (mode) => set({ timezoneMode: mode }),
      setTheme: (theme) => set({ theme }),

      upsertLocation: (loc) =>
        set((s) => ({
          locationsById: {
            ...s.locationsById,
            [loc.id]: loc,
          },
        })),

      pickLocationFromLatLng: (lat, lng, source, label) => {
        const tz = tzLookup(lat, lng);
        const loc: Location = {
          id: makeId('loc'),
          label: label ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          lat,
          lng,
          tz,
          source,
          pinned: false,
        };
        get().upsertLocation(loc);
        set({ selectedId: loc.id });
        return loc;
      },

      selectLocation: (id) => set({ selectedId: id }),
      requestFocus: (target) => set({ focusTarget: target }),

      addToCompare: (id) => {
        const { compare } = get();
        if (compare.items.includes(id)) return { ok: false, reason: 'Already in compare.' };
        if (compare.items.length >= 6) return { ok: false, reason: 'Max 6 locations.' };
        const nextItems = [...compare.items, id];
        const nextBaseId = compare.baseId ?? id;
        set({ compare: { ...compare, items: nextItems, baseId: nextBaseId } });
        return { ok: true };
      },

      removeFromCompare: (id) => {
        const { compare } = get();
        const nextItems = compare.items.filter((x) => x !== id);
        const nextBaseId = compare.baseId === id ? (nextItems[0] ?? null) : compare.baseId;
        set({ compare: { ...compare, items: nextItems, baseId: nextBaseId } });
      },

      setCompareBase: (id) => {
        const { compare } = get();
        set({ compare: { ...compare, baseId: id } });
      },

      clearCompare: () => set((s) => ({ compare: { ...s.compare, baseId: null, items: [] } })),

      toggleSaved: (id) =>
        set((s) => ({
          savedIds: s.savedIds.includes(id) ? s.savedIds.filter((x) => x !== id) : [id, ...s.savedIds],
        })),

      removeSaved: (id) => set((s) => ({ savedIds: s.savedIds.filter((x) => x !== id) })),

      addPlannerParticipant: (locationId, name) => {
        const { planner, locationsById } = get();
        if (!locationsById[locationId]) return { ok: false, reason: 'Location not found.' };
        if (planner.participants.some((p) => p.locationId === locationId)) {
          return { ok: false, reason: 'Location already added.' };
        }
        const participant: PlannerParticipant = {
          id: makeId('ppt'),
          locationId,
          name: name ?? locationsById[locationId].label,
        };
        const defaultHours: WorkingHours = { start: '09:00', end: '17:00' };
        set((s) => ({
          planner: {
            ...s.planner,
            participants: [...s.planner.participants, participant],
            workingHours: { ...s.planner.workingHours, [participant.id]: defaultHours },
          },
        }));
        return { ok: true, participantId: participant.id };
      },

      removePlannerParticipant: (participantId) =>
        set((s) => {
          const { [participantId]: removed, ...restHours } = s.planner.workingHours;
          return {
            planner: {
              ...s.planner,
              participants: s.planner.participants.filter((p) => p.id !== participantId),
              workingHours: restHours,
            },
          };
        }),

      updatePlannerParticipantName: (participantId, name) =>
        set((s) => ({
          planner: {
            ...s.planner,
            participants: s.planner.participants.map((p) => (p.id === participantId ? { ...p, name } : p)),
          },
        })),

      setPlannerWorkingHours: (participantId, hours) =>
        set((s) => ({
          planner: {
            ...s.planner,
            workingHours: { ...s.planner.workingHours, [participantId]: hours },
          },
        })),

      setPlannerDuration: (minutes) =>
        set((s) => ({
          planner: {
            ...s.planner,
            durationMinutes: minutes,
          },
        })),

      setPlannerDate: (date) =>
        set((s) => ({
          planner: {
            ...s.planner,
            date,
          },
        })),

      setPlannerSelectedSlot: (slotUtc) =>
        set((s) => ({
          planner: {
            ...s.planner,
            selectedSlotUtc: slotUtc,
          },
        })),

      hydrateFromUrl: () => {
        if (typeof window === 'undefined') return;
        const payload = parseShareParams(window.location.search);
        if (!payload) return;

        const locations = payload.locations ?? [];
        const locationsById: Record<string, Location> = {};
        for (const loc of locations) locationsById[loc.id] = loc;

        set((s) => ({
          tab: payload.tab ?? s.tab,
          locationsById: { ...s.locationsById, ...locationsById },
          selectedId: payload.selectedId ?? s.selectedId,
          compare: {
            ...s.compare,
            items:
              payload.compareIds?.filter((id) => !!locationsById[id] || !!s.locationsById[id]) ?? s.compare.items,
            baseId: payload.compareBaseId ?? s.compare.baseId,
          },
          savedIds: payload.savedIds ?? s.savedIds,
        }));
      },
    }),
          {
            name: 'timezio-store',
            partialize: (s) => ({
              savedIds: s.savedIds,
              use24h: s.use24h,
              timezoneMode: s.timezoneMode,
              theme: s.theme,
            }),
          }
  )
);

export function useSelectedLocation() {
  return useAppStore((s) => (s.selectedId ? s.locationsById[s.selectedId] : null));
}



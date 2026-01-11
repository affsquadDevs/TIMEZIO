export type LocationSource = 'click' | 'search' | 'saved';

export type AppTab = 'explore' | 'compare' | 'planner' | 'dst' | 'saved';

export type IsoDate = string; // yyyy-MM-dd

export type Location = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  tz: string; // IANA timezone, e.g. "Europe/Kyiv"
  source: LocationSource;
  pinned?: boolean;
};

export type CompareMode = 'offset' | 'timeDiff';

export type CompareState = {
  baseId: string | null;
  items: string[]; // location ids, max 6
  mode: CompareMode;
};

export type PlannerParticipant = {
  id: string;
  locationId: string;
  name: string;
};

export type WorkingHours = {
  start: string; // "09:00"
  end: string; // "17:00"
};

export type PlannerMode = 'auto' | 'manual'; // auto = find slots, manual = pick time manually

export type PlannerState = {
  participants: PlannerParticipant[];
  workingHours: Record<string, WorkingHours>; // by participant id
  durationMinutes: 15 | 30 | 45 | 60 | 90 | 120;
  date: IsoDate; // selected date (base date)
  selectedSlotUtc: string | null; // ISO string in UTC
  avoidEarlyHours: boolean; // avoid meetings before 8 AM local time
  avoidLateHours: boolean; // avoid meetings after 8 PM local time
  avoidLunch: boolean; // avoid 12:00-13:00 local time
  mode: PlannerMode; // auto or manual time selection
  manualTime: string | null; // "HH:mm" in base timezone for manual mode
  manualTimeBaseParticipantId: string | null; // participant whose timezone is used for manual input
};





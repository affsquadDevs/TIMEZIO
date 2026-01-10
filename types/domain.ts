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

export type PlannerState = {
  participants: PlannerParticipant[];
  workingHours: Record<string, WorkingHours>; // by participant id
  durationMinutes: 30 | 60;
  date: IsoDate; // selected date (base date)
  selectedSlotUtc: string | null; // ISO string in UTC
};





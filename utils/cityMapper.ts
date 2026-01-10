import citiesData from '@/data/cities.top200.json';

type City = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  tz: string;
};

// Normalize city slug to match JSON IDs
const normalizeCitySlug = (slug: string): string => {
  return slug.toLowerCase().replace(/-/g, '_');
};

// Extended city slug aliases (handle variations)
const cityAliases: Record<string, string> = {
  'san-francisco': 'los_angeles', // Same timezone as LA
  'sf': 'los_angeles',
  'la': 'los_angeles',
  'nyc': 'new_york',
  'ny': 'new_york',
};

// Region to city mappings for DST pages
const regionToCity: Record<string, string> = {
  'us': 'new_york', // Major US city
  'uk': 'london',
  'eu': 'paris', // Major EU city
  'europe': 'paris',
  'australia': 'sydney',
  'india': 'delhi',
  'asia': 'tokyo',
  'america': 'new_york',
  'north-america': 'new_york',
  'south-america': 'sao_paulo',
};

// Timezone abbreviations to city mappings
const tzToCity: Record<string, string> = {
  // US timezones
  pst: 'los_angeles',
  pdt: 'los_angeles',
  mst: 'phoenix',
  mdt: 'denver',
  cst: 'chicago',
  cdt: 'chicago',
  est: 'new_york',
  edt: 'new_york',
  ast: 'puerto_rico',
  adt: 'puerto_rico',
  hst: 'honolulu',
  
  // Common abbreviations
  utc: 'london', // UTC+0 reference
  gmt: 'london',
  cet: 'paris',
  cest: 'paris',
  ist: 'delhi', // India Standard Time
  jst: 'tokyo',
  kst: 'seoul',
  cst_china: 'beijing',
  sgt: 'singapore',
  aedt: 'sydney',
  aest: 'sydney',
  nzdt: 'auckland',
  nzst: 'auckland',
};

export function findCityBySlug(slug: string): City | null {
  const normalized = normalizeCitySlug(slug);
  
  // Check aliases first
  const aliased = cityAliases[normalized];
  if (aliased) {
    const city = (citiesData as City[]).find((c) => c.id === aliased);
    if (city) return city;
  }
  
  // Direct lookup
  const city = (citiesData as City[]).find((c) => c.id === normalized);
  if (city) return city;
  
  // Try partial match (e.g., "san-francisco" might match "san_francisco" if exists)
  const partialMatch = (citiesData as City[]).find((c) => 
    c.id.includes(normalized) || normalized.includes(c.id.replace(/_/g, '-'))
  );
  
  return partialMatch || null;
}

export function findCityByTimezone(tzAbbr: string): City | null {
  const normalized = tzAbbr.toLowerCase().trim();
  const cityId = tzToCity[normalized];
  if (!cityId) return null;
  
  const city = (citiesData as City[]).find((c) => c.id === cityId);
  return city || null;
}

export function parseCityPair(pair: string): { from: City | null; to: City | null } {
  if (!pair) return { from: null, to: null };
  
  const parts = pair.toLowerCase().split('-to-');
  if (parts.length !== 2) return { from: null, to: null };
  
  const [fromSlug, toSlug] = parts;
  
  // Try as city slugs first
  let fromCity = findCityBySlug(fromSlug);
  let toCity = findCityBySlug(toSlug);
  
  // If not found, try as timezone abbreviations
  if (!fromCity) fromCity = findCityByTimezone(fromSlug);
  if (!toCity) toCity = findCityByTimezone(toSlug);
  
  return { from: fromCity, to: toCity };
}

export function parseMeetingPair(pair: string): { cityA: City | null; cityB: City | null } {
  if (!pair) return { cityA: null, cityB: null };
  
  const parts = pair.toLowerCase().split('-to-');
  if (parts.length !== 2) return { cityA: null, cityB: null };
  
  const [aSlug, bSlug] = parts;
  
  // Try as city slugs first
  let cityA = findCityBySlug(aSlug);
  let cityB = findCityBySlug(bSlug);
  
  // If not found, try as timezone abbreviations
  if (!cityA) cityA = findCityByTimezone(aSlug);
  if (!cityB) cityB = findCityByTimezone(bSlug);
  
  return { cityA, cityB };
}

export function findCityByRegion(region: string): City | null {
  const normalized = region.toLowerCase().trim();
  
  // Check region mapping first
  const regionCityId = regionToCity[normalized];
  if (regionCityId) {
    const city = (citiesData as City[]).find((c) => c.id === regionCityId);
    if (city) return city;
  }
  
  // Try as city slug
  return findCityBySlug(normalized);
}


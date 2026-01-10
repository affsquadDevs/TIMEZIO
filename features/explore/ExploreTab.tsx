import ui from '@/components/ui/ui.module.css';
import { useTicker } from '@/hooks/useTicker';
import { useAppStore, useSelectedLocation } from '@/store/useAppStore';
import { CitySearch } from '@/features/search/CitySearch';
import { TimeDisplay } from '@/components/ui/TimeDisplay';
import { CityTimeCard } from '@/components/ui/CityTimeCard';

type City = { id: string; label: string; lat: number; lng: number; tz: string };

// Popular cities for quick access
const popularCities = [
  { id: 'london', label: 'London, UK', lat: 51.5072, lng: -0.1276, tz: 'Europe/London' },
  { id: 'paris', label: 'Paris, FR', lat: 48.8566, lng: 2.3522, tz: 'Europe/Paris' },
  { id: 'new_york', label: 'New York, US', lat: 40.7128, lng: -74.006, tz: 'America/New_York' },
  { id: 'los_angeles', label: 'Los Angeles, US', lat: 34.0522, lng: -118.2437, tz: 'America/Los_Angeles' },
];

export function ExploreTab() {
  const now = useTicker(1000);
  const selected = useSelectedLocation();
  const pickFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const selectLocation = useAppStore((s) => s.selectLocation);
  const locationsById = useAppStore((s) => s.locationsById);
  const requestFocus = useAppStore((s) => s.requestFocus);

  // Get popular cities with their current locations or create them
  const cityCards = popularCities.map((city) => {
    const existingLoc = Object.values(locationsById).find((l) => l.label === city.label);
    if (existingLoc) return existingLoc;
    
    // Create location object for display
    return {
      id: city.id,
      label: city.label,
      tz: city.tz,
      lat: city.lat,
      lng: city.lng,
      source: 'search' as const,
      pinned: false,
    };
  });

  const handleCityClick = (city: City) => {
    const loc = pickFromLatLng(city.lat, city.lng, 'search', city.label);
    selectLocation(loc.id);
    requestFocus({ lat: loc.lat, lng: loc.lng, altitude: 1.6 });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: 0 }}>
      {/* Large Time Display */}
      <div className={ui.card}>
        <div className={ui.cardBody} style={{ padding: '16px' }}>
          <TimeDisplay location={selected} />
        </div>
      </div>

      {/* City Search */}
      <div className={ui.card}>
        <div className={ui.cardBody} style={{ padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div className={ui.title}>Search City</div>
            <div className={ui.subtitle} style={{ marginTop: '4px' }}>Find any city around the world</div>
          </div>
          <CitySearch
            onPick={(c) => {
              const loc = pickFromLatLng(c.lat, c.lng, 'search', c.label);
              selectLocation(loc.id);
              requestFocus({ lat: loc.lat, lng: loc.lng, altitude: 1.6 });
            }}
          />
        </div>
      </div>

      {/* Popular Cities Grid */}
      <div className={ui.card}>
        <div className={ui.cardBody} style={{ padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div className={ui.title}>Popular Cities</div>
            <div className={ui.subtitle}>Click on a city to view its time</div>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
            gap: '12px' 
          }}>
          {cityCards.map((city) => {
            const loc = Object.values(locationsById).find((l) => 
              l.label === city.label || 
              (Math.abs(l.lat - city.lat) < 0.01 && Math.abs(l.lng - city.lng) < 0.01)
            ) || city;
            
            return (
              <CityTimeCard
                key={city.id}
                location={loc}
                isSelected={selected?.id === loc.id}
                onClick={() => handleCityClick(city)}
              />
            );
          })}
          </div>
        </div>
      </div>

    </div>
  );
}



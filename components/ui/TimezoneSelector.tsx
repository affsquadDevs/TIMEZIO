'use client';

import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import ui from '@/components/ui/ui.module.css';
import { getAllTimezones, formatTimezoneName, searchTimezones } from '@/utils/timezones';
import { getUserTimezone, saveUserTimezone, clearUserTimezone, getCurrentUserTimezone } from '@/utils/userTimezone';
import { useToast } from '@/components/ui/Toast';

interface TimezoneSelectorProps {
  value?: string;
  onChange?: (timezone: string) => void;
  showSaveOption?: boolean;
  showClearOption?: boolean;
}

export function TimezoneSelector({ value, onChange, showSaveOption = false, showClearOption = false }: TimezoneSelectorProps) {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [savedTimezone, setSavedTimezone] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentValue, setCurrentValue] = useState<string>(value || 'UTC');
  const [isMounted, setIsMounted] = useState(false);

  const timezonesByRegion = useMemo(() => getAllTimezones(), []);
  const regions = useMemo(() => Object.keys(timezonesByRegion).sort(), [timezonesByRegion]);

  // Load saved timezone on mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    const saved = getUserTimezone();
    setSavedTimezone(saved);
    
    // Determine current value: value prop > saved > browser timezone
    const computedValue = value || saved || getCurrentUserTimezone();
    setCurrentValue(computedValue);
    
    // If no value provided and we have saved timezone, use it
    if (!value && saved && onChange) {
      onChange(saved);
    }
  }, [value, onChange]);

  // Update currentValue when value prop changes
  useEffect(() => {
    if (value) {
      setCurrentValue(value);
    }
  }, [value]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchTimezones(searchQuery).slice(0, 20); // Limit to 20 results
  }, [searchQuery]);

  // Determine which timezones to show
  const timezonesToShow = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    if (selectedRegion && timezonesByRegion[selectedRegion]) {
      return timezonesByRegion[selectedRegion];
    }
    return [];
  }, [searchQuery, searchResults, selectedRegion, timezonesByRegion]);

  const handleTimezoneSelect = (tz: string) => {
    if (onChange) {
      onChange(tz);
    }
    setIsExpanded(false);
    setSearchQuery('');
    setSelectedRegion(null);
  };

  const handleSave = () => {
    if (currentValue) {
      saveUserTimezone(currentValue);
      setSavedTimezone(currentValue);
      showToast(`Timezone "${formatTimezoneName(currentValue)}" saved!`, 'success');
    }
  };

  const handleClear = () => {
    clearUserTimezone();
    setSavedTimezone(null);
    if (onChange) {
      // Reset to browser's timezone
      const browserTz = getCurrentUserTimezone();
      onChange(browserTz);
    }
    showToast('Saved timezone cleared!', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Current selection */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div className={ui.label} style={{ marginBottom: 4, fontSize: '12px' }} suppressHydrationWarning>
            {isMounted && currentValue ? formatTimezoneName(currentValue) : (value || 'Select timezone')}
          </div>
          {isMounted && savedTimezone && (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: 4 }} suppressHydrationWarning>
              Saved: {formatTimezoneName(savedTimezone)}
            </div>
          )}
        </div>
        <button
          className={ui.btn}
          onClick={() => setIsExpanded(!isExpanded)}
          style={{ fontSize: '12px', padding: '6px 12px' }}
        >
          {isExpanded ? 'Hide' : 'Select'} Timezone
        </button>
        {showSaveOption && currentValue && (
          <button
            className={ui.btn}
            onClick={handleSave}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            title="Save timezone to localStorage"
          >
            Save
          </button>
        )}
        {showClearOption && savedTimezone && (
          <button
            className={`${ui.btn} ${ui.btnDanger}`}
            onClick={handleClear}
            style={{ fontSize: '12px', padding: '6px 12px' }}
            title="Clear saved timezone"
          >
            Clear
          </button>
        )}
      </div>

      {/* Expanded selector */}
      {isExpanded && (
        <div className={ui.card} style={{ padding: 12, backgroundColor: 'var(--card-bg)' }}>
          {/* Search */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Search timezone (e.g., Kyiv, New York, Tokyo)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={ui.input}
              style={{ fontSize: '13px', padding: '8px 12px' }}
            />
          </div>

          {/* Region selector or search results */}
          {searchQuery.trim() ? (
            // Search results
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {searchResults.map((tz) => {
                    const isSelected = tz === currentValue;
                    return (
                      <button
                        key={tz}
                        className={ui.btn}
                        onClick={() => handleTimezoneSelect(tz)}
                        style={{
                          fontSize: '12px',
                          padding: '8px 12px',
                          textAlign: 'left',
                          backgroundColor: isSelected ? 'var(--highlight)' : undefined,
                          color: isSelected ? 'var(--background)' : undefined,
                        }}
                      >
                        {formatTimezoneName(tz)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className={ui.subtitle} style={{ fontSize: '12px', textAlign: 'center', padding: 16 }}>
                  No timezones found for "{searchQuery}"
                </div>
              )}
            </div>
          ) : (
            // Region selector
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className={ui.label} style={{ fontSize: '12px', marginBottom: 4 }}>
                Select Region:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {regions.map((region) => (
                  <button
                    key={region}
                    className={ui.btn}
                    onClick={() => setSelectedRegion(region === selectedRegion ? null : region)}
                    style={{
                      fontSize: '11px',
                      padding: '6px 10px',
                      backgroundColor: selectedRegion === region ? 'var(--highlight)' : undefined,
                      color: selectedRegion === region ? 'var(--background)' : undefined,
                    }}
                  >
                    {region}
                  </button>
                ))}
              </div>

              {/* Timezones for selected region */}
              {selectedRegion && timezonesToShow.length > 0 && (
                <div style={{ maxHeight: 300, overflowY: 'auto', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div className={ui.label} style={{ fontSize: '12px', marginBottom: 8 }}>
                    {selectedRegion} timezones:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {timezonesToShow.map((tz) => {
                      const isSelected = tz === currentValue;
                      return (
                        <button
                          key={tz}
                          className={ui.btn}
                          onClick={() => handleTimezoneSelect(tz)}
                          style={{
                            fontSize: '12px',
                            padding: '8px 12px',
                            textAlign: 'left',
                            backgroundColor: isSelected ? 'var(--highlight)' : undefined,
                            color: isSelected ? 'var(--background)' : undefined,
                          }}
                        >
                          {formatTimezoneName(tz)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


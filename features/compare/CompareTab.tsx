import { useMemo } from 'react';
import { DateTime } from 'luxon';

import ui from '@/components/ui/ui.module.css';
import { useTicker } from '@/hooks/useTicker';
import { useAppStore, useSelectedLocation } from '@/store/useAppStore';
import { formatTime, getOffsetInfo } from '@/utils/time';
import { CitySearch } from '@/features/search/CitySearch';
import { LocationCard } from '@/components/ui/LocationCard';
import { useToast } from '@/components/ui/Toast';

function hoursDiff(baseTz: string, otherTz: string, at: DateTime) {
  const a = getOffsetInfo(baseTz, at).offsetMinutes;
  const b = getOffsetInfo(otherTz, at).offsetMinutes;
  return (b - a) / 60;
}

export function CompareTab() {
  const { showToast } = useToast();
  const now = useTicker(1000);
  const use24h = useAppStore((s) => s.use24h);
  const pickFromLatLng = useAppStore((s) => s.pickLocationFromLatLng);
  const requestFocus = useAppStore((s) => s.requestFocus);

  const compare = useAppStore((s) => s.compare);
  const addToCompare = useAppStore((s) => s.addToCompare);
  const removeFromCompare = useAppStore((s) => s.removeFromCompare);
  const setCompareBase = useAppStore((s) => s.setCompareBase);
  const clearCompare = useAppStore((s) => s.clearCompare);

  const locationsById = useAppStore((s) => s.locationsById);
  const selected = useSelectedLocation();

  const items = compare.items.map((id) => locationsById[id]).filter(Boolean);
  const base = compare.baseId ? locationsById[compare.baseId] : null;

  const matrix = useMemo(() => {
    if (!base) return null;
    return items.map((loc) => ({
      id: loc.id,
      label: loc.label,
      tz: loc.tz,
      localTime: formatTime(now.setZone(loc.tz), { use24h }),
      offset: getOffsetInfo(loc.tz, now).offsetLabel,
      diffHours: hoursDiff(base.tz, loc.tz, now),
    }));
  }, [base?.id, items, now, use24h]);

  return (
    <div className={ui.card}>
      <div className={ui.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div className={ui.title}>Compare</div>
          <div className={ui.subtitle}>Add 2–6 locations and compare offsets/time. (MVP: offsets + diff)</div>
        </div>

        <CitySearch
          placeholder="Add city to compare…"
          onPick={(c) => {
            const loc = pickFromLatLng(c.lat, c.lng, 'search', c.label);
            requestFocus({ lat: loc.lat, lng: loc.lng, altitude: 1.6 });
            const res = addToCompare(loc.id);
            if (!res.ok && res.reason) showToast(res.reason, 'error');
          }}
        />

        <div className={ui.row}>
          <button
            className={ui.btn}
            onClick={() => {
              if (!selected) return;
              const res = addToCompare(selected.id);
              if (!res.ok && res.reason) showToast(res.reason, 'error');
            }}
          >
            Add selected
          </button>
          <button className={`${ui.btn} ${ui.btnDanger}`} onClick={clearCompare}>
            Clear
          </button>
        </div>

        {items.length === 0 ? (
          <div className={ui.subtitle}>No compare items. Add a city or “Add selected”.</div>
        ) : (
          <>
            <div className={ui.subtitle}>
              Base: {base ? <span className={ui.mono}>{base.label}</span> : '—'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map((loc) => (
                <LocationCard
                  key={loc.id}
                  location={loc}
                  isSelected={compare.baseId === loc.id}
                  actions={
                    <div className={ui.pillRow}>
                      <button className={ui.btn} onClick={() => setCompareBase(loc.id)}>
                        Base
                      </button>
                      <button className={ui.btn} onClick={() => requestFocus({ lat: loc.lat, lng: loc.lng, altitude: 1.6 })}>
                        Focus
                      </button>
                      <button className={`${ui.btn} ${ui.btnDanger}`} onClick={() => removeFromCompare(loc.id)}>
                        Remove
                      </button>
                    </div>
                  }
                />
              ))}
            </div>

            {base && matrix && (
              <>
                <div className={ui.divider} />
                <div className={ui.title} style={{ fontSize: 14 }}>
                  Offset matrix (vs base)
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '8px 6px' }}>Location</th>
                        <th style={{ padding: '8px 6px' }}>Local time</th>
                        <th style={{ padding: '8px 6px' }}>UTC offset</th>
                        <th style={{ padding: '8px 6px' }}>Δ hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.map((row) => (
                        <tr key={row.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '8px 6px', fontWeight: 700, color: 'var(--text-primary)' }}>{row.label}</td>
                          <td style={{ padding: '8px 6px', fontFamily: 'ui-monospace, Menlo, monospace', color: 'var(--text-primary)' }}>{row.localTime}</td>
                          <td style={{ padding: '8px 6px', fontFamily: 'ui-monospace, Menlo, monospace', color: 'var(--text-primary)' }}>{row.offset}</td>
                          <td style={{ padding: '8px 6px', fontFamily: 'ui-monospace, Menlo, monospace', color: 'var(--text-primary)' }}>
                            {row.diffHours >= 0 ? `+${row.diffHours}` : `${row.diffHours}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}



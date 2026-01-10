'use client';

import { DateTime } from 'luxon';
import { useTicker } from '@/hooks/useTicker';
import { useAppStore } from '@/store/useAppStore';
import { getOffsetInfo } from '@/utils/time';
import styles from './ui.module.css';

import type { Location } from '@/types/domain';

interface CityTimeCardProps {
  location: Location;
  isSelected?: boolean;
  onClick?: () => void;
}

export function CityTimeCard({ location, isSelected, onClick }: CityTimeCardProps) {
  const now = useTicker(1000);
  const use24h = useAppStore((s) => s.use24h);

  const local = now.setZone(location.tz);
  const info = getOffsetInfo(location.tz, now);

  const timeStr = use24h 
    ? local.toFormat('HH:mm') 
    : local.toFormat('hh:mm a');
  
  const seconds = local.second.toString().padStart(2, '0');

  // Determine if it's day or night (simple check: 6 AM - 6 PM = day)
  const isDay = local.hour >= 6 && local.hour < 18;

  return (
    <div
      className={`${styles.cityCard} ${isSelected ? styles.cityCardSelected : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 className={styles.cityName} style={{ marginBottom: '4px' }}>{location.label}</h3>
          <div className={styles.cityOffset}>
            {info.offsetLabel}
          </div>
        </div>
        <div className={styles.dayNight}>
          {isDay ? '☀️' : '🌙'} {isDay ? 'Day' : 'Night'}
        </div>
      </div>
      
      <div className={styles.cityTime} style={{ fontSize: '36px', lineHeight: 1.2 }}>
        {timeStr}
        <span suppressHydrationWarning style={{ fontSize: '18px', opacity: 0.6, marginLeft: '4px' }}>{seconds}</span>
      </div>
    </div>
  );
}


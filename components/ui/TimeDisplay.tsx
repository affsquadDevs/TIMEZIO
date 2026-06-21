'use client';

import { useTranslations } from 'next-intl';
import { DateTime } from 'luxon';
import { useTicker } from '@/hooks/useTicker';
import { useAppStore } from '@/store/useAppStore';
import { getOffsetInfo } from '@/utils/time';
import type { Location } from '@/types/domain';
import styles from './ui.module.css';

interface TimeDisplayProps {
  location: Location | null;
}

export function TimeDisplay({ location }: TimeDisplayProps) {
  const t = useTranslations('ui.timeDisplay');
  const now = useTicker(1000);
  const use24h = useAppStore((s) => s.use24h);

  if (!location) {
    return (
      <div className={styles.timeDisplay} style={{ padding: '16px 0', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{t('selectLocation')}</p>
      </div>
    );
  }

  const local = now.setZone(location.tz);
  const info = getOffsetInfo(location.tz, now);
  
  const hour = use24h ? local.hour.toString().padStart(2, '0') : (local.hour % 12 || 12).toString().padStart(2, '0');
  const minute = local.minute.toString().padStart(2, '0');
  const second = local.second.toString().padStart(2, '0');
  const milliseconds = Math.floor(local.millisecond / 10).toString().padStart(2, '0');
  const amPm = use24h ? '' : local.toFormat('a');

  const dayOfWeek = local.toFormat('EEE');
  const date = local.toFormat('dd MMM');

  // Determine if it's day or night (simple check: 6 AM - 6 PM = day)
  const isDay = local.hour >= 6 && local.hour < 18;
  
  // Calculate sunrise/sunset (simplified, using 7:12 and 17:17 as example)
  const sunrise = '07:12';
  const sunset = '17:17';

  return (
    <div className={styles.timeDisplay} style={{ padding: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span className={styles.timeDisplayLarge} style={{ fontSize: 'clamp(48px, 10vw, 80px)' }}>
              {hour}
            </span>
            <span className={styles.timeDisplayMedium} style={{ fontSize: 'clamp(48px, 10vw, 80px)', opacity: 0.5 }}>
              :{minute}
            </span>
            {!use24h ? (
              <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '4px', lineHeight: 1 }}>
                <span suppressHydrationWarning className={styles.timeDisplayMedium} style={{ fontSize: 'clamp(18px, 4vw, 24px)', opacity: 0.8, lineHeight: 1, marginBottom: '2px' }}>
                  {second}
                </span>
                <span className={styles.timeDisplayMedium} style={{ fontSize: 'clamp(20px, 5vw, 32px)', opacity: 0.7, lineHeight: 1 }}>
                  {amPm}
                </span>
              </div>
            ) : (
              <span suppressHydrationWarning className={styles.timeDisplayMedium} style={{ fontSize: 'clamp(20px, 5vw, 32px)', marginLeft: '4px' }}>
                {second}
              </span>
            )}
            <span style={{ fontSize: 'clamp(14px, 3vw, 18px)', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '8px', lineHeight: 1, whiteSpace: 'nowrap' }}>
              {dayOfWeek}, {date}
            </span>
          </div>
          
          {use24h && (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
              <span suppressHydrationWarning style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 600, color: 'var(--text-secondary)' }}>{milliseconds}</span>
            </div>
          )}

          <div style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', wordBreak: 'break-word' }}>
            {location.label}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <span>{t('sun')} </span>
              <span>{sunrise} - {sunset}</span>
              <span style={{ marginLeft: '4px' }}>(10h 06m)</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
          <button
            className={`${styles.btn} ${!use24h ? styles.btnPrimary : ''}`}
            onClick={() => useAppStore.getState().toggle24h()}
            style={{ minWidth: '50px', padding: '8px 12px' }}
          >
            {t('format12h')}
          </button>
          <button
            className={`${styles.btn} ${use24h ? styles.btnPrimary : ''}`}
            onClick={() => useAppStore.getState().toggle24h()}
            style={{ minWidth: '50px', padding: '8px 12px' }}
          >
            {t('format24h')}
          </button>
        </div>
      </div>
    </div>
  );
}


import { useTranslations } from 'next-intl';
import styles from './ui.module.css';
import { minutesToTime } from '@/utils/time';

export function TimeSlider(props: { value: number; onChange: (v: number) => void; label?: string }) {
  const t = useTranslations('ui.timeSlider');
  return (
    <div className={styles.card} style={{ padding: 12 }}>
      <div className={styles.row} style={{ marginBottom: 8 }}>
        <div className={styles.label}>{props.label ?? t('time')}</div>
        <div className={`${styles.value} ${styles.mono}`}>{minutesToTime(props.value)}</div>
      </div>
      <input
        type="range"
        min={0}
        max={24 * 60 - 1}
        step={15}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
}



import styles from './ui.module.css';
import type { WorkingHours } from '@/types/domain';
import { timeToMinutes, minutesToTime } from '@/utils/time';

export function WorkingHoursEditor(props: {
  participantId: string;
  participantName: string;
  hours: WorkingHours;
  onChange: (hours: WorkingHours) => void;
}) {
  const startMinutes = timeToMinutes(props.hours.start);
  const endMinutes = timeToMinutes(props.hours.end);

  return (
    <div className={styles.card} style={{ padding: 14, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <div className={styles.title} style={{ marginBottom: 12, wordBreak: 'break-word' }}>{props.participantName}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        <div style={{ width: '100%' }}>
          <div className={styles.label} style={{ marginBottom: 6 }}>Start</div>
          <input
            type="time"
            value={props.hours.start}
            onChange={(e) => {
              const newStart = e.target.value;
              if (newStart && timeToMinutes(newStart) < timeToMinutes(props.hours.end)) {
                props.onChange({ start: newStart, end: props.hours.end });
              }
            }}
            className={styles.input}
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ width: '100%' }}>
          <div className={styles.label} style={{ marginBottom: 6 }}>End</div>
          <input
            type="time"
            value={props.hours.end}
            onChange={(e) => {
              const newEnd = e.target.value;
              if (newEnd && timeToMinutes(newEnd) > timeToMinutes(props.hours.start)) {
                props.onChange({ start: props.hours.start, end: newEnd });
              }
            }}
            className={styles.input}
            style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}
          />
        </div>
      </div>
    </div>
  );
}



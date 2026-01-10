import type { Location } from '@/types/domain';
import styles from './ui.module.css';

export function LocationCard(props: {
  location: Location;
  isSelected?: boolean;
  actions?: React.ReactNode;
  onClick?: () => void;
}) {
  const { location, isSelected, actions, onClick } = props;
  return (
    <div
      className={styles.card}
      style={{
        borderColor: isSelected ? 'var(--highlight)' : undefined,
        cursor: onClick ? 'pointer' : 'default',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.cardBody}>
        <div className={styles.row} style={{ minWidth: 0 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className={styles.title} style={{ wordBreak: 'break-word' }}>{location.label}</div>
            <div className={styles.subtitle} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
              <span className={styles.mono}>{location.tz}</span>
              {' • '}
              <span className={styles.mono}>
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          </div>
          {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
        </div>
      </div>
    </div>
  );
}



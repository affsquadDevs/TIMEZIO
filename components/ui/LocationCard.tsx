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
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className={styles.cardBody}>
        <div className={styles.row}>
          <div>
            <div className={styles.title}>{location.label}</div>
            <div className={styles.subtitle}>
              <span className={styles.mono}>{location.tz}</span>
              {' • '}
              <span className={styles.mono}>
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          </div>
          {actions}
        </div>
      </div>
    </div>
  );
}



import styles from './ui.module.css';

export function DstBadge(props: { isDst: boolean }) {
  return (
    <span className={`${styles.badge} ${props.isDst ? styles.badgeYellow : styles.badgeGreen}`}>
      {props.isDst ? 'DST active' : 'DST inactive'}
    </span>
  );
}





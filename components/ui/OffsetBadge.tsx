import styles from './ui.module.css';

export function OffsetBadge(props: { label: string }) {
  return <span className={`${styles.badge} ${styles.badgeBlue}`}>{props.label}</span>;
}





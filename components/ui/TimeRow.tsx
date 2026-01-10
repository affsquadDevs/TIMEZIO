import styles from './ui.module.css';

export function TimeRow(props: { label: string; value: string; mono?: boolean; right?: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <div>
        <div className={styles.label}>{props.label}</div>
        <div className={`${styles.value} ${props.mono ? styles.mono : ''}`}>{props.value}</div>
      </div>
      {props.right}
    </div>
  );
}





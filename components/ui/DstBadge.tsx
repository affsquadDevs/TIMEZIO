import { useTranslations } from 'next-intl';
import styles from './ui.module.css';

export function DstBadge(props: { isDst: boolean }) {
  const t = useTranslations('ui.dstBadge');
  return (
    <span className={`${styles.badge} ${props.isDst ? styles.badgeYellow : styles.badgeGreen}`}>
      {props.isDst ? t('active') : t('inactive')}
    </span>
  );
}





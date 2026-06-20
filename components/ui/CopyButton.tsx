import { useTranslations } from 'next-intl';
import styles from './ui.module.css';

export function CopyButton(props: { text: string; label?: string; className?: string }) {
  const t = useTranslations('ui.copyButton');
  const { text, label = t('copy'), className } = props;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }

  return (
    <button className={`${styles.btn} ${styles.btnPrimary} ${className ?? ''}`} onClick={onCopy}>
      {label}
    </button>
  );
}





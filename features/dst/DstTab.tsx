import { useMemo } from 'react';
import { DateTime } from 'luxon';
import { useTranslations } from 'next-intl';

import ui from '@/components/ui/ui.module.css';
import { useTicker } from '@/hooks/useTicker';
import { useSelectedLocation } from '@/store/useAppStore';
import { findNextOffsetTransition, formatTime, getOffsetInfo } from '@/utils/time';
import { DstBadge } from '@/components/ui/DstBadge';
import { OffsetBadge } from '@/components/ui/OffsetBadge';
import { TimeRow } from '@/components/ui/TimeRow';
import { useAppStore } from '@/store/useAppStore';

export function DstTab() {
  const t = useTranslations('ui.dstTab');
  const now = useTicker(1000);
  const use24h = useAppStore((s) => s.use24h);
  const selected = useSelectedLocation();

  const computed = useMemo(() => {
    if (!selected) return null;
    const at = now.setZone(selected.tz);
    const info = getOffsetInfo(selected.tz, now);
    const next = findNextOffsetTransition(selected.tz, now);
    const nextLabel = next ? formatTime(next, { use24h }) : t('noChangeFound');
    return { at, info, nextLabel, next };
  }, [selected?.id, now, use24h]);

  return (
    <div className={ui.card}>
      <div className={ui.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div className={ui.title}>{t('title')}</div>
          <div className={ui.subtitle}>
            {t('bestEffort')}
          </div>
        </div>

        {!selected ? (
          <div className={ui.subtitle}>{t('selectLocation')}</div>
        ) : !computed ? null : (
          <>
            <TimeRow label={t('timezone')} value={selected.tz} mono right={<DstBadge isDst={computed.info.isDst} />} />
            <TimeRow label={t('currentLocalTime')} value={formatTime(computed.at, { use24h })} mono right={<OffsetBadge label={computed.info.offsetLabel} />} />
            {computed.info.offsetNameShort ? <TimeRow label={t('abbrev')} value={computed.info.offsetNameShort} mono /> : null}
            <TimeRow label={t('nextOffsetChange')} value={computed.nextLabel} mono />
            {computed.next ? (
              <div className={ui.subtitle}>
                {t('transitionNote')}
              </div>
            ) : (
              <div className={ui.subtitle}>{t('infrequentChange')}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



import { useMemo } from 'react';
import { DateTime } from 'luxon';

import ui from '@/components/ui/ui.module.css';
import { useTicker } from '@/hooks/useTicker';
import { useSelectedLocation } from '@/store/useAppStore';
import { findNextOffsetTransition, formatTime, getOffsetInfo } from '@/utils/time';
import { DstBadge } from '@/components/ui/DstBadge';
import { OffsetBadge } from '@/components/ui/OffsetBadge';
import { TimeRow } from '@/components/ui/TimeRow';
import { useAppStore } from '@/store/useAppStore';

export function DstTab() {
  const now = useTicker(1000);
  const use24h = useAppStore((s) => s.use24h);
  const selected = useSelectedLocation();

  const computed = useMemo(() => {
    if (!selected) return null;
    const at = now.setZone(selected.tz);
    const info = getOffsetInfo(selected.tz, now);
    const next = findNextOffsetTransition(selected.tz, now);
    const nextLabel = next ? formatTime(next, { use24h }) : 'No change found (≈370 days scan)';
    return { at, info, nextLabel, next };
  }, [selected?.id, now, use24h]);

  return (
    <div className={ui.card}>
      <div className={ui.cardBody} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <div className={ui.title}>DST</div>
          <div className={ui.subtitle}>
            Best-effort: Luxon doesn’t expose IANA transition tables, so we scan forward until offset changes.
          </div>
        </div>

        {!selected ? (
          <div className={ui.subtitle}>Select a location in Explore.</div>
        ) : !computed ? null : (
          <>
            <TimeRow label="Timezone" value={selected.tz} mono right={<DstBadge isDst={computed.info.isDst} />} />
            <TimeRow label="Current local time" value={formatTime(computed.at, { use24h })} mono right={<OffsetBadge label={computed.info.offsetLabel} />} />
            {computed.info.offsetNameShort ? <TimeRow label="Abbrev" value={computed.info.offsetNameShort} mono /> : null}
            <TimeRow label="Next offset change" value={computed.nextLabel} mono />
            {computed.next ? (
              <div className={ui.subtitle}>
                Note: Transition timestamp is approximate (minute-level). For exact changes you’d need a tzdb transition table.
              </div>
            ) : (
              <div className={ui.subtitle}>Some timezones don’t change offset often (or at all).</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



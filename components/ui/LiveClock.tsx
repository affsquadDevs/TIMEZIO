'use client';

import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

// Ticking clock for a given IANA zone. Seeded with a server-computed initial
// string to avoid an empty flash; updates client-side every second.
export function LiveClock({ tz, initial }: { tz: string; initial?: string }) {
  const [now, setNow] = useState(initial ?? '');

  useEffect(() => {
    const tick = () => setNow(DateTime.now().setZone(tz).toFormat('h:mm:ss a'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tz]);

  return <span suppressHydrationWarning>{now || initial || '—'}</span>;
}

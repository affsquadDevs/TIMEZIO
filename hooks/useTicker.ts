import { useEffect, useState } from 'react';
import { DateTime } from 'luxon';

export function useTicker(intervalMs = 1000) {
  // Initialize with null to avoid hydration mismatch
  // The actual time will be set after mount on the client
  const [now, setNow] = useState<DateTime | null>(null);

  useEffect(() => {
    // Set initial time immediately on mount
    setNow(DateTime.now());
    const id = window.setInterval(() => setNow(DateTime.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  // During SSR and initial render, return current time
  // This ensures consistent initial render, but the actual ticking
  // only happens after mount to avoid hydration issues
  return now ?? DateTime.now();
}




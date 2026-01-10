import { useEffect, useMemo, useRef, useState } from 'react';
import ui from '@/components/ui/ui.module.css';

type City = { id: string; label: string; lat: number; lng: number; tz: string };

export function CitySearch(props: { onPick: (city: City) => void; placeholder?: string }) {
  const [q, setQ] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    const qq = query;
    if (qq.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/cities?q=${encodeURIComponent(qq)}&limit=8`, {
          signal: ctrl.signal,
          headers: { Accept: 'application/json' },
        });
        const data = (await res.json()) as { results: City[] };
        if (ctrl.signal.aborted) return;
        setResults(Array.isArray(data.results) ? data.results : []);
        setOpen(true);
      } catch (e) {
        if (ctrl.signal.aborted) return;
        setResults([]);
        setOpen(false);
      }
    }, 180);

    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [open]);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        className={ui.input}
        value={q}
        placeholder={props.placeholder ?? 'Search city…'}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
      />
      {open && results.length > 0 && (
        <div
          className={ui.card}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 'calc(100% + 8px)',
            zIndex: 50,
            overflow: 'hidden',
            padding: '6px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2), 0 0 0 1.5px var(--card-border)',
            border: '1.5px solid var(--card-border)',
          }}
        >
          {results.map((c, idx) => (
            <button
              key={c.id}
              className={ui.btn}
              style={{
                width: '100%',
                borderRadius: '8px',
                border: 'none',
                borderBottom: idx < results.length - 1 ? '1px solid var(--border-color)' : 'none',
                textAlign: 'left',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                marginBottom: idx < results.length - 1 ? '4px' : '0',
                padding: '12px 16px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--background)';
                e.currentTarget.style.borderColor = 'var(--text-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--card-bg)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onClick={() => {
                props.onPick(c);
                setQ('');
                setOpen(false);
              }}
            >
              <div style={{ fontWeight: 750, color: 'var(--text-primary)' }}>{c.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.tz}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}



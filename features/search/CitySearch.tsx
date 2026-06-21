'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslations } from 'next-intl';

import ui from '@/components/ui/ui.module.css';
import styles from './CitySearch.module.css';

const MIN_QUERY_LENGTH = 2;

export type CitySearchResult = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  tz: string;
};

type CitySearchProps = {
  placeholder?: string;
  onPick: (city: CitySearchResult) => void;
};

type ApiResponse = {
  results?: CitySearchResult[];
};

export function CitySearch({ placeholder, onPick }: CitySearchProps) {
  const t = useTranslations('ui.citySearch');
  const resolvedPlaceholder = placeholder ?? t('placeholder');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (query.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setStatus('idle');
      setErrorMessage(null);
      setHighlightedIndex(-1);
      return;
    }

    const controller = new AbortController();
    const currentRequestId = ++requestIdRef.current;

    setStatus('loading');
    setErrorMessage(null);
    setResults([]);
    setHighlightedIndex(-1);

    const encodedQuery = encodeURIComponent(query.trim());
    const url = `/api/cities?q=${encodedQuery}&limit=8`;

    fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(t('unableToSearchStatus', { status: res.status }));
        }
        return res.json() as Promise<ApiResponse>;
      })
      .then((data) => {
        if (requestIdRef.current !== currentRequestId) return;
        setResults(data.results ?? []);
        setStatus('idle');
      })
      .catch((error) => {
        if (controller.signal.aborted || requestIdRef.current !== currentRequestId) return;
        setStatus('error');
        setErrorMessage(error?.message ?? t('unableToSearchCities'));
      });

    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    if (results.length === 0) {
      setHighlightedIndex(-1);
    } else {
      setHighlightedIndex(0);
    }
  }, [results.length]);

  const helperMessage = useMemo(() => {
    if (query.length === 0) return undefined;
    if (query.length < MIN_QUERY_LENGTH) return t('typeAtLeast', { count: MIN_QUERY_LENGTH });
    if (status === 'loading') return t('searchingCities');
    if (status === 'error') return errorMessage ?? t('unableToFetchCities');
    if (results.length === 0) return t('noMatchesFound');
    return undefined;
  }, [query.length, status, errorMessage, results.length, t]);

  const showDropdown = useMemo(() => {
    if (query.length === 0) return false;
    if (query.length < MIN_QUERY_LENGTH) return true;
    return results.length > 0 || status !== 'idle';
  }, [query.length, results.length, status]);

  const handlePick = useCallback(
    (city: CitySearchResult) => {
      onPick(city);
      setQuery('');
      setResults([]);
      setStatus('idle');
      setErrorMessage(null);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [onPick]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!results.length) return;
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % results.length);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightedIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
      } else if (event.key === 'Enter') {
        if (highlightedIndex >= 0 && highlightedIndex < results.length) {
          event.preventDefault();
          handlePick(results[highlightedIndex]);
        }
      } else if (event.key === 'Escape') {
        setResults([]);
        setHighlightedIndex(-1);
        setStatus('idle');
        setErrorMessage(null);
      }
    },
    [results, highlightedIndex, handlePick]
  );

  return (
    <div className={styles.root}>
      <input
        ref={inputRef}
        className={ui.input}
        placeholder={resolvedPlaceholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={showDropdown}
      />
      {showDropdown && (
        <div className={styles.dropdown} role="status" aria-live="polite">
          {results.length > 0 ? (
            <div className={styles.list} role="listbox">
              {results.map((city, index) => (
                <button
                  key={city.id}
                  type="button"
                  className={`${styles.item} ${index === highlightedIndex ? styles.itemActive : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => handlePick(city)}
                  role="option"
                  aria-selected={index === highlightedIndex}
                >
                  <span className={styles.label}>{city.label}</span>
                  <span className={styles.meta}>
                    {city.tz} • {city.lat.toFixed(4)}, {city.lng.toFixed(4)}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            helperMessage && <div className={styles.message}>{helperMessage}</div>
          )}
          {results.length > 0 && helperMessage && <div className={styles.message}>{helperMessage}</div>}
        </div>
      )}
    </div>
  );
}




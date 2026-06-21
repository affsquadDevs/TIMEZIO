'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// First-party consent UI wired to Google Consent Mode v2. Defaults are set to
// "denied" in the document <head> before tags load; this banner flips them to
// "granted" only after the user accepts. The footer "Cookie settings" control
// re-opens it via the `open-cookie-settings` window event.
//
// NOTE: For full EEA/UK ad serving, also enable a Google-certified CMP
// (AdSense → Privacy & messaging → GDPR / Funding Choices). This banner provides
// the consent baseline and makes the privacy policy's consent promise accurate.

const STORAGE_KEY = 'timezio-consent';

type Consent = 'granted' | 'denied';

function applyConsent(value: Consent) {
  if (typeof window === 'undefined') return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === 'function') {
    w.gtag('consent', 'update', {
      ad_storage: value,
      ad_user_data: value,
      ad_personalization: value,
      analytics_storage: value,
    });
  }
}

export function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const t = useTranslations('consent');

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== 'granted' && stored !== 'denied') setOpen(true);

    const reopen = () => setOpen(true);
    window.addEventListener('open-cookie-settings', reopen);
    return () => window.removeEventListener('open-cookie-settings', reopen);
  }, []);

  const choose = useCallback((value: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    applyConsent(value);
    setOpen(false);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 'max(16px, env(safe-area-inset-bottom))',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: 'min(680px, calc(100vw - 24px))',
        background: 'var(--card-bg, #0f172a)',
        color: 'var(--text-primary, #e2e8f0)',
        border: '1px solid var(--border-color, rgba(148,163,184,0.25))',
        borderRadius: '14px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        padding: '16px 18px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <p style={{ margin: 0, flex: '1 1 320px', fontSize: '14px', lineHeight: 1.55, color: 'var(--text-secondary, #94a3b8)' }}>
        {t.rich('message', {
          link: (chunks) => (
            <Link href="/privacy" style={{ color: 'var(--highlight, #60a5fa)' }}>
              {chunks}
            </Link>
          ),
        })}
      </p>
      <div style={{ display: 'flex', gap: '8px', flex: '0 0 auto' }}>
        <button
          onClick={() => choose('denied')}
          style={{
            padding: '9px 14px',
            borderRadius: '9px',
            border: '1px solid var(--border-color, rgba(148,163,184,0.3))',
            background: 'transparent',
            color: 'var(--text-primary, #e2e8f0)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {t('reject')}
        </button>
        <button
          onClick={() => choose('granted')}
          style={{
            padding: '9px 16px',
            borderRadius: '9px',
            border: '1px solid var(--highlight, #e2e8f0)',
            background: 'var(--highlight, #e2e8f0)',
            // --highlight is an inverted contrast color (white in dark theme,
            // black in light theme), so the label must use the page background
            // color to stay legible — matching the site's .btnPrimary convention.
            color: 'var(--background, #0f172a)',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {t('acceptAll')}
        </button>
      </div>
    </div>
  );
}

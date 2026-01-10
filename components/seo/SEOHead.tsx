'use client';

import { useEffect } from 'react';

type SEOHeadProps = {
  structuredData?: Record<string, any>;
  id?: string;
};

export function SEOHead({ structuredData, id = 'seo-schema' }: SEOHeadProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || !structuredData) return;

    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) document.head.removeChild(scriptToRemove);
    };
  }, [structuredData, id]);

  return null;
}


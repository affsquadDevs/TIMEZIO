'use client';

import { useEffect } from 'react';

type BreadcrumbItem = {
  name: string;
  url: string;
};

type BreadcrumbSchemaProps = {
  items: BreadcrumbItem[];
  id?: string;
};

export function BreadcrumbSchema({ items, id = 'breadcrumb-schema' }: BreadcrumbSchemaProps) {
  useEffect(() => {
    if (typeof window === 'undefined' || items.length === 0) return;

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `https://timezio.com${item.url}`,
      })),
    };

    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) document.head.removeChild(scriptToRemove);
    };
  }, [items, id]);

  return null;
}


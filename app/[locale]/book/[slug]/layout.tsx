import type { Metadata } from 'next';

// Per-instance booking pages (shareable links to a specific meeting). They hold
// transient, app-generated data with no SEO value — keep them out of the index.
export const metadata: Metadata = {
  title: 'Book a Meeting',
  robots: { index: false, follow: true },
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

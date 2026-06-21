import type { Metadata } from 'next';

// Per-instance meeting-poll pages (shareable links to a specific poll). Transient
// app-generated data with no SEO value — keep them out of the index.
export const metadata: Metadata = {
  title: 'Meeting Poll',
  robots: { index: false, follow: true },
};

export default function PollLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

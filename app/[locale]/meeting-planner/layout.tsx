import type { Metadata } from 'next';

// Functional Google Calendar / Meet planner (OAuth lands here). Useful as an app
// feature but not an SEO landing page — keep it out of the index.
export const metadata: Metadata = {
  title: 'Meeting Planner',
  robots: { index: false, follow: true },
};

export default function MeetingPlannerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

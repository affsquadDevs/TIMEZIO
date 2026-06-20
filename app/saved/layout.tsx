import type { Metadata } from "next";

// Saved locations live in the visitor's browser (localStorage), so the page has
// no shared, indexable content — keep it out of the index.
export const metadata: Metadata = {
  title: "Saved Locations & Time Zones",
  description:
    "Save frequently used locations and quickly return to their current time, offset, and DST status.",
  robots: { index: false, follow: true },
};

export default function SavedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}



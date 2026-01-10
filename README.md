# Timezio - World Timezone Globe (Skeleton)

This repo now contains a **product-ready skeleton** for a “World Timezone Globe” app: clear feature modules, domain types, a small store, and tab-based UX. You can implement features incrementally without rewriting the app.

## What’s implemented (working skeleton)

- 🌍 Interactive 3D globe (click → lat/lng → tz via `tz-lookup`)
- 🕐 Real-time local time via `luxon` (updates every second)
- 🧭 Tabs (internal state; no router): Explore / Compare / Planner / DST / Saved
- 🧮 Compare tab (add/remove up to 6 + base selection + offset diff table)
- 💾 Saved tab (localStorage persistence for saved ids + management UI)
- 🔗 Share (packed state via query param `s` + “Copy share link”)
- 🌆 City search (static JSON list + autocomplete; no external API)
- 📱 Responsive layout: desktop sidebar / mobile bottom sheet

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **react-globe.gl** - 3D globe component
- **three.js** - 3D graphics
- **tz-lookup** - Timezone lookup by coordinates
- **luxon** - Timezone-aware date/time handling

## Installation

1. Install dependencies:

```bash
npm install
```

## Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
timezio/
├── app/                              # Next.js App Router
│   ├── about/                        # About page
│   │   ├── about.module.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/                          # API routes
│   │   └── cities/
│   │       └── route.ts
│   ├── blog/                         # Blog pages
│   │   ├── [slug]/                   # Dynamic blog post route
│   │   │   └── page.tsx
│   │   ├── blog.module.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── contact/                      # Contact page
│   │   ├── contact.module.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── privacy/                      # Privacy Policy page
│   │   ├── privacy.module.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── terms/                        # Terms of Service page
│   │   ├── terms.module.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/                   # Legacy components (optional)
│   │   ├── Globe.tsx
│   │   └── InfoPanel.tsx
│   ├── favicon.ico
│   ├── globals.css                   # Global styles and CSS variables
│   ├── layout.tsx                    # Root layout with metadata
│   └── page.tsx                      # Home page (Globe + Tabs)
├── components/                       # Reusable React components
│   ├── globe/
│   │   └── GlobeCanvas.tsx          # 3D globe component wrapper
│   ├── layout/                       # Layout components
│   │   ├── Footer.tsx               # Site footer with links
│   │   ├── layout.module.css        # Layout styles
│   │   ├── MobileSheet.tsx          # Mobile bottom sheet
│   │   ├── SidePanel.tsx            # Desktop side panel
│   │   └── TopBar.tsx               # Top navigation bar
│   ├── tabs/
│   │   ├── TabBar.tsx               # Tab navigation component
│   │   └── tabs.module.css
│   ├── ThemeProvider.tsx            # Theme context provider
│   └── ui/                          # UI components
│       ├── CityTimeCard.tsx
│       ├── CopyButton.tsx
│       ├── DstBadge.tsx
│       ├── LocationCard.tsx
│       ├── OffsetBadge.tsx
│       ├── ThemeToggle.tsx
│       ├── TimeDisplay.tsx
│       ├── TimeRow.tsx
│       ├── TimeSlider.tsx
│       ├── ui.module.css
│       └── WorkingHoursEditor.tsx
├── data/                            # Static data files
│   └── cities.top200.json          # Top 200 cities list
├── features/                        # Feature modules (tab content)
│   ├── compare/
│   │   └── CompareTab.tsx          # Timezone comparison feature
│   ├── dst/
│   │   └── DstTab.tsx              # Daylight saving time feature
│   ├── explore/
│   │   └── ExploreTab.tsx          # Explore/search feature
│   ├── planner/
│   │   └── PlannerTab.tsx          # Meeting planner feature
│   ├── saved/
│   │   └── SavedTab.tsx            # Saved locations feature
│   └── search/
│       └── CitySearch.tsx          # City search component
├── hooks/                           # Custom React hooks
│   └── useTicker.ts                # Real-time time ticker hook
├── public/                          # Static assets
│   ├── ads.txt
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── store/                           # State management
│   └── useAppStore.ts              # Zustand store (app state)
├── types/                           # TypeScript type definitions
│   ├── domain.ts                   # Domain models and types
│   └── tz-lookup.d.ts             # Timezone lookup types
├── utils/                           # Utility functions
│   ├── id.ts                       # ID generation utilities
│   ├── share.ts                    # URL sharing utilities
│   ├── time.ts                     # Time formatting utilities
│   └── timezoneBand.ts             # Timezone band calculations
├── eslint.config.mjs               # ESLint configuration
├── next.config.ts                  # Next.js configuration
├── next-env.d.ts                   # Next.js TypeScript declarations
├── package.json                    # Dependencies and scripts
├── postcss.config.mjs              # PostCSS configuration
├── README.md                       # Project documentation
└── tsconfig.json                   # TypeScript configuration
```

## Usage

1. Click anywhere on the globe to select a location
2. View the timezone information in the right panel (or below on mobile)
3. The local time updates every second
4. Click "Reset View" to return the camera to the default position
5. A red marker appears on the selected location

## Notes

- The Earth texture is loaded from a public URL (no manual setup required)
- The application handles loading states and texture errors gracefully
- All timezone calculations are done locally using tz-lookup
- Time updates in real-time using luxon's timezone-aware DateTime

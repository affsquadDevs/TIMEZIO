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

## Environment

Create a `.env` file with:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
# Local dev only. In production the redirect URI is derived from the canonical
# www host, so GOOGLE_REDIRECT_URI does not need to be set on the host.
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

In production (Vercel) only `DATABASE_URL`, `GOOGLE_CLIENT_ID`, and
`GOOGLE_CLIENT_SECRET` are required. The Google Cloud OAuth client must list
`https://www.timezio.com/api/auth/google/callback` as an authorized redirect URI.

## Database (Prisma + Postgres)

1. Generate Prisma client and create the SQLite db:

```bash
npx prisma migrate dev --name init
```

2. (Optional) Inspect the database:

```bash
npx prisma studio
```

## Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## OAuth + Meet API routes

- `GET /api/auth/google` – redirects to Google OAuth (Calendar scope + offline access)
- `GET /api/auth/google/callback` – exchanges code, stores user + refresh token, sets `uid` cookie
- `POST /api/google/create-meet` – creates a Calendar event with a Meet link using the stored refresh token

### Testing the Create Meet API

#### Step 1: Authenticate with Google

1. Open your browser and navigate to:
   ```
   http://localhost:3000/api/auth/google
   ```
2. Complete the Google OAuth flow (grant Calendar permissions)
3. After redirect, you'll have an `uid` cookie set (httpOnly, secure=false in dev)

#### Step 2: Test with curl

```bash
curl -X POST http://localhost:3000/api/google/create-meet \
  -H "Content-Type: application/json" \
  -H "Cookie: uid=YOUR_UID_FROM_STEP_1" \
  -d '{
    "title": "Team Sync",
    "description": "Global meeting",
    "startUtcISO": "2026-01-15T14:00:00Z",
    "endUtcISO": "2026-01-15T14:30:00Z",
    "attendees": ["a@test.com", "b@test.com"]
  }'
```

**Response:**
```json
{
  "eventId": "abc123...",
  "meetLink": "https://meet.google.com/xxx-yyyy-zzz"
}
```

#### Step 3: Test from Browser Console

On any page (e.g., `/meeting-planner`), open DevTools Console and run:

```javascript
fetch('/api/google/create-meet', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Team Sync',
    description: 'Global meeting',
    startUtcISO: '2026-01-15T14:00:00Z',
    endUtcISO: '2026-01-15T14:30:00Z',
    attendees: ['a@test.com', 'b@test.com']
  })
})
  .then(r => r.json())
  .then(console.log);
```

**Note:** The `uid` cookie is automatically sent with the request (same-origin).

#### Validation Examples

**Missing fields:**
```bash
curl -X POST http://localhost:3000/api/google/create-meet \
  -H "Content-Type: application/json" \
  -d '{"title": "Test"}' 
# → 400: Missing required fields
```

**Invalid date range:**
```bash
curl -X POST http://localhost:3000/api/google/create-meet \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "startUtcISO": "2026-01-15T14:30:00Z",
    "endUtcISO": "2026-01-15T14:00:00Z"
  }'
# → 400: startUtcISO must be before endUtcISO
```

**No Google connection:**
```bash
# If user has no refreshToken
# → 400: Google not connected
```

## Meeting Planner (Booking & Poll Modes)

### Creating a Meeting Session

1. Navigate to `/meeting-planner`
2. Fill in the form:
   - Title
   - Description (optional)
   - Duration (minutes)
   - Date range (from/to in local time)
3. Click "Create Session"
4. Add participants (name, email, timezone, location lat/lng, city)
5. Click "Generate best slots" to find optimal meeting times

### Booking Mode (Like Calendly)

1. After generating slots, click **"Booking"** mode button
2. A public booking link will be generated: `/book/{slug}`
3. Share the link with guests
4. Guests can:
   - View available slots in their local timezone
   - Select a slot
   - Enter name/email and reserve
5. First reservation creates the Google Meet event automatically
6. Only one reservation is allowed per booking link

**API:**
- `POST /api/meetings/:id/enable-booking` - Enable booking mode, generate slug
- `GET /api/book/:slug` - Public: Get booking info (no auth required)
- `POST /api/book/:slug/reserve` - Public: Reserve a slot (no auth required)

### Poll Mode (Like Doodle)

1. After generating slots, click **"Poll"** mode button
2. A public poll link will be generated: `/poll/{sessionId}`
3. Share the link with participants
4. Participants can:
   - Vote Yes/Maybe/No for each slot
   - See vote summaries (how many yes/maybe/no per slot)
5. Organizer can click **"Confirm Best Slot"** which:
   - Selects slot with most "yes" votes (tie-break by score)
   - Creates Google Meet event automatically

**API:**
- `POST /api/meetings/:id/enable-poll` - Enable poll mode, initialize votes
- `GET /api/poll/:id` - Public: Get poll info (no auth required)
- `POST /api/poll/:id/vote` - Public: Submit votes (no auth required)
- `POST /api/meetings/:id/poll/confirm-best` - Organizer only: Confirm best slot

### Instant Mode (Default)

1. After generating slots, select a slot manually
2. Click "Confirm & Create Meet"
3. Meet link is created immediately

### Scoring Improvements

Slots are scored based on:
- **Work hours**: If participant has custom work hours, uses those; otherwise defaults to Mon-Fri 09:00-18:00
- **Weekend penalty**: Sat/Sun with no work hours = -3 score
- **Night penalties**:
  - 00:00-06:59 = -4 score
  - 22:00-23:59 = -3 score
- **Fairness**: If 2+ participants have "red" bucket for a slot, subtract 2 from score
- **Hard night filter** (optional): Skip slots outside 07:00-23:00 entirely

**Generate slots parameters:**
- `stepMinutes`: Step size for candidate generation (default: 30)
- `maxCandidates`: Max candidates before filtering (default: 500)
- `topN`: Number of top slots to return (default: 10)
- `hardFilterNight`: Filter out slots outside 07:00-23:00 (default: false)
- `fairness`: Apply fairness penalty for slots with 2+ red participants (default: false)

## Meeting Planner Flow

1. Open `http://localhost:3000/meeting-planner` after running `npm run dev`.
2. Click **Connect Google** to hit `/api/auth/google` and set the `uid` cookie.
3. Create a session (title, duration, UTC range); the backend returns a `MeetingSession`.
4. Add participants (name, email, timezone, lat/lng); participants are stored as JSON.
5. Generate slots with step/max/top – scoring happens server-side (09–18 green, 07–22 yellow, 22–07 red).
6. Select a slot, then **Confirm & Create Meet** – the server calls Google Calendar and saves the Meet link.

> New API endpoints: `/api/meetings`, `/api/meetings/:id`, `/api/meetings/:id/participants`, `/api/meetings/:id/generate-slots`, `/api/meetings/:id/select-slot`, `/api/meetings/:id/confirm`.

Use the page messages/alerts for validation feedback and check DevTools network/logs if something fails.

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

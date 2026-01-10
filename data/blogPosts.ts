export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  content?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'about-timezio',
    title: 'About This Website',
    excerpt: 'Learn how Timezio makes working across time zones simple, accurate, and stress-free. Discover our core principles, features, and frequently asked questions.',
    date: '2026-01-09',
    readTime: '5 min read',
    content: `This website was created to make working across time zones simple, accurate, and stress-free.
Whether you're planning a meeting with colleagues abroad, checking the current time in another city,
converting UTC, or traveling across countries, our tools help you instantly understand time differences
without confusion.

## Core Principles

### Accuracy
All calculations are based on official IANA time zone data and are fully daylight-saving-time (DST) aware.

### Simplicity
Clean, fast tools that work instantly without unnecessary steps.

### Reliability
Built for daily use by professionals, travelers, remote teams, and digital nomads.

## Automatic Calculations

Our calculators automatically account for:
- Daylight saving time changes
- Different UTC offsets
- Date changes when crossing time zones
- Regions with non-standard offsets (such as 30- or 45-minute differences)

This website is designed to be useful worldwide and is updated regularly to reflect official time zone rules.

## Who This Website Is For

- Remote workers and distributed teams
- Business professionals scheduling international meetings
- Travelers and frequent flyers
- Students and educators
- Anyone who needs to convert or compare time zones accurately

**No accounts. No complexity. Just clear answers.**

## How to Use This Website

### 1. Explore — Interactive Globe

Click anywhere on the 3D globe to instantly see the local time for that location.

**How it works:** Click a location on the globe or search for a city. View the current time,
UTC offset, and DST status. Perfect for quick checks and exploring time zones visually.

### 2. Compare — Time Zone Comparison

Compare time differences between multiple cities simultaneously.

**How it works:** Add up to 6 cities to compare. Select a base city to see time differences
relative to it. Instantly see current local times, offsets, and visual comparisons. This is ideal for
answering questions like "When it's 9:00 AM in Berlin, what time is it in New York?"

### 3. Planner — Meeting Planner

Find the best meeting time for people in different locations.

**How it works:** Add participants by city, select a meeting date, and optionally adjust
working hours for each participant. View overlapping time windows and share the meeting details. This tool
automatically avoids early-morning or late-night hours when possible.

### 4. DST — Daylight Saving Time

Track daylight saving time changes and transitions throughout the year.

**How it works:** View DST status for any location, see upcoming transitions, and understand
when clocks change. Check how DST affects time differences between regions.

### 5. Saved — Favorite Locations

Save your frequently used locations for quick access.

**How it works:** Save locations you check often. Access them instantly without searching.
Your saved locations are stored locally in your browser.

## Frequently Asked Questions

**What time zone data does this website use?**
We use official IANA time zone definitions, which are the global standard for accurate time calculations.

**Does the website account for daylight saving time?**
Yes. All calculations automatically adjust for daylight saving time based on the selected date and location.

**Can I check future or past dates?**
Yes. You can select any date and time to see how the time difference changes throughout the year.

**Why does the time difference change during the year?**
Some countries observe daylight saving time while others do not, or they change clocks on different dates.
This causes time differences to shift seasonally.

**Are cities with the same name supported?**
Yes. Cities are identified by both name and country to avoid confusion (for example, multiple cities named "Springfield").

**Is this website free to use?**
Yes. All tools are free and require no registration.

**Can I share or bookmark results?**
Yes. Tool pages generate clean, shareable URLs that you can bookmark or send to others using the "Copy link" button.

**How accurate are the results?**
The results are accurate to the minute and rely on official time zone rules. However, they should not be
used for legal or critical time-sensitive decisions without independent verification.`,
  },
];

export const blogPostsMap: Record<string, BlogPost> = blogPosts.reduce((acc, post) => {
  acc[post.slug] = post;
  return acc;
}, {} as Record<string, BlogPost>);


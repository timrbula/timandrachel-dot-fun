# 🎉 Geocities Wedding Website - Technical Plan

## Project Overview

A gloriously nostalgic Geocities-style wedding website celebrating a NYC wedding with maximum visual chaos and retro web aesthetics.

## Tech Stack

- **Framework**: Astro 4.x + React 18
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Email**: Resend
- **Styling**: CSS with Geocities aesthetic
- **Language**: TypeScript

## Design Philosophy

**Full Geocities Nostalgia** including:

- Animated GIFs everywhere
- Tiled backgrounds (starry skies, construction patterns)
- Comic Sans, Impact, and other classic fonts
- Marquee scrolling text
- Rainbow dividers and horizontal rules
- Visitor/hit counter
- Auto-playing MIDI background music
- Guestbook
- "Under Construction" graphics
- Bright, clashing color schemes
- Blinking text and animations
- NYC + Wedding themed chaos

## Site Structure

```
/
├── Home (/)
│   ├── Welcome message with marquee
│   ├── Featured wedding photos
│   ├── Animated GIFs (hearts, rings, NYC landmarks)
│   └── Visitor counter
│
├── Schedule (/schedule)
│   ├── Event timeline
│   ├── Venue locations with maps
│   └── NYC-themed graphics
│
├── Travel & Accommodations (/travel)
│   ├── Hotel recommendations
│   ├── Transportation info
│   ├── NYC tourist tips
│   └── Things to do
│
└── RSVP (/rsvp)
    ├── Detailed form
    ├── Plus-one handling
    └── Confirmation message
```

## Database Schema

### Supabase Tables

#### `rsvps` table

```sql
- id: uuid (primary key)
- created_at: timestamp
- guest_name: text (required)
- guest_email: text (required)
- attending: boolean (required)
- plus_one: boolean
- plus_one_name: text (nullable)
- dietary_restrictions: text (nullable)
- song_requests: text (nullable)
- special_accommodations: text (nullable)
- number_of_guests: integer (default 1)
```

#### `guestbook` table

```sql
- id: uuid (primary key)
- created_at: timestamp
- name: text (required)
- message: text (required)
- location: text (nullable)
```

#### `visitor_count` table

```sql
- id: integer (primary key)
- count: integer (default 0)
- last_updated: timestamp
```

## Component Architecture

### Astro Pages

- `src/pages/index.astro` - Home page
- `src/pages/schedule.astro` - Schedule page
- `src/pages/travel.astro` - Travel & Accommodations
- `src/pages/rsvp.astro` - RSVP form page

### React Components

- `HitCounter.tsx` - Visitor counter with Supabase
- `Marquee.tsx` - Scrolling text component
- `RainbowDivider.tsx` - Animated rainbow HR
- `RSVPForm.tsx` - Full RSVP form with validation
- `Guestbook.tsx` - Guestbook display and submission
- `MusicPlayer.tsx` - MIDI player with controls
- `BlinkingText.tsx` - Classic blinking text effect
- `UnderConstruction.tsx` - Animated construction graphic
- `GeoButton.tsx` - Retro-styled button component

### Layout Components

- `BaseLayout.astro` - Main layout with navigation
- `GeoBackground.tsx` - Tiled background manager

## Geocities Design System

### Color Palette

```css
--geo-cyan: #00FFFF
--geo-magenta: #FF00FF
--geo-yellow: #FFFF00
--geo-lime: #00FF00
--geo-red: #FF0000
--geo-blue: #0000FF
--geo-purple: #800080
--geo-orange: #FFA500
--geo-pink: #FF69B4
--geo-black: #000000
--geo-white: #FFFFFF
--geo-gray: #C0C0C0
```

### Typography

```css
--font-primary: 'Comic Sans MS', cursive
--font-heading: 'Impact', fantasy
--font-mono: 'Courier New', monospace
```

### Animations

- Blinking text (CSS keyframes)
- Rotating GIFs
- Marquee scrolling
- Rainbow color cycling
- Sparkle effects

## Key Features Implementation

### 1. Visitor Counter

- Increment on page load
- Store in Supabase
- Display with retro digit graphics
- Cache to prevent spam

### 2. RSVP Form

- Client-side validation
- Supabase integration
- Email confirmation via Resend
- Success animation with GIFs

### 3. Guestbook

- Real-time display of entries
- Moderation capability
- Emoji support
- Timestamp display

### 4. Background Music

- MIDI file auto-play
- Volume controls
- Play/pause toggle
- Mute option for accessibility

### 5. NYC Wedding Theme

- Statue of Liberty GIFs
- Yellow taxi graphics
- NYC skyline backgrounds
- Subway map styling
- Pizza and bagel emojis
- "I ❤️ NY" motifs

## Asset Requirements

### Images/GIFs Needed

- Animated hearts and rings
- Under construction workers
- Spinning @ symbols
- Rainbow dividers
- NYC landmarks (animated)
- Wedding bells
- Champagne glasses
- Fireworks
- Dancing figures
- Email icons
- Arrow pointers
- Star backgrounds

### Audio

- Wedding march MIDI
- NYC-themed MIDI (optional)
- Click sounds for buttons

## API Routes

### Astro API Endpoints

- `POST /api/rsvp` - Submit RSVP
- `GET /api/rsvp` - Fetch RSVPs (admin)
- `POST /api/guestbook` - Add guestbook entry
- `GET /api/guestbook` - Fetch guestbook entries
- `POST /api/counter` - Increment visitor count
- `GET /api/counter` - Get current count

## Environment Variables

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
RESEND_API_KEY=
ADMIN_EMAIL=
```

## Deployment Strategy

### Vercel Configuration

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

### Environment Setup

1. Create Supabase project
2. Run database migrations
3. Configure Resend domain
4. Set environment variables in Vercel
5. Deploy and test

## Responsive Design Considerations

While maintaining Geocities chaos:

- Mobile: Stack elements, larger tap targets
- Tablet: Adjust marquee speed
- Desktop: Full glory of visual chaos
- Accessibility: Skip music button, alt text for GIFs

## Testing Checklist

- [ ] RSVP form submission and validation
- [ ] Email notifications working
- [ ] Guestbook posting and display
- [ ] Visitor counter incrementing
- [ ] Music player controls
- [ ] All links functional
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Database connections secure
- [ ] Form spam protection

## Future Enhancements (Optional)

- Admin dashboard for RSVP management
- Photo gallery with upload capability
- Live wedding stream embed
- Registry links with animated buttons
- Countdown timer to wedding day
- Weather widget for NYC
- Interactive NYC map

## Development Timeline Estimate

- Setup & Configuration: 2-3 hours
- Design System & Components: 4-6 hours
- Page Development: 6-8 hours
- Database & API Integration: 3-4 hours
- Testing & Refinement: 2-3 hours
- Deployment: 1-2 hours

**Total: 18-26 hours**

---

## Next Steps

Ready to switch to Code mode to start building this masterpiece of retro web design! 🎨✨

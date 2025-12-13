# 🎉 Rachel & Tim's Wedding Website 🗽

A gloriously nostalgic Geocities-style wedding website celebrating Rachel & Tim's wedding in Brooklyn, NYC!

**Live Site:** [Coming Soon]
**Venue:** Radio Star, Brooklyn
**Date:** Friday, October 9th, 2026

---

## 📚 Documentation

### For Users & Maintainers

- **[MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md)** - How to update content, manage RSVPs, and maintain the site
- **[FAQ.md](./FAQ.md)** - Frequently asked questions
- **[BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md)** - Backup and recovery procedures

### For Developers

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development setup and contribution guidelines
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and technical design
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database schema and setup instructions

### Planning & Reference

- **[PLAN.md](./PLAN.md)** - Original technical plan
- **[CONTENT_GUIDE.md](./CONTENT_GUIDE.md)** - Content structure and guidelines
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

---

## 🎨 Design Philosophy

**Full Geocities Nostalgia** featuring:

- ✨ Animated GIFs everywhere
- 🌈 Rainbow dividers and marquees
- 📊 Retro visitor counter
- 🎵 MIDI background music with controls
- 💬 Interactive guestbook
- 🚧 Under construction graphics
- 🎪 Maximum visual chaos (in the best way)
- 🗽 NYC + Wedding theme mashup

---

## 🛠️ Tech Stack

- **Framework:** Astro 4.x + React 18
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel
- **Email:** Resend
- **Styling:** Custom CSS with Geocities aesthetic
- **Language:** TypeScript

---

## 📄 Pages

1. **Home (/)** - Welcome message, couple photos, visitor counter
2. **Schedule (/schedule)** - Event timeline, venue details, what to expect
3. **Travel (/travel)** - Hotels, transportation, NYC tips
4. **RSVP (/rsvp)** - RSVP form with meal preferences and email confirmation
5. **Guestbook (/guestbook)** - Leave messages for the couple

---

## ✨ Key Features

### Interactive Elements

- 🎯 **Visitor Counter** - Tracks total site visits
- 📝 **RSVP System** - Full form with validation and email notifications
- 💬 **Guestbook** - Real-time message board with moderation
- 🎵 **MIDI Music Player** - Background music with play/pause controls

### Design Features

- 🌈 **Animated GIFs** - NYC landmarks, wedding themes, and 90s nostalgia
- 📱 **Responsive Design** - Works on all devices (while keeping the chaos)
- 🎨 **Geocities Aesthetic** - Authentic 90s web design
- ⚡ **Fast Loading** - Optimized with Astro's static generation

### Technical Features

- 🔒 **Secure Database** - Row Level Security (RLS) policies
- 📧 **Email Notifications** - Automated RSVP confirmations
- 🚀 **Edge Deployment** - Fast global delivery via Vercel
- 💾 **Data Export** - Easy RSVP and guestbook data export

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Supabase account** (free tier works)
- **Resend account** (free tier works)
- **Vercel account** (optional, for deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rachelandtim-dot-fun

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials (see below)

# Run development server
npm run dev
# Open http://localhost:4321
```

### Environment Setup

Create a `.env` file with the following variables:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend Configuration (for emails)
RESEND_API_KEY=your_resend_api_key

# Admin Email (receives RSVP notifications)
ADMIN_EMAIL=your_email@example.com
```

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed Supabase setup instructions.

### Running Locally

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
rachelandtim-dot-fun/
├── src/
│   ├── components/
│   │   ├── astro/          # Astro components (layouts, navigation)
│   │   └── react/          # React components (interactive features)
│   ├── pages/              # Route pages (index, rsvp, etc.)
│   │   └── api/            # API endpoints (counter, guestbook, rsvp)
│   ├── styles/             # Global styles and animations
│   └── lib/                # Utilities (Supabase, Resend clients)
├── public/                 # Static assets (images, GIFs, audio)
├── docs/                   # Additional documentation
└── scripts/                # Utility scripts
```

### Key Files

- **`src/pages/index.astro`** - Home page
- **`src/components/astro/BaseLayout.astro`** - Main layout wrapper
- **`src/components/react/RSVPForm.tsx`** - RSVP form component
- **`src/components/react/Guestbook.tsx`** - Guestbook component
- **`src/lib/supabase.ts`** - Supabase client configuration
- **`src/styles/geocities.css`** - Main Geocities styling

---

## 🎯 Features in Detail

### RSVP System

The RSVP form collects:

- Guest name(s)
- Email address
- Number of guests attending
- Meal preferences (vegetarian, vegan, gluten-free options)
- Dietary restrictions
- Song requests
- Special messages

**How it works:**

1. Guest fills out form
2. Data saved to Supabase database
3. Confirmation email sent via Resend
4. Admin receives notification email
5. Guest can view confirmation on screen

### Guestbook

Real-time message board where guests can:

- Leave messages for the couple
- View messages from other guests
- See message timestamps

**Moderation:**

- Messages are public immediately
- Admins can delete inappropriate messages via Supabase dashboard
- See [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) for details

### Visitor Counter

Classic Geocities-style hit counter:

- Tracks total site visits
- Persists across sessions
- Displays in retro digital style
- Updates in real-time

---

## 🔧 Development

### Adding New Pages

1. Create new `.astro` file in `src/pages/`
2. Use `BaseLayout` component for consistent styling
3. Add navigation link in `src/components/astro/Navigation.astro`

Example:

```astro
---
import BaseLayout from '../components/astro/BaseLayout.astro';
---

<BaseLayout title="New Page">
  <h1>New Page Content</h1>
</BaseLayout>
```

### Modifying Components

- **Astro components** (`.astro`): Static, server-rendered
- **React components** (`.tsx`): Interactive, client-side

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Updating Content

Most content can be updated by editing the page files directly:

- **Home page:** `src/pages/index.astro`
- **Schedule:** `src/pages/schedule.astro`
- **Travel info:** `src/pages/travel.astro`

See [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) for non-technical content updates.

---

## 🚀 Deployment

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to connect your project
```

### Environment Variables

Set these in your Vercel project settings:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🔧 Maintenance

### Viewing RSVPs

1. Log into Supabase dashboard
2. Navigate to Table Editor
3. Select `rsvps` table
4. Export to CSV if needed

### Managing Guestbook

1. Log into Supabase dashboard
2. Navigate to `guestbook_entries` table
3. Delete inappropriate entries if needed

### Updating Content

See [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) for:

- How to update text and dates
- How to change venue information
- How to modify navigation
- How to replace images

---

## 🐛 Troubleshooting

### Common Issues

**Build fails:**

- Check Node.js version (18+ required)
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors: `npm run build`

**Database connection fails:**

- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure RLS policies are configured (see DATABASE_SETUP.md)

**Emails not sending:**

- Verify Resend API key is correct
- Check sender email is verified in Resend
- Review Resend dashboard for delivery logs

**Site is slow:**

- Check image sizes (optimize large images)
- Review Vercel analytics for performance insights
- Consider reducing number of animated GIFs

See [FAQ.md](./FAQ.md) for more troubleshooting tips.

---

## 📊 Monitoring

### What to Monitor

- **RSVP submissions** - Check Supabase dashboard regularly
- **Email delivery** - Review Resend dashboard
- **Site performance** - Use Vercel analytics
- **Error logs** - Check Vercel function logs

### Data Export

Export RSVP data:

```bash
# From Supabase dashboard
1. Go to Table Editor
2. Select 'rsvps' table
3. Click 'Export' → 'CSV'
```

See [BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md) for backup procedures.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:

- Development setup
- Code style guidelines
- Testing procedures
- Pull request process

---

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Astro** - For the amazing static site framework
- **Supabase** - For the backend infrastructure
- **Vercel** - For hosting and deployment
- **Resend** - For email delivery
- **The 90s Internet** - For the inspiration

---

## 📞 Support

- **Technical Issues:** See [TROUBLESHOOTING.md](./FAQ.md#troubleshooting)
- **Content Updates:** See [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md)
- **Development Help:** See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**Made with 💕 and maximum 90s internet energy**

_Let's party like it's 1999!_ 🎉✨🎊

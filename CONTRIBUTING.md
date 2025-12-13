# 🤝 Contributing Guide

Thank you for your interest in contributing to Rachel & Tim's Wedding Website! This guide will help you set up your development environment and understand our development practices.

---

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Code Standards](#code-standards)
- [Project Structure](#project-structure)
- [Git Workflow](#git-workflow)
- [Testing Guidelines](#testing-guidelines)
- [Adding Features](#adding-features)
- [Troubleshooting](#troubleshooting)

---

## 🚀 Development Setup

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.x or higher ([download](https://nodejs.org))
- **npm** 9.x or higher (comes with Node.js)
- **Git** ([download](https://git-scm.com))
- **Code editor** (VS Code recommended)

### Initial Setup

1. **Clone the repository:**

```bash
git clone <repository-url>
cd rachelandtim-dot-fun
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=your_email@example.com
```

4. **Set up Supabase database:**

Follow instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md) to:

- Create Supabase project
- Run database migrations
- Configure RLS policies

5. **Start development server:**

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### IDE Setup (VS Code)

**Recommended Extensions:**

- **Astro** (`astro-build.astro-vscode`) - Astro language support
- **ESLint** (`dbaeumer.vscode-eslint`) - Code linting
- **Prettier** (`esbenp.prettier-vscode`) - Code formatting
- **TypeScript** (built-in) - TypeScript support
- **Tailwind CSS IntelliSense** (optional) - If using Tailwind

**VS Code Settings:**

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[astro]": {
    "editor.defaultFormatter": "astro-build.astro-vscode"
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Useful Commands

```bash
# Development
npm run dev          # Start dev server with hot reload
npm run start        # Alias for dev

# Building
npm run build        # Build for production
npm run preview      # Preview production build locally

# Type Checking
npm run astro check  # Check TypeScript types

# Astro CLI
npm run astro        # Run Astro CLI commands
```

---

## 📝 Code Standards

### TypeScript Conventions

**Use TypeScript for all new code:**

```typescript
// ✅ Good - Explicit types
interface RSVPData {
  name: string;
  email: string;
  attending: boolean;
  guestCount: number;
}

function submitRSVP(data: RSVPData): Promise<void> {
  // Implementation
}

// ❌ Bad - No types
function submitRSVP(data) {
  // Implementation
}
```

**Prefer interfaces over types for objects:**

```typescript
// ✅ Good
interface User {
  name: string;
  email: string;
}

// ⚠️ Acceptable but less preferred
type User = {
  name: string;
  email: string;
};
```

### Component Structure

**Astro Components:**

```astro
---
// 1. Imports
import BaseLayout from '../components/astro/BaseLayout.astro';
import { formatDate } from '../lib/utils';

// 2. Props interface
interface Props {
  title: string;
  date?: Date;
}

// 3. Props destructuring
const { title, date } = Astro.props;

// 4. Logic
const formattedDate = date ? formatDate(date) : null;
---

<!-- 5. Template -->
<BaseLayout title={title}>
  <h1>{title}</h1>
  {formattedDate && <p>{formattedDate}</p>}
</BaseLayout>

<!-- 6. Styles (scoped) -->
<style>
  h1 {
    color: var(--primary-color);
  }
</style>
```

**React Components:**

```tsx
// 1. Imports
import { useState, useEffect } from "react";
import "./ComponentName.css";

// 2. Props interface
interface ComponentNameProps {
  title: string;
  onSubmit?: (data: FormData) => void;
}

// 3. Component
export default function ComponentName({ title, onSubmit }: ComponentNameProps) {
  // 4. State
  const [isLoading, setIsLoading] = useState(false);

  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);

  // 6. Handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handler logic
  };

  // 7. Render
  return (
    <div className="component-name">
      <h2>{title}</h2>
      {/* Component JSX */}
    </div>
  );
}
```

### Naming Conventions

**Files:**

- Astro components: `PascalCase.astro` (e.g., `BaseLayout.astro`)
- React components: `PascalCase.tsx` (e.g., `RSVPForm.tsx`)
- Utilities: `camelCase.ts` (e.g., `supabase.ts`)
- Pages: `kebab-case.astro` (e.g., `rsvp.astro`)
- Styles: `kebab-case.css` (e.g., `geocities.css`)

**Variables and Functions:**

- Variables: `camelCase` (e.g., `userName`, `isLoading`)
- Functions: `camelCase` (e.g., `fetchData`, `handleSubmit`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `API_URL`, `MAX_GUESTS`)
- Components: `PascalCase` (e.g., `RSVPForm`, `Navigation`)

**CSS Classes:**

- Use `kebab-case` (e.g., `rsvp-form`, `nav-link`)
- Use BEM for complex components (e.g., `card__title`, `card--featured`)

### Comment Guidelines

**Use comments to explain "why", not "what":**

```typescript
// ✅ Good - Explains reasoning
// Debounce to prevent excessive API calls during typing
const debouncedSearch = debounce(searchFunction, 300);

// ❌ Bad - States the obvious
// Create a debounced function
const debouncedSearch = debounce(searchFunction, 300);
```

**Document complex logic:**

```typescript
/**
 * Calculates the total guest count including plus-ones
 *
 * @param rsvps - Array of RSVP responses
 * @returns Total number of guests attending
 */
function calculateTotalGuests(rsvps: RSVP[]): number {
  return rsvps
    .filter((rsvp) => rsvp.attending)
    .reduce((total, rsvp) => total + rsvp.guestCount, 0);
}
```

### Error Handling

**Always handle errors gracefully:**

```typescript
// ✅ Good
try {
  const data = await fetchRSVPs();
  return data;
} catch (error) {
  console.error("Failed to fetch RSVPs:", error);
  // Show user-friendly error message
  throw new Error("Unable to load RSVPs. Please try again.");
}

// ❌ Bad
const data = await fetchRSVPs(); // No error handling
```

---

## 📁 Project Structure

```
rachelandtim-dot-fun/
├── src/
│   ├── components/
│   │   ├── astro/           # Server-rendered components
│   │   │   ├── BaseLayout.astro
│   │   │   ├── Navigation.astro
│   │   │   └── Footer.astro
│   │   └── react/           # Client-side interactive components
│   │       ├── RSVPForm.tsx
│   │       ├── Guestbook.tsx
│   │       └── HitCounter.tsx
│   ├── pages/               # Routes (file-based routing)
│   │   ├── index.astro      # Home page (/)
│   │   ├── rsvp.astro       # RSVP page (/rsvp)
│   │   ├── schedule.astro   # Schedule page (/schedule)
│   │   ├── travel.astro     # Travel page (/travel)
│   │   ├── guestbook.astro  # Guestbook page (/guestbook)
│   │   └── api/             # API endpoints
│   │       ├── counter.ts   # Visitor counter API
│   │       ├── rsvp.ts      # RSVP submission API
│   │       └── guestbook.ts # Guestbook API
│   ├── styles/              # Global styles
│   │   ├── global.css       # Base styles
│   │   ├── geocities.css    # Geocities theme
│   │   └── animations.css   # Animations
│   ├── lib/                 # Utilities and helpers
│   │   ├── supabase.ts      # Supabase client
│   │   ├── resend.ts        # Resend email client
│   │   └── utils.ts         # Helper functions
│   └── env.d.ts             # TypeScript environment types
├── public/                  # Static assets
│   ├── images/              # Images and GIFs
│   ├── audio/               # MIDI files
│   └── favicon.svg          # Site favicon
├── docs/                    # Additional documentation
└── scripts/                 # Build and deployment scripts
```

### Key Directories

**`src/components/astro/`** - Server-rendered components

- Use for layouts, navigation, static content
- No client-side JavaScript
- Fast and SEO-friendly

**`src/components/react/`** - Interactive components

- Use for forms, dynamic content, user interactions
- Requires `client:*` directive in Astro
- Hydrated on the client

**`src/pages/`** - File-based routing

- Each `.astro` file becomes a route
- `index.astro` → `/`
- `rsvp.astro` → `/rsvp`

**`src/pages/api/`** - API endpoints

- Serverless functions
- Handle form submissions, database operations
- Return JSON responses

---

## 🔀 Git Workflow

### Branch Naming

Use descriptive branch names:

```bash
# Features
feature/add-photo-gallery
feature/rsvp-deadline-banner

# Bug fixes
fix/email-validation
fix/mobile-navigation

# Improvements
improve/performance-optimization
improve/accessibility

# Documentation
docs/update-readme
docs/add-deployment-guide
```

### Commit Messages

Follow conventional commit format:

```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(rsvp): add meal preference options
fix(guestbook): resolve duplicate entry bug
docs(readme): update installation instructions
style(css): improve mobile responsiveness
refactor(api): simplify error handling
test(rsvp): add form validation tests
chore(deps): update Astro to v4.16.2
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Pull Request Process

1. **Create a branch:**

```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes and commit:**

```bash
git add .
git commit -m "feat(scope): description"
```

3. **Push to remote:**

```bash
git push origin feature/your-feature-name
```

4. **Create Pull Request:**
   - Provide clear description
   - Reference related issues
   - Add screenshots for UI changes
   - Request review

5. **Address review feedback:**
   - Make requested changes
   - Push updates to same branch
   - Respond to comments

6. **Merge:**
   - Squash and merge (preferred)
   - Delete branch after merge

### Code Review Guidelines

**As a reviewer:**

- Be constructive and respectful
- Explain reasoning for suggestions
- Approve when satisfied
- Test changes locally if possible

**As an author:**

- Respond to all comments
- Ask questions if unclear
- Make requested changes
- Thank reviewers

---

## 🧪 Testing Guidelines

### Manual Testing Checklist

Before submitting a PR, test:

**Functionality:**

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Forms validate correctly
- [ ] API calls succeed
- [ ] Database updates correctly

**Browsers:**

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

**Responsive Design:**

- [ ] Desktop (1920px+)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (375px)

**Accessibility:**

- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Sufficient color contrast
- [ ] Alt text on images

### Testing API Endpoints

**Using curl:**

```bash
# Test RSVP submission
curl -X POST http://localhost:4321/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "attending": true,
    "guestCount": 2
  }'

# Test guestbook
curl -X POST http://localhost:4321/api/guestbook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "message": "Congratulations!",
    "email": "test@example.com"
  }'
```

**Using browser DevTools:**

1. Open DevTools (F12)
2. Go to Network tab
3. Submit form
4. Check request/response
5. Verify status code (200 = success)

### Database Testing

**Test in Supabase:**

1. Go to SQL Editor
2. Run test queries:

```sql
-- View recent RSVPs
SELECT * FROM rsvps ORDER BY created_at DESC LIMIT 10;

-- Count total attending
SELECT COUNT(*) FROM rsvps WHERE attending = true;

-- View guestbook entries
SELECT * FROM guestbook_entries ORDER BY created_at DESC;
```

3. Verify data is correct
4. Clean up test data:

```sql
-- Delete test entries
DELETE FROM rsvps WHERE email LIKE '%test%';
DELETE FROM guestbook_entries WHERE email LIKE '%test%';
```

---

## ➕ Adding Features

### Adding a New Page

1. **Create page file:**

```bash
# Create new page
touch src/pages/photos.astro
```

2. **Add basic structure:**

```astro
---
import BaseLayout from '../components/astro/BaseLayout.astro';
---

<BaseLayout title="Photos">
  <h1>Wedding Photos</h1>
  <p>Coming soon!</p>
</BaseLayout>
```

3. **Add navigation link:**

Edit `src/components/astro/Navigation.astro`:

```astro
<a href="/photos">Photos</a>
```

4. **Test the page:**

```bash
npm run dev
# Visit http://localhost:4321/photos
```

### Creating a New Component

**Astro Component:**

```astro
---
// src/components/astro/PhotoGallery.astro
interface Props {
  images: string[];
  title?: string;
}

const { images, title = 'Gallery' } = Astro.props;
---

<div class="photo-gallery">
  <h2>{title}</h2>
  <div class="gallery-grid">
    {images.map(image => (
      <img src={image} alt="Wedding photo" />
    ))}
  </div>
</div>

<style>
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
</style>
```

**React Component:**

```tsx
// src/components/react/PhotoCarousel.tsx
import { useState } from "react";
import "./PhotoCarousel.css";

interface PhotoCarouselProps {
  images: string[];
}

export default function PhotoCarousel({ images }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="photo-carousel">
      <button onClick={prevImage}>Previous</button>
      <img src={images[currentIndex]} alt="Wedding photo" />
      <button onClick={nextImage}>Next</button>
    </div>
  );
}
```

### Adding an API Endpoint

1. **Create API file:**

```typescript
// src/pages/api/photos.ts
import type { APIRoute } from "astro";
import { supabase } from "../../lib/supabase";

export const GET: APIRoute = async () => {
  try {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch photos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    // Validate data
    if (!data.url || !data.caption) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Insert into database
    const { error } = await supabase.from("photos").insert([data]);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to add photo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```

2. **Update database schema:**

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for adding tables.

### Updating Database Schema

1. **Plan the change:**
   - What data needs to be stored?
   - What are the relationships?
   - What indexes are needed?

2. **Create migration SQL:**

```sql
-- Add new table
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  url TEXT NOT NULL,
  caption TEXT,
  photographer TEXT
);

-- Add RLS policies
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos are viewable by everyone"
  ON photos FOR SELECT
  USING (true);
```

3. **Run in Supabase SQL Editor**

4. **Update TypeScript types:**

```typescript
// src/lib/types.ts
export interface Photo {
  id: string;
  created_at: string;
  url: string;
  caption?: string;
  photographer?: string;
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Kill process on port 4321
lsof -ti:4321 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

**Module not found:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**

```bash
# Check types
npm run astro check

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

**Build fails:**

```bash
# Clear Astro cache
rm -rf .astro node_modules/.astro

# Rebuild
npm run build
```

**Database connection fails:**

1. Check environment variables
2. Verify Supabase project is active
3. Test connection in Supabase dashboard
4. Check API key permissions

### Getting Help

- **Documentation:** Check relevant docs first
- **GitHub Issues:** Search existing issues
- **Discord/Slack:** Ask in community channels
- **Stack Overflow:** Search for similar problems

---

## 📚 Additional Resources

### Official Documentation

- **Astro:** [docs.astro.build](https://docs.astro.build)
- **React:** [react.dev](https://react.dev)
- **TypeScript:** [typescriptlang.org/docs](https://www.typescriptlang.org/docs)
- **Supabase:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel:** [vercel.com/docs](https://vercel.com/docs)

### Learning Resources

- **Astro Tutorial:** [docs.astro.build/en/tutorial](https://docs.astro.build/en/tutorial)
- **React Tutorial:** [react.dev/learn](https://react.dev/learn)
- **TypeScript Handbook:** [typescriptlang.org/docs/handbook](https://www.typescriptlang.org/docs/handbook)

---

## ✅ Contribution Checklist

Before submitting a PR:

- [ ] Code follows style guidelines
- [ ] TypeScript types are correct
- [ ] No console errors or warnings
- [ ] Tested on multiple browsers
- [ ] Tested on mobile devices
- [ ] Accessibility checked
- [ ] Documentation updated if needed
- [ ] Commit messages follow convention
- [ ] PR description is clear

---

**Thank you for contributing!** 🎉

Your contributions help make this wedding website special. If you have questions, don't hesitate to ask!

Made with 💕 by developers who care

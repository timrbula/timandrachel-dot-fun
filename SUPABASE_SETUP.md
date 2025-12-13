# 🗄️ Supabase Database Setup Guide

This guide will walk you through setting up the Supabase database for the Rachel & Tim wedding website.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Node.js 18+ installed
- This project cloned locally

## Quick Start

### 1. Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `rachelandtim-wedding` (or your preferred name)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
4. Click "Create new project"
5. Wait for the project to be provisioned (takes ~2 minutes)

### 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **Service role key** (under "Project API keys" - this is secret!)

### 3. Configure Environment Variables

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-service-role-key-here
   ```

3. Also add your other credentials:
   ```env
   RESEND_API_KEY=your-resend-api-key
   ADMIN_EMAIL=your-email@example.com
   ```

### 4. Run the Database Migration

#### Option A: Using the Setup Script (Recommended)

```bash
./scripts/setup-database.sh
```

This script will:

- Verify your environment variables
- Display the migration SQL
- Provide instructions for running it in Supabase

#### Option B: Manual Setup

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (in the left sidebar)
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

### 5. Verify the Setup

After running the migration, verify that the tables were created:

1. Go to **Table Editor** in your Supabase dashboard
2. You should see three tables:
   - `rsvps` - Stores guest RSVP responses
   - `guestbook` - Stores guestbook entries
   - `visitor_count` - Tracks website visitors

3. Check that Row Level Security (RLS) is enabled:
   - Click on each table
   - Look for the "RLS enabled" badge

## Database Schema

### Tables

#### `rsvps`

Stores guest RSVP responses with all their details.

| Column                   | Type      | Description                 |
| ------------------------ | --------- | --------------------------- |
| `id`                     | UUID      | Primary key                 |
| `created_at`             | TIMESTAMP | When the RSVP was submitted |
| `guest_name`             | TEXT      | Guest's full name           |
| `guest_email`            | TEXT      | Guest's email address       |
| `attending`              | BOOLEAN   | Whether they're attending   |
| `plus_one`               | BOOLEAN   | Whether bringing a plus one |
| `plus_one_name`          | TEXT      | Plus one's name (optional)  |
| `dietary_restrictions`   | TEXT      | Dietary needs (optional)    |
| `song_requests`          | TEXT      | Song requests (optional)    |
| `special_accommodations` | TEXT      | Special needs (optional)    |
| `number_of_guests`       | INTEGER   | Total guests (1-10)         |

#### `guestbook`

Stores messages from website visitors.

| Column       | Type      | Description                |
| ------------ | --------- | -------------------------- |
| `id`         | UUID      | Primary key                |
| `created_at` | TIMESTAMP | When the entry was created |
| `name`       | TEXT      | Visitor's name             |
| `message`    | TEXT      | Their message              |
| `location`   | TEXT      | Their location (optional)  |

#### `visitor_count`

Tracks the total number of website visitors.

| Column         | Type      | Description           |
| -------------- | --------- | --------------------- |
| `id`           | INTEGER   | Always 1 (single row) |
| `count`        | INTEGER   | Total visitor count   |
| `last_updated` | TIMESTAMP | Last increment time   |

### Security (Row Level Security)

The database uses Row Level Security (RLS) to protect data:

- **RSVPs**:
  - Anyone can INSERT (submit an RSVP)
  - Only service role can SELECT (read RSVPs)
  - This keeps guest information private

- **Guestbook**:
  - Anyone can SELECT (read entries)
  - Anyone can INSERT (sign the guestbook)

- **Visitor Count**:
  - Anyone can SELECT (read the count)
  - Only service role can UPDATE (increment)

### Database Functions

#### `increment_visitor_count()`

Atomically increments the visitor counter and returns the new count.

```sql
SELECT increment_visitor_count();
```

## Testing the Connection

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test Each Feature

Visit http://localhost:4321 and test:

- **Visitor Counter**: Should increment on page load
- **Guestbook**: Try signing the guestbook
- **RSVP Form**: Submit a test RSVP

### 3. Verify in Supabase Dashboard

1. Go to **Table Editor** in Supabase
2. Check each table for your test data:
   - `visitor_count` should show count > 0
   - `guestbook` should have your test entry
   - `rsvps` should have your test RSVP

## Troubleshooting

### "Missing SUPABASE_URL environment variable"

**Solution**: Make sure your `.env` file exists and contains:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### "Failed to fetch visitor count"

**Possible causes**:

1. Migration not run - Run the migration SQL in Supabase
2. Wrong API key - Check your `SUPABASE_SERVICE_KEY` in `.env`
3. RLS policies not set - Verify RLS is enabled on tables

### "Error inserting RSVP"

**Possible causes**:

1. Table doesn't exist - Run the migration
2. RLS policy missing - Check the "Anyone can submit RSVP" policy exists
3. Invalid data - Check the RSVP form validation

### Database Connection Issues

If you're having connection issues:

1. Verify your Supabase project is active (not paused)
2. Check your API keys are correct
3. Ensure your IP isn't blocked (Supabase allows all IPs by default)
4. Check Supabase status: https://status.supabase.com

## Viewing Your Data

### In Supabase Dashboard

1. Go to **Table Editor**
2. Select a table to view its data
3. You can:
   - View all rows
   - Filter and search
   - Edit individual rows
   - Export data as CSV

### Using SQL Editor

Run custom queries in the SQL Editor:

```sql
-- Get all RSVPs
SELECT * FROM rsvps ORDER BY created_at DESC;

-- Count attending guests
SELECT COUNT(*) as attending_count
FROM rsvps
WHERE attending = true;

-- Get recent guestbook entries
SELECT * FROM guestbook
ORDER BY created_at DESC
LIMIT 10;

-- Check visitor count
SELECT * FROM visitor_count;
```

## Backup and Export

### Automatic Backups

Supabase provides automatic daily backups on paid plans.

### Manual Export

To export your data:

1. Go to **Table Editor**
2. Select a table
3. Click the **Export** button
4. Choose CSV format
5. Download the file

### SQL Dump

For a complete database backup:

1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Use `pg_dump` with the connection string:
   ```bash
   pg_dump "postgresql://..." > backup.sql
   ```

## Production Deployment

### Vercel Environment Variables

When deploying to Vercel, add these environment variables:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `RESEND_API_KEY`
   - `ADMIN_EMAIL`

### Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Service role key is never exposed to client
- [ ] RLS policies are enabled on all tables
- [ ] Environment variables are set in Vercel
- [ ] Database password is strong and secure
- [ ] API keys are rotated if compromised

## Support

If you need help:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Visit the [Supabase Discord](https://discord.supabase.com)
3. Review the project's `DATABASE_SETUP.md` for more details

---

**Ready to go!** 🚀 Your database is now set up and ready to handle RSVPs, guestbook entries, and visitor tracking for your wedding website!

# 🚀 Deployment Guide - Rachel & Tim's Wedding Website

This guide will walk you through deploying your Geocities-style wedding website to production using Vercel, Supabase, and Resend.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Step 1: Supabase Setup](#step-1-supabase-setup)
4. [Step 2: Resend Email Setup](#step-2-resend-email-setup)
5. [Step 3: Local Testing](#step-3-local-testing)
6. [Step 4: GitHub Setup](#step-4-github-setup)
7. [Step 5: Vercel Deployment](#step-5-vercel-deployment)
8. [Step 6: Post-Deployment Verification](#step-6-post-deployment-verification)
9. [Custom Domain Setup](#custom-domain-setup)
10. [Monitoring & Maintenance](#monitoring--maintenance)
11. [Troubleshooting](#troubleshooting)
12. [Production Readiness Checklist](#production-readiness-checklist)

---

## Prerequisites

Before you begin, make sure you have:

- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] GitHub account
- [ ] Vercel account (free tier is fine)
- [ ] Supabase account (free tier is fine)
- [ ] Resend account (free tier is fine)
- [ ] Basic command line knowledge

**Estimated Time:** 30-45 minutes for first-time setup

---

## Pre-Deployment Checklist

Before deploying, verify:

- [ ] All code is committed to Git
- [ ] `.env` file is in `.gitignore` (never commit secrets!)
- [ ] All dependencies are in `package.json`
- [ ] Local development server works (`npm run dev`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] All interactive features tested locally

---

## Step 1: Supabase Setup

Supabase provides your PostgreSQL database for RSVPs, guestbook entries, and visitor counter.

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Sign in with GitHub (recommended) or email
4. Click **"New Project"**
5. Fill in project details:
   - **Name:** `rachelandtim-wedding` (or your choice)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your guests (e.g., `us-east-1` for NYC)
   - **Pricing Plan:** Free tier is sufficient
6. Click **"Create new project"**
7. Wait 2-3 minutes for project to initialize

### 1.2 Run Database Migration

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open `DATABASE_SETUP.md` in your project
4. Copy the entire SQL migration (lines 8-103)
5. Paste into the SQL Editor
6. Click **"Run"** or press `Ctrl/Cmd + Enter`
7. You should see: **"Success. No rows returned"**

### 1.3 Verify Tables Created

1. Click **"Table Editor"** in the left sidebar
2. You should see three tables:
   - `rsvps` - Stores RSVP submissions
   - `guestbook` - Stores guestbook messages
   - `visitor_count` - Tracks site visitors
3. Click on each table to verify structure

### 1.4 Verify RLS Policies

1. Click on `rsvps` table
2. Click **"RLS"** tab at the top
3. Verify policies exist:
   - ✅ "Anyone can submit RSVP" (INSERT)
   - ✅ "Service role can read RSVPs" (SELECT)
4. Repeat for `guestbook` and `visitor_count` tables

### 1.5 Get API Keys

1. Click **"Settings"** (gear icon) in the left sidebar
2. Click **"API"** under Project Settings
3. Copy these values (you'll need them later):
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** Long string starting with `eyJ...`
   - **service_role key:** Long string starting with `eyJ...` (keep secret!)

⚠️ **IMPORTANT:** The `service_role` key has full database access. NEVER expose it in client-side code or commit it to Git!

### 1.6 Test Database Connection (Optional)

You can test your database using the Supabase dashboard:

1. Go to **Table Editor** > `visitor_count`
2. You should see one row with `count: 0`
3. Go to **SQL Editor** and run:
   ```sql
   SELECT increment_visitor_count();
   ```
4. Check `visitor_count` table - count should now be `1`

---

## Step 2: Resend Email Setup

Resend handles sending RSVP confirmation emails to guests and notifications to you.

### 2.1 Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click **"Start Building"** or **"Sign Up"**
3. Sign up with email or GitHub
4. Verify your email address

### 2.2 Get API Key

1. In Resend dashboard, click **"API Keys"** in the left sidebar
2. Click **"Create API Key"**
3. Name it: `rachelandtim-wedding-production`
4. Permission: **"Full access"** (or "Sending access" if available)
5. Click **"Create"**
6. Copy the API key (starts with `re_...`)
7. ⚠️ **Save it now!** You won't be able to see it again

### 2.3 Verify Domain (Optional but Recommended)

For better email deliverability, verify your domain:

1. Click **"Domains"** in the left sidebar
2. Click **"Add Domain"**
3. Enter your domain (e.g., `rachelandtim.fun`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (can take up to 48 hours)

**Note:** You can send emails without domain verification, but they'll come from `onboarding@resend.dev`. With verification, they'll come from your domain.

### 2.4 Test Email Sending (Optional)

Test that emails work:

1. Go to **"Emails"** in the left sidebar
2. Click **"Send Test Email"**
3. Enter your email address
4. Click **"Send"**
5. Check your inbox (and spam folder)

---

## Step 3: Local Testing

Before deploying, test everything works locally with production-like settings.

### 3.1 Create Local Environment File

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your actual values:

   ```env
   # From Supabase (Step 1.5)
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_KEY=eyJhbGc...

   # From Resend (Step 2.2)
   RESEND_API_KEY=re_xxxxx

   # Your email for RSVP notifications
   ADMIN_EMAIL=your-email@example.com
   ```

3. Save the file

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Run Development Server

```bash
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### 3.4 Test All Features

Test each feature thoroughly:

#### ✅ Homepage

- [ ] Page loads without errors
- [ ] Visitor counter increments on refresh
- [ ] All images and GIFs load
- [ ] Navigation works

#### ✅ RSVP Form

1. Go to `/rsvp`
2. Fill out the form completely
3. Submit the form
4. Check for success message
5. Check your email for confirmation
6. Check admin email for notification
7. Verify in Supabase Table Editor that RSVP was saved

#### ✅ Guestbook

1. Go to `/guestbook`
2. Sign the guestbook
3. Verify message appears immediately
4. Refresh page - message should persist
5. Check Supabase Table Editor to verify entry

#### ✅ Other Pages

- [ ] `/schedule` loads correctly
- [ ] `/travel` loads correctly
- [ ] All navigation links work
- [ ] Footer displays correctly

### 3.5 Build for Production

Test that the production build works:

```bash
npm run build
```

Expected output:

```
✓ Completed in XXXms.
```

If you see errors, fix them before proceeding!

### 3.6 Preview Production Build

```bash
npm run preview
```

Open [http://localhost:4321](http://localhost:4321) and test again. This simulates the production environment.

---

## Step 4: GitHub Setup

Your code needs to be on GitHub for Vercel to deploy it.

### 4.1 Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. Repository name: `rachelandtim-wedding` (or your choice)
3. Description: "Our Geocities-style wedding website 💒"
4. Visibility: **Private** (recommended) or Public
5. **Do NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### 4.2 Push Code to GitHub

If you haven't initialized Git yet:

```bash
git init
git add .
git commit -m "Initial commit - wedding website ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rachelandtim-wedding.git
git push -u origin main
```

If you already have Git initialized:

```bash
git add .
git commit -m "Ready for deployment"
git push
```

### 4.3 Verify Files on GitHub

1. Go to your repository on GitHub
2. Verify these files are present:
   - ✅ `package.json`
   - ✅ `astro.config.mjs`
   - ✅ `src/` directory
   - ✅ `public/` directory
   - ✅ `.env.example` (should be there)
   - ❌ `.env` (should NOT be there!)

⚠️ **CRITICAL:** If you see `.env` on GitHub, delete it immediately and remove it from Git history!

---

## Step 5: Vercel Deployment

Vercel will host your website and handle the build process.

### 5.1 Create Vercel Account

1. Go to [https://vercel.com/signup](https://vercel.com/signup)
2. Click **"Continue with GitHub"** (recommended)
3. Authorize Vercel to access your GitHub account

### 5.2 Import Project

1. Click **"Add New..."** > **"Project"**
2. Find your `rachelandtim-wedding` repository
3. Click **"Import"**

### 5.3 Configure Project

On the configuration screen:

1. **Framework Preset:** Should auto-detect "Astro"
2. **Root Directory:** Leave as `./`
3. **Build Command:** `npm run build` (should be pre-filled)
4. **Output Directory:** `dist` (should be pre-filled)
5. **Install Command:** `npm install` (should be pre-filled)

### 5.4 Add Environment Variables

This is the most important step! Click **"Environment Variables"** and add each one:

| Name                   | Value                       | Where to Get It                        |
| ---------------------- | --------------------------- | -------------------------------------- |
| `SUPABASE_URL`         | `https://xxxxx.supabase.co` | Supabase Settings > API                |
| `SUPABASE_ANON_KEY`    | `eyJhbGc...`                | Supabase Settings > API (anon public)  |
| `SUPABASE_SERVICE_KEY` | `eyJhbGc...`                | Supabase Settings > API (service_role) |
| `RESEND_API_KEY`       | `re_xxxxx`                  | Resend API Keys                        |
| `ADMIN_EMAIL`          | `your-email@example.com`    | Your email address                     |

**For each variable:**

1. Enter the **Name** (exactly as shown above)
2. Enter the **Value** (copy from Supabase/Resend)
3. Select **"Production"**, **"Preview"**, and **"Development"**
4. Click **"Add"**

⚠️ **Double-check:** Make sure there are no extra spaces or quotes around values!

### 5.5 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build to complete
3. You'll see a progress log - watch for any errors
4. When complete, you'll see: **"Congratulations! Your project has been deployed."**

### 5.6 Get Your URL

Your site is now live! Vercel assigns a URL like:

- `https://rachelandtim-wedding.vercel.app`
- `https://rachelandtim-wedding-xxxxx.vercel.app`

Click **"Visit"** to see your live site!

---

## Step 6: Post-Deployment Verification

Test everything on the live site to make sure it works in production.

### 6.1 Test All Pages

Visit each page and verify:

- [ ] Homepage loads: `https://your-site.vercel.app/`
- [ ] RSVP page loads: `https://your-site.vercel.app/rsvp`
- [ ] Guestbook loads: `https://your-site.vercel.app/guestbook`
- [ ] Schedule loads: `https://your-site.vercel.app/schedule`
- [ ] Travel loads: `https://your-site.vercel.app/travel`

### 6.2 Test Visitor Counter

1. Go to homepage
2. Note the visitor count
3. Refresh the page
4. Count should increment by 1
5. Open in incognito/private window
6. Count should increment again

### 6.3 Test RSVP Form

**IMPORTANT:** Use a real email address you can check!

1. Go to `/rsvp` on your live site
2. Fill out the form with test data:
   - Name: "Test Guest"
   - Email: Your real email
   - Attending: Yes
   - Plus One: Yes
   - Plus One Name: "Test Plus One"
   - Number of Guests: 2
3. Submit the form
4. Verify success message appears
5. Check your email inbox for confirmation (check spam!)
6. Check admin email for notification
7. Verify in Supabase Table Editor:
   - Go to Supabase dashboard
   - Table Editor > `rsvps`
   - You should see your test RSVP

### 6.4 Test Guestbook

1. Go to `/guestbook` on your live site
2. Sign the guestbook with a test message
3. Verify message appears immediately
4. Refresh the page
5. Message should still be there
6. Verify in Supabase Table Editor:
   - Table Editor > `guestbook`
   - You should see your test message

### 6.5 Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through all pages
4. Look for any errors (red text)
5. If you see errors, investigate and fix

### 6.6 Test on Mobile

1. Open your site on a mobile device
2. Test all pages and features
3. Verify responsive design works
4. Test form submissions

### 6.7 Test Different Browsers

Test on at least:

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## Custom Domain Setup

Want to use your own domain like `rachelandtim.fun` instead of `vercel.app`?

### 7.1 Purchase a Domain

If you don't have one yet:

1. Go to a domain registrar:
   - [Namecheap](https://www.namecheap.com) (recommended)
   - [Google Domains](https://domains.google)
   - [GoDaddy](https://www.godaddy.com)
2. Search for your desired domain
3. Purchase it (usually $10-15/year)

### 7.2 Add Domain to Vercel

1. Go to your Vercel project dashboard
2. Click **"Settings"** tab
3. Click **"Domains"** in the left sidebar
4. Enter your domain (e.g., `rachelandtim.fun`)
5. Click **"Add"**

### 7.3 Configure DNS

Vercel will show you DNS records to add. You have two options:

#### Option A: Use Vercel Nameservers (Recommended - Easiest)

1. Vercel will show nameservers like:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ```
2. Go to your domain registrar's dashboard
3. Find DNS or Nameserver settings
4. Replace existing nameservers with Vercel's
5. Save changes
6. Wait 24-48 hours for propagation

#### Option B: Add DNS Records Manually

1. Vercel will show records like:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

2. Go to your domain registrar's DNS settings
3. Add each record exactly as shown
4. Save changes
5. Wait 1-24 hours for propagation

### 7.4 Verify Domain

1. In Vercel, wait for domain status to show **"Valid Configuration"**
2. Visit your custom domain
3. You should see your site!
4. SSL certificate is automatically provisioned (HTTPS)

### 7.5 Set as Primary Domain (Optional)

1. In Vercel Domains settings
2. Click the three dots next to your domain
3. Click **"Set as Primary"**
4. Now `vercel.app` URLs will redirect to your custom domain

---

## Monitoring & Maintenance

### 8.1 View Deployment Logs

To see what happened during deployment:

1. Go to Vercel dashboard
2. Click on your project
3. Click **"Deployments"** tab
4. Click on any deployment
5. Click **"Building"** to see build logs
6. Click **"Functions"** to see API logs

### 8.2 Monitor Errors

#### Vercel Errors

1. Go to Vercel dashboard
2. Click **"Analytics"** tab
3. Look for error rates and slow pages

#### Supabase Monitoring

1. Go to Supabase dashboard
2. Click **"Database"** > **"Logs"**
3. Monitor queries and errors
4. Check **"API"** > **"Logs"** for API errors

#### Resend Monitoring

1. Go to Resend dashboard
2. Click **"Emails"**
3. See all sent emails and their status
4. Check for bounces or failures

### 8.3 Update the Site

To make changes and redeploy:

1. Make changes locally
2. Test with `npm run dev`
3. Commit changes:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel automatically deploys on push!
5. Wait 2-3 minutes for deployment
6. Check your live site

### 8.4 Backup Database

Supabase automatically backs up your database daily, but you can also:

#### Manual Backup

1. Go to Supabase dashboard
2. Click **"Database"** > **"Backups"**
3. Click **"Create backup"**
4. Download backup file

#### Export Data

1. Go to **"Table Editor"**
2. Click on a table (e.g., `rsvps`)
3. Click **"..."** menu
4. Click **"Download as CSV"**
5. Save the file

### 8.5 Export RSVP Data

To get a list of all RSVPs:

1. Go to Supabase dashboard
2. Click **"SQL Editor"**
3. Run this query:
   ```sql
   SELECT
     guest_name,
     guest_email,
     attending,
     number_of_guests,
     plus_one_name,
     dietary_restrictions,
     song_requests,
     special_accommodations,
     created_at
   FROM rsvps
   ORDER BY created_at DESC;
   ```
4. Click **"Download CSV"**

Or use the Table Editor:

1. Go to **"Table Editor"** > `rsvps`
2. Click **"..."** menu
3. Click **"Download as CSV"**

---

## Troubleshooting

### 9.1 Build Failures

#### Error: "Command failed with exit code 1"

**Cause:** TypeScript errors or missing dependencies

**Solution:**

1. Run `npm run build` locally
2. Fix any TypeScript errors shown
3. Commit and push fixes
4. Redeploy

#### Error: "Module not found"

**Cause:** Missing dependency in `package.json`

**Solution:**

1. Check which module is missing
2. Install it: `npm install <module-name>`
3. Commit `package.json` and `package-lock.json`
4. Push and redeploy

### 9.2 Environment Variable Issues

#### Error: "SUPABASE_URL is not defined"

**Cause:** Environment variable not set in Vercel

**Solution:**

1. Go to Vercel project settings
2. Click **"Environment Variables"**
3. Verify all variables are present
4. Check for typos in variable names
5. Make sure values don't have extra spaces
6. Redeploy after adding variables

#### Error: "Invalid API key"

**Cause:** Wrong API key or expired key

**Solution:**

1. Go to Supabase/Resend dashboard
2. Verify API keys are correct
3. Generate new keys if needed
4. Update in Vercel environment variables
5. Redeploy

### 9.3 Database Connection Errors

#### Error: "Failed to fetch" or "Network error"

**Cause:** Wrong Supabase URL or RLS policies blocking access

**Solution:**

1. Verify `SUPABASE_URL` is correct
2. Check Supabase project is active (not paused)
3. Verify RLS policies in Supabase:
   - Go to Table Editor
   - Click on table
   - Click **"RLS"** tab
   - Verify policies exist
4. Check browser console for specific error

#### Error: "Row Level Security policy violation"

**Cause:** RLS policy blocking the operation

**Solution:**

1. Go to Supabase Table Editor
2. Click on the affected table
3. Click **"RLS"** tab
4. Verify policies match the migration
5. If needed, re-run the migration SQL

### 9.4 Email Sending Failures

#### Emails not being received

**Possible causes and solutions:**

1. **Check spam folder** - Emails might be filtered
2. **Verify Resend API key:**
   - Go to Resend dashboard
   - Check API key is active
   - Update in Vercel if needed
3. **Check Resend logs:**
   - Go to Resend dashboard
   - Click **"Emails"**
   - Look for failed sends
4. **Verify email addresses:**
   - Check `ADMIN_EMAIL` is correct
   - Test with different email addresses
5. **Domain verification:**
   - If using custom domain, verify it's verified in Resend

#### Error: "Invalid API key"

**Solution:**

1. Go to Resend dashboard
2. Generate new API key
3. Update `RESEND_API_KEY` in Vercel
4. Redeploy

### 9.5 API Endpoint Errors

#### Error: "404 Not Found" on API routes

**Cause:** API route not found or incorrect path

**Solution:**

1. Verify API files exist in `src/pages/api/`
2. Check file names match routes:
   - `/api/rsvp` → `src/pages/api/rsvp.ts`
   - `/api/guestbook` → `src/pages/api/guestbook.ts`
   - `/api/counter` → `src/pages/api/counter.ts`
3. Rebuild and redeploy

#### Error: "500 Internal Server Error"

**Cause:** Error in API route code

**Solution:**

1. Check Vercel function logs:
   - Go to Vercel dashboard
   - Click **"Deployments"**
   - Click on latest deployment
   - Click **"Functions"**
   - Look for error messages
2. Fix the error in code
3. Commit and push

### 9.6 CORS Issues

#### Error: "CORS policy blocked"

**Cause:** Cross-origin request blocked

**Solution:**

1. Verify you're accessing the site from the correct domain
2. Check Supabase CORS settings:
   - Go to Supabase Settings > API
   - Verify your domain is allowed
3. For local development, use `localhost:4321` not `127.0.0.1`

### 9.7 Performance Problems

#### Site loads slowly

**Solutions:**

1. **Optimize images:**
   - Compress GIFs and images
   - Use appropriate sizes
2. **Check Vercel analytics:**
   - Go to Vercel dashboard
   - Click **"Analytics"**
   - Look for slow pages
3. **Check Supabase performance:**
   - Go to Supabase dashboard
   - Check database usage
   - Add indexes if needed

#### Visitor counter slow to update

**Solution:**

1. Check Supabase function logs
2. Verify `increment_visitor_count()` function exists
3. Check for database locks or slow queries

### 9.8 Mobile Issues

#### Site doesn't work on mobile

**Solutions:**

1. Test responsive design locally
2. Check browser console on mobile device
3. Verify viewport meta tag in layout
4. Test on different mobile browsers

### 9.9 Getting Help

If you're still stuck:

1. **Check Vercel logs** for specific error messages
2. **Check Supabase logs** for database errors
3. **Check browser console** for client-side errors
4. **Search error messages** on Google/Stack Overflow
5. **Ask in communities:**
   - [Astro Discord](https://astro.build/chat)
   - [Vercel Discord](https://vercel.com/discord)
   - [Supabase Discord](https://discord.supabase.com)

---

## Production Readiness Checklist

Before going live, verify everything is ready:

### ✅ Environment Setup

- [ ] Supabase project created
- [ ] Database tables created
- [ ] RLS policies enabled and tested
- [ ] Supabase API keys obtained
- [ ] Resend account created
- [ ] Resend API key obtained
- [ ] Admin email configured

### ✅ Code Quality

- [ ] All TypeScript errors fixed
- [ ] Production build succeeds (`npm run build`)
- [ ] No console errors in browser
- [ ] All dependencies in `package.json`
- [ ] `.env` file in `.gitignore`
- [ ] Code pushed to GitHub

### ✅ Vercel Configuration

- [ ] Project imported from GitHub
- [ ] All environment variables set
- [ ] Build settings configured
- [ ] First deployment successful
- [ ] Deployment URL accessible

### ✅ Feature Testing

- [ ] Homepage loads correctly
- [ ] Visitor counter increments
- [ ] RSVP form submits successfully
- [ ] RSVP confirmation email received
- [ ] Admin notification email received
- [ ] Guestbook posts and displays messages
- [ ] All navigation links work
- [ ] All pages load without errors

### ✅ Cross-Browser Testing

- [ ] Tested on Chrome/Edge
- [ ] Tested on Firefox
- [ ] Tested on Safari
- [ ] Tested on mobile devices

### ✅ Security

- [ ] Service role key not exposed in client code
- [ ] RLS policies prevent unauthorized access
- [ ] Environment variables not committed to Git
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Form validation working

### ✅ Performance

- [ ] Images optimized
- [ ] Page load times acceptable
- [ ] No memory leaks
- [ ] Database queries efficient

### ✅ Monitoring

- [ ] Vercel analytics enabled
- [ ] Supabase monitoring checked
- [ ] Resend email logs accessible
- [ ] Error tracking in place

### ✅ Backup & Recovery

- [ ] Database backup strategy understood
- [ ] Know how to export RSVP data
- [ ] Know how to rollback deployment
- [ ] Migration files in version control

### ✅ Documentation

- [ ] Deployment guide reviewed
- [ ] Team members know how to update site
- [ ] Troubleshooting guide accessible
- [ ] Contact information for support

---

## 🎉 Congratulations!

Your wedding website is now live! Share the URL with your guests and start collecting RSVPs!

### Next Steps

1. **Share your site:**
   - Send the URL to friends and family
   - Post on social media
   - Add to wedding invitations

2. **Monitor RSVPs:**
   - Check Supabase dashboard regularly
   - Export RSVP data as needed
   - Respond to special accommodations

3. **Keep it updated:**
   - Add new information as needed
   - Update schedule if it changes
   - Keep guestbook moderated

4. **After the wedding:**
   - Export all data for memories
   - Consider keeping site up as a keepsake
   - Thank your guests via guestbook

---

## 📞 Support Resources

- **Astro Docs:** [https://docs.astro.build](https://docs.astro.build)
- **Vercel Docs:** [https://vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs:** [https://supabase.com/docs](https://supabase.com/docs)
- **Resend Docs:** [https://resend.com/docs](https://resend.com/docs)

---

**Made with ❤️ for Rachel & Tim**

_Last updated: December 2024_

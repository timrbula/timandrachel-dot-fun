# 💾 Backup & Recovery Strategy

This document outlines comprehensive backup and recovery procedures for your wedding website to ensure no data is lost.

---

## 📋 Table of Contents

- [What to Backup](#what-to-backup)
- [Backup Procedures](#backup-procedures)
- [Recovery Procedures](#recovery-procedures)
- [Data Export](#data-export)
- [Backup Schedule](#backup-schedule)
- [Storage Recommendations](#storage-recommendations)
- [Emergency Contacts](#emergency-contacts)

---

## 📦 What to Backup

### Critical Data

**1. Database Content**

- ✅ RSVP submissions (`rsvps` table)
- ✅ Guestbook entries (`guestbook_entries` table)
- ✅ Visitor counter (`visitor_counter` table)

**2. Configuration**

- ✅ Environment variables (`.env` file)
- ✅ Supabase project settings
- ✅ Resend API configuration
- ✅ Vercel deployment settings

**3. Code & Content**

- ✅ Source code (Git repository)
- ✅ Custom modifications
- ✅ Content updates
- ✅ Configuration files

**4. Assets**

- ✅ Custom images and photos
- ✅ Custom GIFs (if created)
- ✅ MIDI files
- ✅ Favicon and branding

### What's Already Protected

**Automatically backed up:**

- ✅ Git repository (GitHub/GitLab)
- ✅ Supabase database (daily automatic backups)
- ✅ Vercel deployments (deployment history)
- ✅ Public assets (in Git)

**No backup needed:**

- ❌ `node_modules` (can be reinstalled)
- ❌ Build artifacts (can be rebuilt)
- ❌ Cache files (temporary)

---

## 🔄 Backup Procedures

### Automated Backups

#### Supabase Automatic Backups

Supabase automatically backs up your database:

**Free Tier:**

- Daily backups
- 7-day retention
- Point-in-time recovery (last 7 days)

**Pro Tier ($25/month):**

- Daily backups
- 30-day retention
- Point-in-time recovery (last 30 days)

**To verify automatic backups:**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **"Database"** → **"Backups"**
4. View backup history and status

#### Git Repository Backups

Your code is automatically backed up to Git:

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Update: description of changes"
git push origin main
```

**Best practices:**

- Commit changes regularly
- Push to remote repository daily
- Use descriptive commit messages
- Tag important versions

### Manual Backup Procedures

#### Full Database Backup (Recommended Weekly)

**Method 1: Supabase Dashboard (Easiest)**

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **"Database"** → **"Backups"**
4. Click **"Create backup"** (if available on your plan)
5. Download backup file

**Method 2: Export Tables to CSV**

1. Go to **"Table Editor"**
2. For each table (`rsvps`, `guestbook_entries`, `visitor_counter`):
   - Select the table
   - Click **"..."** menu (top right)
   - Select **"Export to CSV"**
   - Save file with date: `rsvps_2026-01-15.csv`
3. Store all CSV files together

**Method 3: SQL Dump (Advanced)**

```bash
# Using Supabase CLI (requires installation)
supabase db dump -f backup_$(date +%Y%m%d).sql

# Or using pg_dump (if you have direct database access)
pg_dump -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_$(date +%Y%m%d).sql
```

#### Environment Variables Backup

**Create a secure backup of your `.env` file:**

```bash
# Copy .env to a secure location
cp .env .env.backup.$(date +%Y%m%d)

# Or create a documented version
cat > env_backup_$(date +%Y%m%d).txt << EOF
# Backup created: $(date)
# DO NOT COMMIT THIS FILE TO GIT

PUBLIC_SUPABASE_URL=your_url_here
PUBLIC_SUPABASE_ANON_KEY=your_key_here
RESEND_API_KEY=your_key_here
ADMIN_EMAIL=your_email_here
EOF
```

**⚠️ IMPORTANT:** Store this file securely, NOT in Git!

**Recommended storage:**

- Password manager (1Password, LastPass, Bitwarden)
- Encrypted cloud storage
- Secure note-taking app
- Physical secure location

#### Asset Backup

**Backup custom assets:**

```bash
# Create assets backup folder
mkdir -p backups/assets_$(date +%Y%m%d)

# Copy custom images
cp -r public/images/custom/* backups/assets_$(date +%Y%m%d)/

# Copy any custom audio
cp -r public/audio/custom/* backups/assets_$(date +%Y%m%d)/

# Create archive
tar -czf backups/assets_$(date +%Y%m%d).tar.gz backups/assets_$(date +%Y%m%d)
```

#### Complete Project Backup

**Full project snapshot:**

```bash
# Create backup directory
mkdir -p ~/wedding-website-backups

# Create dated backup
tar -czf ~/wedding-website-backups/wedding-site-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.astro' \
  --exclude='dist' \
  .

# Verify backup was created
ls -lh ~/wedding-website-backups/
```

---

## 🔧 Recovery Procedures

### Restoring Database

#### From Supabase Automatic Backup

1. Go to Supabase Dashboard
2. Navigate to **"Database"** → **"Backups"**
3. Select backup date to restore
4. Click **"Restore"**
5. Confirm restoration (⚠️ This will overwrite current data)
6. Wait for restoration to complete
7. Verify data is correct

#### From CSV Export

**Restore individual tables:**

1. Go to **"Table Editor"**
2. Select table to restore
3. Click **"..."** menu → **"Import data"**
4. Upload CSV file
5. Map columns correctly:
   - Ensure column names match
   - Check data types
   - Handle ID conflicts
6. Click **"Import"**
7. Verify imported data

**⚠️ Note:** This adds data, doesn't replace. Clear table first if needed:

```sql
-- In SQL Editor
DELETE FROM rsvps;  -- Clear before import
```

#### From SQL Dump

```bash
# Using Supabase CLI
supabase db reset --db-url "your-database-url"
psql -h db.your-project.supabase.co \
  -U postgres \
  -d postgres \
  -f backup_20260115.sql
```

### Restoring Environment Variables

1. Locate your backed-up `.env` file
2. Copy to project root:
   ```bash
   cp .env.backup.20260115 .env
   ```
3. Update Vercel environment variables:
   - Go to Vercel Dashboard
   - Select project
   - Go to **"Settings"** → **"Environment Variables"**
   - Update each variable
   - Redeploy

### Restoring Code

#### From Git Repository

```bash
# Clone repository
git clone <repository-url>
cd rachelandtim-dot-fun

# Or reset to specific commit
git log  # Find commit hash
git reset --hard <commit-hash>

# Reinstall dependencies
npm install

# Restore environment variables
cp .env.backup .env

# Test locally
npm run dev
```

#### From Project Backup

```bash
# Extract backup
tar -xzf wedding-site-20260115.tar.gz -C ~/restored-project

# Navigate to restored project
cd ~/restored-project

# Reinstall dependencies
npm install

# Restore environment variables
# (copy from secure storage)

# Test
npm run dev
```

### Recovering from Deployment Issues

#### Rollback Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Click **"Deployments"**
4. Find last working deployment
5. Click **"..."** → **"Promote to Production"**
6. Confirm promotion
7. Verify site is working

#### Rebuild from Scratch

If everything fails:

```bash
# 1. Clone repository
git clone <repository-url>
cd rachelandtim-dot-fun

# 2. Install dependencies
npm install

# 3. Restore environment variables
# Copy from secure backup

# 4. Test locally
npm run dev

# 5. Restore database
# Use Supabase backup or CSV imports

# 6. Deploy
vercel --prod
```

---

## 📊 Data Export

### Exporting RSVP Data

#### For Spreadsheet Analysis

**Via Supabase Dashboard:**

1. Go to **"Table Editor"** → **"rsvps"**
2. Click **"..."** → **"Export to CSV"**
3. Open in Excel/Google Sheets/Numbers

**Useful columns for planning:**

- `name` - Guest names
- `email` - Contact information
- `attending` - Yes/No
- `guest_count` - Number of guests
- `meal_preference` - Dietary choices
- `dietary_restrictions` - Special needs
- `created_at` - When they RSVP'd

#### For Email Lists

**Extract email addresses:**

```sql
-- In Supabase SQL Editor
SELECT email, name
FROM rsvps
WHERE attending = true
ORDER BY name;
```

Copy results and paste into email client.

#### For Venue/Catering

**Create summary report:**

```sql
-- Total attending
SELECT COUNT(*) as total_guests
FROM rsvps
WHERE attending = true;

-- Meal preferences breakdown
SELECT
  meal_preference,
  COUNT(*) as count
FROM rsvps
WHERE attending = true
GROUP BY meal_preference;

-- Dietary restrictions
SELECT
  name,
  dietary_restrictions
FROM rsvps
WHERE attending = true
  AND dietary_restrictions IS NOT NULL
  AND dietary_restrictions != '';
```

### Exporting Guestbook Data

**For keepsake book:**

1. Go to **"Table Editor"** → **"guestbook_entries"**
2. Export to CSV
3. Open in spreadsheet
4. Sort by date: `created_at`
5. Format for printing:
   - Name
   - Message
   - Date

**Create formatted document:**

```sql
-- Get formatted entries
SELECT
  name,
  message,
  TO_CHAR(created_at, 'Month DD, YYYY') as date
FROM guestbook_entries
ORDER BY created_at;
```

### Exporting All Data

**Complete data export:**

```bash
# Export all tables
# In Supabase Dashboard:
# 1. Export rsvps → rsvps_final.csv
# 2. Export guestbook_entries → guestbook_final.csv
# 3. Export visitor_counter → counter_final.csv

# Create archive
mkdir wedding_data_export_$(date +%Y%m%d)
# Move CSV files to folder
tar -czf wedding_data_export_$(date +%Y%m%d).tar.gz wedding_data_export_$(date +%Y%m%d)
```

---

## 📅 Backup Schedule

### Recommended Schedule

**Daily (Automatic):**

- ✅ Supabase automatic backups
- ✅ Git commits (as you make changes)

**Weekly (Manual):**

- 📋 Export RSVP data to CSV
- 📋 Export guestbook to CSV
- 📋 Backup environment variables
- 📋 Verify automatic backups are working

**Monthly:**

- 📋 Full project backup
- 📋 Review and organize backups
- 📋 Test recovery procedure
- 📋 Update documentation

**Before Major Events:**

- 📋 Full backup before RSVP deadline
- 📋 Full backup one week before wedding
- 📋 Final backup day before wedding

**After Wedding:**

- 📋 Final complete backup
- 📋 Archive all data
- 📋 Create permanent records
- 📋 Store securely for memories

### Backup Checklist

**Weekly Backup Routine:**

```
[ ] Export rsvps table to CSV
[ ] Export guestbook_entries to CSV
[ ] Save with date: filename_YYYYMMDD.csv
[ ] Store in backup location
[ ] Verify files are readable
[ ] Update backup log
```

**Monthly Backup Routine:**

```
[ ] Complete weekly backup
[ ] Export environment variables
[ ] Create full project archive
[ ] Test restoration procedure
[ ] Verify all backups are accessible
[ ] Clean up old backups (keep last 3 months)
```

---

## 💿 Storage Recommendations

### Where to Store Backups

**Primary Storage (Choose 1-2):**

1. **Cloud Storage**
   - Google Drive (15GB free)
   - Dropbox (2GB free)
   - iCloud Drive
   - OneDrive

2. **Password Manager**
   - 1Password (secure notes)
   - LastPass (secure notes)
   - Bitwarden (secure notes)

3. **External Drive**
   - USB drive
   - External hard drive
   - NAS (Network Attached Storage)

**Backup Storage (Choose 1):**

- Second cloud provider
- Physical backup at different location
- Encrypted email to yourself

### Storage Best Practices

**✅ DO:**

- Use multiple storage locations (3-2-1 rule)
- Encrypt sensitive data
- Use descriptive filenames with dates
- Organize in folders by date/type
- Test backups regularly
- Keep backups for at least 1 year after wedding

**❌ DON'T:**

- Store only in one location
- Commit `.env` files to Git
- Share backup links publicly
- Store passwords in plain text
- Forget to verify backups work

### 3-2-1 Backup Rule

**3** copies of data:

- Original (production database)
- Local backup (CSV exports)
- Remote backup (cloud storage)

**2** different storage types:

- Cloud storage
- Physical drive

**1** offsite backup:

- Different physical location
- Different cloud provider

---

## 🆘 Emergency Contacts

### Service Providers

**Supabase Support:**

- Email: support@supabase.com
- Discord: [discord.supabase.com](https://discord.supabase.com)
- Status: [status.supabase.com](https://status.supabase.com)

**Vercel Support:**

- Email: support@vercel.com
- Status: [vercel-status.com](https://www.vercel-status.com)
- Docs: [vercel.com/docs](https://vercel.com/docs)

**Resend Support:**

- Email: support@resend.com
- Docs: [resend.com/docs](https://resend.com/docs)

### Emergency Procedures

**If database is corrupted:**

1. Don't panic
2. Check Supabase status page
3. Contact Supabase support immediately
4. Restore from most recent backup
5. Document what happened

**If site is down:**

1. Check Vercel status page
2. Review recent deployments
3. Rollback to last working deployment
4. Check error logs
5. Contact Vercel support if needed

**If data is lost:**

1. Check Supabase automatic backups
2. Restore from most recent backup
3. Import manual CSV backups if needed
4. Verify restored data
5. Document incident

---

## 📝 Backup Log Template

Keep a log of your backups:

```
# Backup Log

## 2026-01-15
- [x] Exported rsvps (45 entries)
- [x] Exported guestbook (12 entries)
- [x] Saved to Google Drive
- [x] Verified files open correctly

## 2026-01-22
- [x] Exported rsvps (67 entries)
- [x] Exported guestbook (18 entries)
- [x] Full project backup
- [x] Saved to Google Drive + USB drive

## 2026-02-01
- [x] Monthly full backup
- [x] Tested restoration procedure
- [x] All backups verified
- [x] Cleaned up old backups
```

---

## ✅ Pre-Wedding Backup Checklist

**One Week Before Wedding:**

```
[ ] Export final RSVP list
[ ] Export all guestbook entries
[ ] Backup environment variables
[ ] Full project backup
[ ] Store in 3 locations
[ ] Verify all backups work
[ ] Print important data
[ ] Document access credentials
```

**Day Before Wedding:**

```
[ ] Final RSVP export
[ ] Final guestbook export
[ ] Screenshot of visitor counter
[ ] Backup entire database
[ ] Store securely
[ ] Share backup location with trusted person
```

**After Wedding:**

```
[ ] Final complete backup
[ ] Export all photos (if added)
[ ] Create permanent archive
[ ] Store in long-term storage
[ ] Create printed keepsake
[ ] Thank you notes data export
```

---

## 🎯 Recovery Time Objectives

**Expected recovery times:**

- **Database restore:** 5-15 minutes
- **Code restore:** 10-30 minutes
- **Full site restore:** 30-60 minutes
- **Deployment rollback:** 2-5 minutes

**Plan for:**

- Regular backups reduce recovery time
- Test procedures before you need them
- Keep documentation updated
- Have emergency contacts ready

---

**Remember:** Backups are only useful if you can restore from them. Test your backup and recovery procedures regularly!

Made with 💾 for data safety and peace of mind

# 🔧 Maintenance Guide

This guide helps you maintain and update your wedding website without needing technical expertise.

---

## 📝 Content Updates

### Updating Text on Pages

All page content is stored in `.astro` files in the `src/pages/` directory.

#### Home Page (`src/pages/index.astro`)

To update the welcome message or couple information:

1. Open `src/pages/index.astro`
2. Find the section you want to edit (look for HTML-like tags)
3. Update the text between the tags
4. Save the file
5. The site will automatically rebuild

**Example:**

```astro
<h1>Welcome to Rachel & Tim's Wedding!</h1>
<!-- Change to: -->
<h1>Welcome to Our Big Day!</h1>
```

#### Schedule Page (`src/pages/schedule.astro`)

Update event times, venue details, or add/remove events:

1. Open `src/pages/schedule.astro`
2. Find the timeline section
3. Update times, descriptions, or add new events
4. Save the file

#### Travel Page (`src/pages/travel.astro`)

Update hotel information, transportation details, or NYC tips:

1. Open `src/pages/travel.astro`
2. Find the relevant section (hotels, subway, etc.)
3. Update the information
4. Save the file

### Changing Dates and Times

Search for the current date/time in the file and replace it:

```bash
# Example: Find all instances of the wedding date
# Search for: "October 9th, 2026"
# Replace with: "October 10th, 2026"
```

### Updating Venue Information

Venue details appear in multiple places:

1. **Schedule page:** `src/pages/schedule.astro`
2. **Home page:** `src/pages/index.astro`
3. **Footer:** `src/components/astro/Footer.astro`

Update each location to keep information consistent.

### Modifying Navigation

To add, remove, or rename navigation links:

1. Open `src/components/astro/Navigation.astro`
2. Find the `<nav>` section
3. Add/remove/edit links:

```astro
<a href="/new-page">New Page</a>
```

4. If adding a new page, create the corresponding file in `src/pages/`

---

## 📋 RSVP Management

### Viewing RSVPs

**Via Supabase Dashboard:**

1. Go to [supabase.com](https://supabase.com)
2. Log in to your account
3. Select your project
4. Click **"Table Editor"** in the left sidebar
5. Select the **"rsvps"** table
6. View all RSVP submissions

**Columns you'll see:**

- `id` - Unique identifier
- `created_at` - Submission timestamp
- `name` - Guest name(s)
- `email` - Contact email
- `attending` - Yes/No
- `guest_count` - Number of guests
- `meal_preference` - Dietary choices
- `dietary_restrictions` - Special requirements
- `song_request` - Song requests
- `message` - Special messages

### Exporting RSVP Data

**To CSV (for spreadsheets):**

1. In Supabase Table Editor, select **"rsvps"** table
2. Click the **"..."** menu (top right)
3. Select **"Export to CSV"**
4. Save the file to your computer
5. Open in Excel, Google Sheets, or Numbers

**To JSON (for developers):**

1. Same steps as above
2. Select **"Export to JSON"** instead

### Filtering RSVPs

**View only attending guests:**

1. In Table Editor, click **"Filters"**
2. Add filter: `attending` equals `true`
3. Click **"Apply"**

**View by meal preference:**

1. Click **"Filters"**
2. Add filter: `meal_preference` equals `vegetarian` (or other option)
3. Click **"Apply"**

### Sending Follow-up Emails

**Manual approach:**

1. Export RSVPs to CSV
2. Open in spreadsheet software
3. Copy email addresses
4. Use your email client to send bulk emails

**Automated approach (requires developer):**

See [CONTRIBUTING.md](./CONTRIBUTING.md) for adding email automation features.

### Handling Special Requests

Review the `dietary_restrictions` and `message` columns for:

- Allergies or dietary needs
- Accessibility requirements
- Special seating requests
- Questions from guests

Contact guests directly via their provided email addresses.

---

## 💬 Guestbook Moderation

### Viewing Guestbook Entries

**Via Supabase Dashboard:**

1. Log in to Supabase
2. Go to Table Editor
3. Select **"guestbook_entries"** table
4. View all messages

**Columns:**

- `id` - Unique identifier
- `created_at` - When message was posted
- `name` - Guest name
- `message` - Message content
- `email` - Guest email (optional)

### Deleting Inappropriate Entries

If you need to remove a message:

1. In the **"guestbook_entries"** table
2. Find the entry to delete
3. Click the **"..."** menu on the right of the row
4. Select **"Delete row"**
5. Confirm deletion

**Note:** Deletions are permanent and cannot be undone.

### Exporting Guestbook Data

Same process as RSVP export:

1. Select **"guestbook_entries"** table
2. Click **"..."** menu
3. Select **"Export to CSV"** or **"Export to JSON"**
4. Save for your records

### Guestbook Best Practices

- Check entries weekly leading up to the wedding
- Export entries monthly as backup
- Respond to questions posted in guestbook via email
- Consider printing favorite messages for a keepsake book

---

## 💾 Database Maintenance

### Backing Up Database

**Automatic Backups (Supabase):**

Supabase automatically backs up your database daily. To access:

1. Go to Supabase Dashboard
2. Click **"Database"** → **"Backups"**
3. View available backups
4. Download or restore as needed

**Manual Backup:**

1. Export all tables to CSV (RSVPs, guestbook, counter)
2. Save files with date: `rsvps_2026-01-15.csv`
3. Store in a safe location (Google Drive, Dropbox, etc.)

### Restoring from Backup

**Via Supabase:**

1. Go to **"Database"** → **"Backups"**
2. Select backup date
3. Click **"Restore"**
4. Confirm restoration

**From CSV:**

1. Go to Table Editor
2. Select table to restore
3. Click **"..."** menu → **"Import data"**
4. Upload CSV file
5. Map columns correctly
6. Click **"Import"**

### Clearing Test Data

Before the wedding, you may want to clear test RSVPs:

1. Go to **"rsvps"** table
2. Add filter: `email` contains `test` (or your test email)
3. Select all test entries
4. Click **"Delete selected rows"**
5. Confirm deletion

**Or delete all RSVPs:**

1. Go to SQL Editor in Supabase
2. Run: `DELETE FROM rsvps;`
3. Confirm (⚠️ This deletes ALL RSVPs!)

### Monitoring Database Usage

**Check storage usage:**

1. Go to Supabase Dashboard
2. Click **"Settings"** → **"Usage"**
3. View database size, API requests, bandwidth

**Free tier limits:**

- 500 MB database storage
- 2 GB bandwidth per month
- 50,000 monthly active users

If approaching limits, consider upgrading to Pro plan ($25/month).

---

## 📧 Email Management

### Updating Email Templates

Email templates are in `src/pages/api/rsvp.ts`:

1. Open the file
2. Find the `html` section in the email configuration
3. Update the HTML content
4. Save the file
5. Redeploy the site

**Example email sections:**

- Confirmation message
- Event details
- Contact information
- Footer text

### Changing Sender Email

The sender email is configured in Resend:

1. Go to [resend.com](https://resend.com)
2. Log in to your account
3. Go to **"Domains"**
4. Verify your domain or use Resend's default
5. Update `ADMIN_EMAIL` in environment variables

### Monitoring Email Delivery

**Via Resend Dashboard:**

1. Log in to Resend
2. Go to **"Emails"**
3. View sent emails, delivery status, and opens
4. Check for bounces or failures

**Common issues:**

- **Bounced:** Email address invalid
- **Spam:** Email went to spam folder
- **Failed:** Temporary delivery issue

### Handling Email Bounces

If an email bounces:

1. Check the email address in the RSVP
2. Contact the guest via phone or social media
3. Update their email in the database
4. Resend confirmation manually if needed

### Email Best Practices

- Test emails before the wedding
- Keep templates simple and clear
- Include contact information
- Monitor delivery rates
- Respond to guest questions promptly

---

## 🖼️ Asset Management

### Replacing Placeholder GIFs

GIF files are in `public/images/`:

1. Find the GIF you want to replace
2. Create a new GIF with the same filename
3. Replace the old file
4. The site will automatically use the new image

**Current GIFs:**

- `bells.gif` - Wedding bells
- `rings.gif` - Wedding rings
- `hearts.gif` - Hearts animation
- `champagne.gif` - Champagne toast
- `dancing.gif` - Dancing figures
- `confetti.gif` - Confetti animation
- `statue-of-liberty.gif` - NYC landmark
- `taxi.gif` - NYC taxi
- `subway.gif` - NYC subway

### Adding New Images

1. Save image to `public/images/`
2. Use descriptive filename: `couple-photo.jpg`
3. Reference in page: `<img src="/images/couple-photo.jpg" alt="Description">`

### Optimizing Images

Large images slow down your site. Optimize before uploading:

**Online tools:**

- [TinyPNG](https://tinypng.com) - Compress PNG/JPG
- [Squoosh](https://squoosh.app) - Advanced compression
- [EZGIF](https://ezgif.com) - Optimize GIFs

**Recommended sizes:**

- Photos: Max 1200px wide, under 500KB
- GIFs: Max 500px wide, under 200KB
- Backgrounds: Max 1920px wide, under 300KB

### Updating Favicon

The favicon is `public/favicon.svg`:

1. Create new favicon (16x16 or 32x32 pixels)
2. Save as `favicon.svg` or `favicon.ico`
3. Replace file in `public/`
4. Clear browser cache to see changes

### Managing Background Images

Background images are in `public/images/`:

- `stars-bg.png` - Starry background
- `hearts-bg.png` - Hearts pattern
- `confetti-bg.png` - Confetti pattern

To change backgrounds:

1. Create new pattern image
2. Save with same filename
3. Replace in `public/images/`
4. Or update CSS in `src/styles/geocities.css`

---

## 📊 Performance Monitoring

### Checking Site Performance

**Via Vercel Dashboard:**

1. Go to [vercel.com](https://vercel.com)
2. Log in and select your project
3. Click **"Analytics"**
4. View page load times, visitor stats

**Using Google PageSpeed Insights:**

1. Go to [pagespeed.web.dev](https://pagespeed.web.dev)
2. Enter your site URL
3. Click **"Analyze"**
4. Review performance score and suggestions

### Monitoring Errors

**Via Vercel:**

1. Go to project dashboard
2. Click **"Functions"**
3. View function logs for errors
4. Check **"Deployments"** for build errors

**Common errors:**

- 500: Server error (check API routes)
- 404: Page not found (check URLs)
- Database connection: Check Supabase status

### Viewing Analytics

**Visitor stats (via hit counter):**

1. Go to Supabase Table Editor
2. Select **"visitor_counter"** table
3. View total count

**Detailed analytics (optional):**

Consider adding:

- Google Analytics
- Vercel Analytics (paid)
- Plausible Analytics (privacy-friendly)

See [CONTRIBUTING.md](./CONTRIBUTING.md) for implementation.

### Optimizing Performance

**If site is slow:**

1. **Optimize images** - Compress large files
2. **Reduce GIFs** - Fewer animated GIFs
3. **Check database** - Ensure queries are efficient
4. **Review logs** - Look for errors in Vercel

**Quick wins:**

- Use WebP format for photos
- Lazy load images below the fold
- Minimize custom fonts
- Enable caching headers

---

## 🔄 Regular Maintenance Tasks

### Weekly (Leading Up to Wedding)

- [ ] Check new RSVPs
- [ ] Review guestbook entries
- [ ] Respond to guest questions
- [ ] Monitor email delivery
- [ ] Check site performance

### Monthly

- [ ] Export RSVP data backup
- [ ] Export guestbook backup
- [ ] Review database usage
- [ ] Check for broken links
- [ ] Update content if needed

### Before Wedding

- [ ] Final RSVP count
- [ ] Export all data
- [ ] Print guestbook messages
- [ ] Backup entire database
- [ ] Test all features one last time

### After Wedding

- [ ] Thank you message on home page
- [ ] Share wedding photos
- [ ] Keep guestbook open for messages
- [ ] Archive RSVP data
- [ ] Consider keeping site live as memory

---

## 🆘 Emergency Procedures

### Site is Down

1. Check Vercel status: [vercel-status.com](https://www.vercel-status.com)
2. Check Supabase status: [status.supabase.com](https://status.supabase.com)
3. Review recent deployments in Vercel
4. Rollback to previous deployment if needed

**To rollback:**

1. Go to Vercel Dashboard
2. Click **"Deployments"**
3. Find last working deployment
4. Click **"..."** → **"Promote to Production"**

### Database Connection Lost

1. Check Supabase project status
2. Verify environment variables in Vercel
3. Check API key hasn't expired
4. Restart Supabase project if needed

### Emails Not Sending

1. Check Resend dashboard for errors
2. Verify API key in environment variables
3. Check sender email is verified
4. Review email logs in Resend

### Data Loss

1. Check Supabase automatic backups
2. Restore from most recent backup
3. Import manual CSV backups if needed
4. Contact Supabase support if critical

---

## 📞 Getting Help

### Documentation Resources

- **This guide:** General maintenance
- **[README.md](./README.md):** Quick start and overview
- **[FAQ.md](./FAQ.md):** Common questions
- **[CONTRIBUTING.md](./CONTRIBUTING.md):** Technical development
- **[BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md):** Detailed backup procedures

### External Resources

- **Astro Docs:** [docs.astro.build](https://docs.astro.build)
- **Supabase Docs:** [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Resend Docs:** [resend.com/docs](https://resend.com/docs)

### Support Channels

- **Supabase:** support@supabase.com or Discord
- **Vercel:** support@vercel.com or GitHub discussions
- **Resend:** support@resend.com

### When to Contact a Developer

Contact a developer if you need to:

- Add new features or pages
- Modify database schema
- Change API functionality
- Debug complex errors
- Implement custom integrations

---

## ✅ Maintenance Checklist

### Pre-Launch

- [ ] Test all forms (RSVP, guestbook)
- [ ] Verify email notifications work
- [ ] Check all links
- [ ] Test on mobile devices
- [ ] Review all content for accuracy
- [ ] Set up monitoring and alerts

### Weekly Maintenance

- [ ] Check RSVPs and respond to questions
- [ ] Moderate guestbook if needed
- [ ] Monitor email delivery
- [ ] Review site performance
- [ ] Backup data

### Post-Wedding

- [ ] Export final RSVP list
- [ ] Save all guestbook messages
- [ ] Update site with thank you message
- [ ] Archive database
- [ ] Decide on long-term hosting

---

**Remember:** Most maintenance tasks are simple and don't require technical knowledge. When in doubt, refer to this guide or reach out for help!

Made with 💕 for easy maintenance

# ❓ Frequently Asked Questions (FAQ)

Common questions and answers about Rachel & Tim's Wedding Website.

---

## 📋 Table of Contents

- [General Questions](#general-questions)
- [Technical Questions](#technical-questions)
- [Feature Questions](#feature-questions)
- [Troubleshooting](#troubleshooting)
- [Cost & Hosting](#cost--hosting)
- [Customization](#customization)
- [Security & Privacy](#security--privacy)

---

## 🎉 General Questions

### What is this website built with?

This is a modern static website built with:

- **Astro** - Fast static site framework
- **React** - Interactive components
- **TypeScript** - Type-safe code
- **Supabase** - Database and backend
- **Vercel** - Hosting and deployment
- **Resend** - Email notifications

### Why a Geocities-style website?

Because nostalgia is fun! The 90s internet aesthetic brings joy and personality to the wedding website. It's memorable, unique, and perfectly captures the fun spirit of the celebration.

### Do I need coding knowledge to maintain it?

**For basic maintenance:** No! You can:

- Update text content by editing files
- View RSVPs in Supabase dashboard
- Manage guestbook entries
- Export data to CSV

**For advanced changes:** Yes, some coding knowledge helps for:

- Adding new features
- Modifying design
- Changing functionality
- Debugging issues

See [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) for non-technical tasks.

### How much does it cost to run?

**Free tier (sufficient for most weddings):**

- Vercel: Free
- Supabase: Free (up to 500MB database)
- Resend: Free (100 emails/day)
- Domain: $10-15/year (optional)

**Total: $0-15/year**

**Paid tier (if needed):**

- Vercel Pro: $20/month
- Supabase Pro: $25/month
- Resend Pro: $20/month
- Domain: $10-15/year

**Total: $65-80/month** (only if you exceed free limits)

### Can I use this for my own wedding?

Yes! This project is open source under the Apache 2.0 license. You can:

- ✅ Use it for your wedding
- ✅ Modify it as needed
- ✅ Share it with others
- ✅ Learn from the code

Just update the content with your own details!

### How long does it take to set up?

**Initial setup:** 2-4 hours

- Install dependencies: 10 minutes
- Set up Supabase: 30 minutes
- Configure Resend: 15 minutes
- Deploy to Vercel: 15 minutes
- Customize content: 1-2 hours

**Ongoing maintenance:** 15-30 minutes/week

- Check RSVPs
- Moderate guestbook
- Update content as needed

---

## 🔧 Technical Questions

### Why Astro instead of Next.js or Gatsby?

**Astro advantages:**

- ⚡ Faster - Ships zero JavaScript by default
- 🎯 Simpler - Less complex than Next.js
- 🔧 Flexible - Use React, Vue, or plain HTML
- 📦 Smaller - Smaller bundle sizes
- 🚀 Better performance - Perfect for static sites

For a wedding website, speed and simplicity matter more than complex features.

### Why Supabase instead of Firebase?

**Supabase advantages:**

- 🗄️ PostgreSQL - More powerful than Firestore
- 🔓 Open source - Not locked into Google
- 💰 Better pricing - More generous free tier
- 🛠️ SQL access - Direct database queries
- 🔒 Row Level Security - Built-in security

Both are great, but Supabase fits this project better.

### Why Vercel instead of Netlify?

**Both are excellent!** Vercel was chosen because:

- 🚀 Optimized for Astro
- ⚡ Edge functions
- 📊 Built-in analytics
- 🔄 Automatic deployments
- 💚 Great developer experience

You can easily deploy to Netlify instead if preferred.

### Can I use different services?

**Yes!** You can swap:

**Database alternatives:**

- Firebase
- MongoDB Atlas
- PlanetScale
- Railway

**Hosting alternatives:**

- Netlify
- Cloudflare Pages
- GitHub Pages (static only)
- AWS Amplify

**Email alternatives:**

- SendGrid
- Mailgun
- AWS SES
- Postmark

See [CONTRIBUTING.md](./CONTRIBUTING.md) for implementation details.

### Is TypeScript required?

**No, but recommended.** TypeScript provides:

- Type safety
- Better IDE support
- Fewer runtime errors
- Better documentation

You can convert to JavaScript by:

1. Rename `.ts` files to `.js`
2. Rename `.tsx` files to `.jsx`
3. Remove type annotations
4. Update `tsconfig.json`

### What Node.js version do I need?

**Node.js 18.x or higher** is required.

Check your version:

```bash
node --version
```

Update if needed:

- **macOS/Linux:** Use [nvm](https://github.com/nvm-sh/nvm)
- **Windows:** Download from [nodejs.org](https://nodejs.org)

---

## ✨ Feature Questions

### How does the RSVP form work?

**Flow:**

1. Guest fills out form
2. Data validated on client-side
3. Submitted to API endpoint (`/api/rsvp`)
4. Saved to Supabase database
5. Confirmation email sent via Resend
6. Admin notification email sent
7. Success message shown to guest

**Data collected:**

- Name(s)
- Email
- Attending (yes/no)
- Number of guests
- Meal preferences
- Dietary restrictions
- Song requests
- Special messages

### Can guests edit their RSVP?

**Not currently.** Guests would need to:

1. Submit a new RSVP, or
2. Contact you directly to update

**To add edit functionality:**

- Requires authentication system
- Needs unique RSVP links
- More complex implementation

See [CONTRIBUTING.md](./CONTRIBUTING.md) for adding this feature.

### How do I moderate the guestbook?

**View entries:**

1. Log into Supabase
2. Go to Table Editor
3. Select `guestbook_entries` table

**Delete inappropriate entries:**

1. Find the entry
2. Click "..." menu
3. Select "Delete row"
4. Confirm deletion

See [MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md) for details.

### Can I add more pages?

**Yes!** To add a new page:

1. Create file in `src/pages/`:

   ```astro
   ---
   import BaseLayout from '../components/astro/BaseLayout.astro';
   ---

   <BaseLayout title="New Page">
     <h1>New Page Content</h1>
   </BaseLayout>
   ```

2. Add navigation link in `Navigation.astro`:

   ```astro
   <a href="/new-page">New Page</a>
   ```

3. Deploy changes

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed instructions.

### Can I disable the visitor counter?

**Yes!** To hide the counter:

1. Open `src/pages/index.astro`
2. Find the `<HitCounter>` component
3. Comment it out or delete it:
   ```astro
   {/* <HitCounter client:load /> */}
   ```

The counter will still track visits in the database, just won't display.

### Can I add a photo gallery?

**Yes!** You can:

1. **Simple approach:** Add images to a page
2. **Advanced approach:** Create a photo gallery component

See [CONTRIBUTING.md](./CONTRIBUTING.md) for implementation examples.

### How do I change the background music?

**Replace MIDI file:**

1. Find a MIDI file you like
2. Save it to `public/audio/`
3. Update the reference in your page
4. Redeploy

**Or disable music:**

1. Find the audio player component
2. Comment it out or remove it

### Can guests upload photos?

**Not currently.** This would require:

- File upload functionality
- Image storage (Supabase Storage)
- Moderation system
- More complex implementation

Consider using:

- Google Photos shared album
- Instagram hashtag
- Dedicated photo sharing service

---

## 🐛 Troubleshooting

### Site is slow to load

**Common causes:**

1. **Large images**
   - Compress images before uploading
   - Use WebP format
   - Optimize GIFs

2. **Too many GIFs**
   - Reduce number of animated GIFs
   - Use smaller GIF files
   - Consider static images instead

3. **Database queries**
   - Check Supabase performance
   - Optimize queries
   - Add indexes if needed

**Solutions:**

- Run `npm run build` and check bundle size
- Use [PageSpeed Insights](https://pagespeed.web.dev)
- Optimize assets with [TinyPNG](https://tinypng.com)

### Emails aren't sending

**Check:**

1. **Resend API key**
   - Verify key is correct in `.env`
   - Check key hasn't expired
   - Verify key has send permissions

2. **Sender email**
   - Must be verified in Resend
   - Check domain verification
   - Try default Resend email first

3. **Email logs**
   - Check Resend dashboard
   - Look for error messages
   - Check spam folder

4. **Rate limits**
   - Free tier: 100 emails/day
   - Check if limit exceeded

**Solutions:**

- Test with Resend's test mode
- Verify sender email in Resend
- Check environment variables in Vercel

### Database connection failed

**Check:**

1. **Supabase project status**
   - Visit [status.supabase.com](https://status.supabase.com)
   - Check if project is paused (free tier)
   - Verify project is active

2. **Environment variables**
   - Check `PUBLIC_SUPABASE_URL` is correct
   - Check `PUBLIC_SUPABASE_ANON_KEY` is correct
   - Verify variables in Vercel match local

3. **Network issues**
   - Try accessing Supabase dashboard
   - Check internet connection
   - Try different network

**Solutions:**

- Restart Supabase project if paused
- Update environment variables
- Check RLS policies aren't blocking access

### Build is failing

**Common errors:**

1. **TypeScript errors**

   ```bash
   npm run astro check
   ```

   Fix type errors shown

2. **Missing dependencies**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Environment variables**
   - Ensure all required variables are set
   - Check for typos in variable names

4. **Syntax errors**
   - Check recent changes
   - Look for missing brackets/semicolons
   - Review error messages

**Solutions:**

- Read error messages carefully
- Check recent commits
- Rollback to last working version
- Ask for help with error message

### Forms not submitting

**Check:**

1. **Browser console**
   - Open DevTools (F12)
   - Look for JavaScript errors
   - Check network tab for failed requests

2. **API endpoint**
   - Verify endpoint exists
   - Check for server errors
   - Test endpoint directly

3. **Validation**
   - Check form validation rules
   - Verify required fields
   - Test with valid data

**Solutions:**

- Check browser console for errors
- Test API endpoint with curl
- Verify database connection
- Check RLS policies

### Mobile site looks broken

**Check:**

1. **Viewport meta tag**
   - Should be in `<head>`
   - Verify it's present

2. **CSS media queries**
   - Check responsive styles
   - Test at different breakpoints

3. **Image sizes**
   - Large images may overflow
   - Use max-width: 100%

**Solutions:**

- Test on actual mobile device
- Use browser DevTools mobile emulation
- Check CSS for mobile styles
- Optimize images for mobile

---

## 💰 Cost & Hosting

### What are the free tier limits?

**Vercel (Free):**

- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- Custom domains

**Supabase (Free):**

- 500 MB database storage
- 2 GB bandwidth/month
- 50,000 monthly active users
- 7-day database backups

**Resend (Free):**

- 100 emails/day
- 3,000 emails/month
- 1 domain
- Email API access

**Typical wedding website usage:**

- ~50-200 RSVPs
- ~20-100 guestbook entries
- ~500-2000 visitors
- ~50-200 emails

**Verdict:** Free tier is sufficient for most weddings!

### When would I need to upgrade?

**Upgrade if:**

- More than 500 MB of data (photos, etc.)
- More than 2 GB bandwidth/month
- More than 100 emails/day
- Need longer backup retention
- Want advanced features

**Most weddings won't need to upgrade.**

### Can I use a custom domain?

**Yes!** Both Vercel and Netlify support custom domains.

**Steps:**

1. Buy domain (Namecheap, Google Domains, etc.)
2. Add domain in Vercel dashboard
3. Update DNS records
4. Wait for DNS propagation (up to 48 hours)
5. Automatic HTTPS enabled

**Cost:** $10-15/year for domain

### What happens after the wedding?

**Options:**

1. **Keep it running** (free)
   - Update with thank you message
   - Share wedding photos
   - Keep as memory

2. **Archive it**
   - Export all data
   - Download static site
   - Store locally

3. **Take it down**
   - Delete Vercel deployment
   - Pause Supabase project
   - Keep backups

**Recommendation:** Keep it running! It's free and makes a great memory.

---

## 🎨 Customization

### Can I change the color scheme?

**Yes!** Edit `src/styles/geocities.css`:

```css
:root {
  --primary-color: #ff00ff; /* Change this */
  --secondary-color: #00ffff; /* And this */
  --background-color: #000080; /* And this */
}
```

### Can I remove the Geocities style?

**Yes!** You can:

1. **Tone it down:**
   - Remove some GIFs
   - Simplify animations
   - Use more subtle colors

2. **Complete redesign:**
   - Replace `geocities.css`
   - Update components
   - Change layout

See [CONTRIBUTING.md](./CONTRIBUTING.md) for styling guidelines.

### Can I add my own photos?

**Yes!**

1. Save photos to `public/images/`
2. Reference in pages:
   ```astro
   <img src="/images/couple-photo.jpg" alt="Rachel and Tim">
   ```
3. Optimize images first (compress, resize)

### Can I change the fonts?

**Yes!** Edit `src/styles/global.css`:

```css
body {
  font-family: "Your Font", sans-serif;
}
```

**Using Google Fonts:**

1. Add to `<head>` in `BaseLayout.astro`:

   ```html
   <link
     href="https://fonts.googleapis.com/css2?family=Your+Font"
     rel="stylesheet"
   />
   ```

2. Update CSS as above

---

## 🔒 Security & Privacy

### Is guest data secure?

**Yes!** Security measures:

- ✅ HTTPS encryption
- ✅ Supabase Row Level Security (RLS)
- ✅ Environment variables for secrets
- ✅ No passwords stored
- ✅ Email validation
- ✅ Input sanitization

### Who can see RSVP data?

**Only you!** RSVP data is:

- Stored in your Supabase database
- Only accessible with your credentials
- Protected by RLS policies
- Not publicly visible

### Can I delete guest data?

**Yes!** You can:

1. Delete individual entries in Supabase
2. Delete entire tables
3. Delete entire project

**GDPR compliance:**

- Guests can request data deletion
- You can export their data
- You can delete their records

### Are emails private?

**Yes!** Emails are:

- Sent via Resend (secure)
- Not stored in logs
- Only visible to sender/recipient
- Encrypted in transit

---

## 📞 Getting More Help

### Where can I find more documentation?

- **[README.md](./README.md)** - Quick start guide
- **[MAINTENANCE_GUIDE.md](./MAINTENANCE_GUIDE.md)** - Maintenance tasks
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Development guide
- **[BACKUP_STRATEGY.md](./BACKUP_STRATEGY.md)** - Backup procedures
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Deployment instructions

### Where can I get technical support?

**Official documentation:**

- Astro: [docs.astro.build](https://docs.astro.build)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Resend: [resend.com/docs](https://resend.com/docs)

**Community support:**

- Astro Discord
- Supabase Discord
- Stack Overflow
- GitHub Issues

### Can I hire someone to help?

**Yes!** You can hire:

- Freelance developers (Upwork, Fiverr)
- Web development agencies
- Astro/React specialists

**Typical costs:**

- Small changes: $50-200
- New features: $200-1000
- Complete customization: $1000-5000

---

## 🎯 Quick Answers

**Q: Is this free?**  
A: Yes, using free tiers of all services.

**Q: Do I need coding skills?**  
A: Not for basic maintenance, yes for customization.

**Q: Can I use this for my wedding?**  
A: Yes! It's open source.

**Q: How long to set up?**  
A: 2-4 hours for initial setup.

**Q: Can guests edit RSVPs?**  
A: Not currently, but can be added.

**Q: Is data secure?**  
A: Yes, with HTTPS and RLS policies.

**Q: Can I customize it?**  
A: Yes, fully customizable.

**Q: What if something breaks?**  
A: Check troubleshooting section or rollback deployment.

---

**Still have questions?** Check the other documentation files or reach out for help!

Made with 💕 and helpful answers

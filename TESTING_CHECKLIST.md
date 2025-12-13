# Testing Checklist - Rachel & Tim's Wedding Website

**Use this checklist to manually test all features of the website.**

---

## ✅ Part 1: Functionality Testing

### Visitor Counter (`/`)

- [ ] Counter displays on homepage
- [ ] Counter shows 6-digit format (e.g., 000123)
- [ ] Counter increments on first visit
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Verify `visitor_counted` is set to "true" after first visit
- [ ] Refresh page - counter should NOT increment again
- [ ] Clear localStorage and refresh - counter should increment
- [ ] Test loading state (shows dashes)
- [ ] Test error state (disconnect internet, should show "?")

### RSVP Form (`/rsvp`)

- [ ] All form fields render correctly
- [ ] **Name field:**
  - [ ] Shows error if empty
  - [ ] Shows error if less than 2 characters
  - [ ] Accepts valid name
- [ ] **Email field:**
  - [ ] Shows error if empty
  - [ ] Shows error for invalid email (test: "notanemail")
  - [ ] Accepts valid email
- [ ] **Attending radio buttons:**
  - [ ] Shows error if neither selected
  - [ ] Can select "Yes"
  - [ ] Can select "No"
- [ ] **Plus-one checkbox:**
  - [ ] Only shows when "Yes" is selected
  - [ ] Checking it shows plus-one name field
  - [ ] Plus-one name field is required when checked
  - [ ] Unchecking clears plus-one name
- [ ] **Dietary restrictions textarea:**
  - [ ] Only shows when "Yes" is selected
  - [ ] Optional field
  - [ ] Accepts text input
- [ ] **Song requests textarea:**
  - [ ] Only shows when "Yes" is selected
  - [ ] Optional field
  - [ ] Accepts text input
- [ ] **Message textarea:**
  - [ ] Always visible
  - [ ] Optional field
  - [ ] Accepts text input
- [ ] **Form submission:**
  - [ ] Submit with empty required fields shows errors
  - [ ] Submit with valid data shows success message
  - [ ] Success message scrolls into view
  - [ ] Form disappears after successful submission
  - [ ] Try submitting same email twice - should show duplicate error
  - [ ] Check browser console for errors

### Guestbook (`/guestbook`)

- [ ] Guestbook form renders
- [ ] **Name field:**
  - [ ] Shows error if empty
  - [ ] Shows error if less than 2 characters
  - [ ] Max length 100 characters
- [ ] **Location field:**
  - [ ] Optional
  - [ ] Max length 100 characters
- [ ] **Message field:**
  - [ ] Shows error if empty
  - [ ] Shows error if less than 5 characters
  - [ ] Shows error if more than 500 characters
  - [ ] Character counter shows "0 / 500"
  - [ ] Character counter updates as you type
  - [ ] Max length enforced at 500
- [ ] **Form submission:**
  - [ ] Submit with valid data shows success message
  - [ ] Success message disappears after 3 seconds
  - [ ] New entry appears in list (if approved immediately)
- [ ] **Entries display:**
  - [ ] Entries show in grid layout
  - [ ] Each entry shows name, message, date
  - [ ] Location shows if provided
  - [ ] Emoji rotates for each entry
  - [ ] Empty state shows if no entries
  - [ ] "Load More" button shows if more entries exist
  - [ ] "Load More" button loads next page
  - [ ] Loading state shows while fetching

### Navigation

- [ ] **Desktop navigation:**
  - [ ] All 5 nav links visible (Home, Schedule, Travel, RSVP, Guestbook)
  - [ ] Click each link - navigates correctly
  - [ ] Active page is highlighted
  - [ ] Hover effects work
- [ ] **Mobile navigation (resize to <768px):**
  - [ ] Hamburger menu button appears
  - [ ] Nav links hidden by default
  - [ ] Click hamburger - menu slides in from right
  - [ ] Click link - navigates and closes menu
  - [ ] Click outside menu - closes menu
  - [ ] Press Escape key - closes menu
  - [ ] Body scroll disabled when menu open

### General Features

- [ ] All external links open in new tab
- [ ] Google Maps embed loads on `/schedule`
- [ ] All buttons respond to clicks
- [ ] All GIFs animate
- [ ] Marquee text scrolls
- [ ] Blinking text blinks
- [ ] Rainbow dividers display
- [ ] No console errors on any page

---

## 🌐 Part 2: Cross-Browser Testing

Test all pages in each browser:

### Chrome/Chromium

- [ ] Version: ******\_******
- [ ] Home page loads correctly
- [ ] RSVP form works
- [ ] Guestbook works
- [ ] Navigation works
- [ ] All styles render correctly
- [ ] No console errors

### Firefox

- [ ] Version: ******\_******
- [ ] Home page loads correctly
- [ ] RSVP form works
- [ ] Guestbook works
- [ ] Navigation works
- [ ] All styles render correctly
- [ ] No console errors

### Safari

- [ ] Version: ******\_******
- [ ] Home page loads correctly
- [ ] RSVP form works
- [ ] Guestbook works
- [ ] Navigation works
- [ ] All styles render correctly
- [ ] No console errors
- [ ] Check for WebKit-specific issues

### Edge

- [ ] Version: ******\_******
- [ ] Home page loads correctly
- [ ] RSVP form works
- [ ] Guestbook works
- [ ] Navigation works
- [ ] All styles render correctly
- [ ] No console errors

---

## 📱 Part 3: Responsive Testing

### Mobile Portrait (320px - 480px)

Test at 375px width:

- [ ] Home page layout works
- [ ] Text is readable
- [ ] Buttons are tappable (min 44x44px)
- [ ] Forms are usable
- [ ] Navigation hamburger works
- [ ] No horizontal scroll
- [ ] Images scale properly
- [ ] GIFs don't overflow

### Mobile Landscape (480px - 768px)

Test at 667px width:

- [ ] Home page layout works
- [ ] Navigation still uses hamburger
- [ ] Forms are usable
- [ ] Content flows properly

### Tablet (768px - 1024px)

Test at 768px width:

- [ ] Desktop navigation appears
- [ ] Grid layouts adjust
- [ ] Content is readable
- [ ] Forms are usable

### Desktop (1024px+)

Test at 1440px width:

- [ ] Full layout displays
- [ ] Max-width constraints work
- [ ] Content is centered
- [ ] No excessive whitespace

---

## ⚡ Part 4: Performance Testing

### Lighthouse Audit

Run in Chrome DevTools (Incognito mode):

- [ ] Performance score: **\_** / 100
- [ ] Accessibility score: **\_** / 100
- [ ] Best Practices score: **\_** / 100
- [ ] SEO score: **\_** / 100
- [ ] Note any critical issues: ********\_********

### Page Load Times

Use Network tab (Slow 3G throttling):

- [ ] Home page: **\_** seconds
- [ ] RSVP page: **\_** seconds
- [ ] Schedule page: **\_** seconds
- [ ] Travel page: **\_** seconds
- [ ] Guestbook page: **\_** seconds

### Optimization Checks

- [ ] Images are optimized
- [ ] No unnecessarily large assets
- [ ] Loading states work properly
- [ ] Site is usable on slow connections

---

## 🔒 Part 5: Security Testing

### Input Validation

- [ ] Try entering `<script>alert('XSS')</script>` in name field - should be sanitized
- [ ] Try entering `<img src=x onerror=alert('XSS')>` in message - should be sanitized
- [ ] Try entering SQL injection strings - should be handled safely
- [ ] Try entering very long strings - should be limited
- [ ] Special characters are properly escaped

### Rate Limiting

- [ ] **Counter API:** Try refreshing 15 times quickly - should get rate limited
- [ ] **RSVP API:** Try submitting 5 times quickly - should get rate limited
- [ ] **Guestbook API:** Try submitting 10 times quickly - should get rate limited
- [ ] Rate limit error messages display correctly

### Environment Security

- [ ] `.env` file is in `.gitignore`
- [ ] No API keys visible in browser source
- [ ] No secrets in console logs
- [ ] API endpoints return appropriate errors

---

## ♿ Part 6: Accessibility Testing

### Keyboard Navigation

- [ ] Press Tab - focus moves logically through page
- [ ] All interactive elements are reachable
- [ ] Focus indicators are visible
- [ ] Press Enter on buttons - activates them
- [ ] Press Space on checkboxes - toggles them
- [ ] Press Escape in mobile menu - closes it
- [ ] Skip links work (if present)

### Screen Reader Testing

Use VoiceOver (Mac) or NVDA (Windows):

- [ ] Page title is announced
- [ ] Headings are announced in order
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced
- [ ] Button purposes are clear
- [ ] Images have alt text
- [ ] Links have descriptive text

### Color Contrast

Use browser DevTools or WebAIM Contrast Checker:

- [ ] Body text has sufficient contrast
- [ ] Headings have sufficient contrast
- [ ] Links are distinguishable
- [ ] Buttons have sufficient contrast
- [ ] Form labels are readable
- [ ] Note: Some Geocities colors may not meet WCAG AA - document these

### ARIA and Semantics

- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Semantic HTML used (nav, main, section, etc.)
- [ ] ARIA labels present where needed
- [ ] Form inputs have associated labels
- [ ] Required fields marked with aria-required

---

## 📝 Part 7: Content Review

### Proofreading

- [ ] Check all text for typos
- [ ] Verify grammar and punctuation
- [ ] Check consistent tone throughout
- [ ] Verify all dates are correct:
  - [ ] Wedding date: October 9, 2026
  - [ ] RSVP deadline: April 9, 2026
  - [ ] Ceremony time: 6:00 PM
- [ ] Verify venue information:
  - [ ] Name: Radio Star
  - [ ] Address: 13 Greenpoint Ave, Brooklyn, NY 11222

### Link Verification

- [ ] Home (`/`) - works
- [ ] Schedule (`/schedule`) - works
- [ ] Travel (`/travel`) - works
- [ ] RSVP (`/rsvp`) - works
- [ ] Guestbook (`/guestbook`) - works
- [ ] Email link (`mailto:hello@rachelandtim.fun`) - opens email client
- [ ] External hotel links - open in new tab
- [ ] Google Maps links - open correctly

### Image Alt Text

- [ ] All decorative GIFs have alt text or empty alt
- [ ] All meaningful images have descriptive alt text
- [ ] Alt text is concise and descriptive

### Meta Tags

Check in browser DevTools → Elements → `<head>`:

- [ ] Each page has unique `<title>`
- [ ] Each page has meta description
- [ ] Open Graph tags present (og:title, og:description, og:image)
- [ ] Twitter card tags present
- [ ] Favicon loads

---

## 🐛 Part 8: Bug Tracking

### Critical Bugs Found

1. ~~Date inconsistency (June 14, 2025 vs October 9, 2026)~~ - **FIXED**
2. ***
3. ***

### High Priority Issues

1. ***
2. ***

### Medium Priority Issues

1. ***
2. ***

### Low Priority Issues

1. ***
2. ***

---

## ✨ Final Checks

- [ ] All critical bugs fixed
- [ ] All high priority issues addressed
- [ ] Testing report updated
- [ ] Documentation updated
- [ ] Ready for deployment

---

**Tester:** ********\_********  
**Date:** ********\_********  
**Browser:** ********\_********  
**OS:** ********\_********  
**Screen Size:** ********\_********

**Notes:**

---

---

---

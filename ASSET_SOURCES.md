# Asset Sources & Documentation

This document tracks all assets used in the Rachel & Tim wedding website, including their sources, licenses, and replacement instructions.

## Table of Contents

- [Image Assets](#image-assets)
- [Audio Assets](#audio-assets)
- [Fonts](#fonts)
- [Icons & Favicons](#icons--favicons)
- [Social Media Images](#social-media-images)
- [Licensing](#licensing)
- [Replacement Guide](#replacement-guide)

---

## Image Assets

### Wedding-Themed GIFs

All wedding-themed images are currently **SVG placeholders** created specifically for this project.

| File            | Type | Source         | License       | Notes                                |
| --------------- | ---- | -------------- | ------------- | ------------------------------------ |
| `rings.gif`     | SVG  | Custom created | Public Domain | Animated wedding rings with sparkles |
| `bells.gif`     | SVG  | Custom created | Public Domain | Swinging wedding bells               |
| `champagne.gif` | SVG  | Custom created | Public Domain | Clinking champagne glasses           |
| `dancing.gif`   | SVG  | Custom created | Public Domain | Dancing couple silhouette            |
| `hearts.gif`    | SVG  | Custom created | Public Domain | Floating hearts animation            |
| `confetti.gif`  | SVG  | Custom created | Public Domain | Falling confetti pieces              |

**Replacement Recommendations:**

- Search [GifCities](https://gifcities.org) for authentic 90s wedding GIFs
- Use [Giphy](https://giphy.com) with search terms: "wedding", "rings", "celebration"
- Ensure GIFs are under 100KB for optimal loading

### NYC-Themed GIFs

| File                    | Type | Source         | License       | Notes                     |
| ----------------------- | ---- | -------------- | ------------- | ------------------------- |
| `statue-of-liberty.gif` | SVG  | Custom created | Public Domain | Statue with glowing torch |
| `taxi.gif`              | SVG  | Custom created | Public Domain | Yellow NYC taxi cab       |
| `subway.gif`            | SVG  | Custom created | Public Domain | NYC subway train (7 line) |
| `skyline.gif`           | SVG  | Custom created | Public Domain | NYC skyline at night      |

**Replacement Recommendations:**

- Search for "NYC", "New York", "Brooklyn" on GIF sites
- Look for retro/vintage NYC imagery for Geocities aesthetic
- Consider pixel art versions for authentic 90s feel

### Geocities Classic Assets

| File                     | Type | Source         | License       | Notes                         |
| ------------------------ | ---- | -------------- | ------------- | ----------------------------- |
| `under-construction.gif` | SVG  | Custom created | Public Domain | Construction worker with sign |
| `rainbow-divider.gif`    | SVG  | Custom created | Public Domain | Animated rainbow bar          |
| `email.gif`              | SVG  | Custom created | Public Domain | Floating envelope             |
| `arrow-right.gif`        | SVG  | Custom created | Public Domain | Pointing hand (right)         |
| `arrow-down.gif`         | SVG  | Custom created | Public Domain | Pointing hand (down)          |

**Replacement Recommendations:**

- [GifCities](https://gifcities.org) is the BEST source for authentic Geocities graphics
- Search terms: "under construction", "new", "email", "arrow"
- Keep the tacky 90s aesthetic!

### Background Patterns

| File                  | Type | Source         | License       | Notes                    |
| --------------------- | ---- | -------------- | ------------- | ------------------------ |
| `stars-bg.png`        | SVG  | Custom created | Public Domain | Twinkling starry night   |
| `construction-bg.png` | SVG  | Custom created | Public Domain | Yellow/black stripes     |
| `hearts-bg.png`       | SVG  | Custom created | Public Domain | Scattered hearts pattern |
| `confetti-bg.png`     | SVG  | Custom created | Public Domain | Scattered confetti       |

**Notes:**

- All backgrounds are designed to tile seamlessly
- SVG format allows for crisp rendering at any size
- Can be converted to PNG/GIF for authentic retro feel

---

## Audio Assets

### Background Music

| File                | Type | Source | License | Status            |
| ------------------- | ---- | ------ | ------- | ----------------- |
| `wedding-march.mid` | MIDI | TBD    | TBD     | **Not yet added** |
| `nyc-theme.mid`     | MIDI | TBD    | TBD     | **Not yet added** |

**Recommended Sources:**

- [FreeMIDI.org](http://freemidi.org) - Large collection of free MIDI files
- [MIDIWorld](http://www.midiworld.com) - Categorized MIDI library
- [BitMIDI](https://bitmidi.com) - Free MIDI file database
- [Classical Archives](https://www.classicalarchives.com) - Public domain classical music

**Suggested Tracks:**

- Wagner's "Bridal Chorus" (Here Comes the Bride)
- Mendelssohn's "Wedding March"
- "New York, New York" (Frank Sinatra)
- Pachelbel's "Canon in D"

**Implementation:**

```html
<audio id="bg-music" loop>
  <source src="/audio/wedding-march.mid" type="audio/midi" />
  <source src="/audio/wedding-march.mp3" type="audio/mpeg" />
</audio>
```

---

## Fonts

### Primary Fonts

| Font          | Source      | License | Usage               |
| ------------- | ----------- | ------- | ------------------- |
| Comic Sans MS | System font | System  | Headings, body text |
| Arial         | System font | System  | Fallback            |
| Courier New   | System font | System  | Code/monospace      |

**Notes:**

- Using system fonts for authentic Geocities feel
- No web fonts needed (keeps it retro!)
- Comic Sans MS is THE Geocities font

---

## Icons & Favicons

| File          | Type | Source         | License       | Notes                        |
| ------------- | ---- | -------------- | ------------- | ---------------------------- |
| `favicon.svg` | SVG  | Custom created | Public Domain | Wedding rings icon           |
| `favicon.ico` | ICO  | TBD            | TBD           | **To be generated from SVG** |

**Generation Instructions:**

1. Use [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload `favicon.svg`
3. Generate all sizes (16x16, 32x32, etc.)
4. Download and replace `favicon.ico`

---

## Social Media Images

### Open Graph Images

| File                | Dimensions | Source         | License       | Notes                  |
| ------------------- | ---------- | -------------- | ------------- | ---------------------- |
| `og-image.png`      | 1200x630   | Custom created | Public Domain | For Facebook, LinkedIn |
| `twitter-image.png` | 1200x600   | Custom created | Public Domain | For Twitter/X          |

**Content:**

- "Rachel & Tim" in large text
- "are getting married!"
- "October 9, 2026"
- "Brooklyn, NY"
- Wedding rings graphic
- Starry background with Geocities aesthetic

**Testing:**

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

---

## Licensing

### Custom Created Assets

All custom-created SVG assets in this project are released into the **Public Domain** under the [CC0 1.0 Universal](https://creativecommons.org/publicdomain/zero/1.0/) license.

You are free to:

- Use commercially
- Modify
- Distribute
- Use without attribution

### Third-Party Assets

When replacing placeholder assets with real GIFs or other media:

1. **Always check the license** before using
2. **Preferred licenses:**
   - Public Domain (CC0)
   - Creative Commons (CC BY, CC BY-SA)
   - Royalty-free with attribution
3. **Avoid:**
   - Copyrighted material without permission
   - "All Rights Reserved" content
   - Watermarked images

### Attribution

If using Creative Commons assets that require attribution:

```html
<!-- Example attribution in footer -->
<p>
  [Asset Name] by [Creator] is licensed under
  <a href="[license-url]">CC BY 4.0</a>
</p>
```

---

## Replacement Guide

### How to Replace Placeholder Assets

#### 1. Find Your Asset

**Best Sources:**

- **GifCities** - Authentic Geocities GIFs
- **Giphy** - Modern GIFs
- **Tenor** - Reaction GIFs
- **Archive.org** - Historical web graphics

#### 2. Download & Optimize

**For GIFs:**

```bash
# Optimize with gifsicle
gifsicle -O3 --colors 256 input.gif -o output.gif

# Or use online tool
# https://ezgif.com/optimize
```

**For Images:**

```bash
# Convert to WebP for better compression
cwebp input.png -q 80 -o output.webp

# Or use ImageOptim (Mac)
# https://imageoptim.com/
```

#### 3. Replace File

```bash
# Simply replace the file with the same name
cp new-rings.gif public/images/rings.gif
```

#### 4. Test

- Check file size (aim for <100KB per GIF)
- Verify animation works
- Test on mobile devices
- Check loading speed

### Recommended Dimensions

| Asset Type      | Dimensions           | Max Size |
| --------------- | -------------------- | -------- |
| Small icons     | 50x50px              | 20KB     |
| Medium graphics | 100x100px            | 50KB     |
| Large graphics  | 200x200px            | 100KB    |
| Dividers        | 200x20px             | 30KB     |
| Backgrounds     | 100x100px (tileable) | 50KB     |
| Favicons        | 32x32px              | 10KB     |
| OG Images       | 1200x630px           | 300KB    |

### File Naming Conventions

- Use lowercase
- Use hyphens for spaces
- Keep original extension
- Be descriptive

**Examples:**

- ✅ `wedding-rings.gif`
- ✅ `nyc-skyline.gif`
- ❌ `Wedding Rings.GIF`
- ❌ `img1.gif`

---

## Tools & Resources

### Image Editing

- **GIMP** - Free Photoshop alternative
- **Photopea** - Online Photoshop clone
- **Piskel** - Pixel art and GIF creator
- **ezgif.com** - Online GIF editor

### Optimization

- **ImageOptim** (Mac) - Lossless image compression
- **TinyPNG** - PNG/JPEG compression
- **gifsicle** - Command-line GIF optimizer
- **SVGOMG** - SVG optimizer

### Finding Assets

- **GifCities** - https://gifcities.org
- **Giphy** - https://giphy.com
- **Unsplash** - https://unsplash.com (photos)
- **Pexels** - https://pexels.com (photos/videos)
- **Pixabay** - https://pixabay.com (various media)

### Validation

- **W3C Validator** - https://validator.w3.org
- **PageSpeed Insights** - https://pagespeed.web.dev
- **WebPageTest** - https://www.webpagetest.org

---

## Notes

- All current assets are SVG placeholders for development
- Replace with authentic GIFs for true Geocities experience
- Keep file sizes small for fast loading
- Test on multiple devices and browsers
- Maintain the fun, tacky 90s aesthetic!

---

## Questions?

If you need help finding or creating assets:

1. Check the `public/images/README.md` for detailed instructions
2. Check the `public/audio/README.md` for audio guidance
3. Search GifCities for authentic 90s graphics
4. Use AI tools like DALL-E or Midjourney for custom graphics

**Remember:** The goal is to capture that authentic Geocities nostalgia while celebrating Rachel & Tim's wedding! Have fun with it! 🎉💕

---

_Last Updated: December 2024_
_Project: Rachel & Tim's Wedding Website_
_Built with: Astro, React, TypeScript, and lots of 90s nostalgia_

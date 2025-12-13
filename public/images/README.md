# Image Assets

This directory contains placeholder SVG assets for the Rachel & Tim wedding website. These are animated SVG files that mimic the classic Geocities GIF aesthetic.

## Current Assets

### Wedding-Themed

- `rings.gif` - Animated wedding rings with sparkles
- `bells.gif` - Swinging wedding bells
- `champagne.gif` - Clinking champagne glasses with bubbles
- `dancing.gif` - Dancing couple with hearts
- `hearts.gif` - Floating hearts animation
- `confetti.gif` - Falling confetti pieces

### NYC-Themed

- `statue-of-liberty.gif` - Statue of Liberty with glowing torch
- `taxi.gif` - Yellow taxi cab driving
- `subway.gif` - NYC subway train (7 line)
- `skyline.gif` - NYC skyline at night with twinkling windows

### Geocities Classics

- `under-construction.gif` - Construction worker with sign
- `rainbow-divider.gif` - Animated rainbow horizontal rule
- `email.gif` - Floating envelope animation
- `arrow-right.gif` - Pointing hand (right)
- `arrow-down.gif` - Pointing hand (down)

### Background Patterns

- `stars-bg.png` - Twinkling starry night pattern
- `construction-bg.png` - Yellow and black diagonal stripes
- `hearts-bg.png` - Scattered hearts pattern
- `confetti-bg.png` - Scattered confetti pieces

## Replacing with Real GIFs

These SVG placeholders can be replaced with actual animated GIFs for a more authentic Geocities experience:

### Recommended Sources

1. **Giphy** (https://giphy.com) - Search for "wedding", "NYC", "retro web"
2. **Tenor** (https://tenor.com) - Good for reaction GIFs
3. **GifCities** (https://gifcities.org) - Archive of actual Geocities GIFs
4. **Archive.org** - Historical web graphics

### Recommended Dimensions

- Small icons (arrows, email): 50x50px or smaller
- Medium graphics (rings, bells): 100x100px
- Large graphics (under construction): 150x150px
- Dividers: 200x20px (or full width)
- Backgrounds: 100x100px to 200x200px (tileable)

### Optimization Tips

1. **Keep file sizes small** - Aim for under 50KB per GIF
2. **Limit colors** - Use 256 colors or less for smaller files
3. **Reduce frames** - 10-20 frames is usually enough
4. **Use dithering** - Helps reduce file size while maintaining quality
5. **Optimize with tools**:
   - [ezgif.com](https://ezgif.com/optimize) - Online GIF optimizer
   - [gifsicle](https://www.lcdf.org/gifsicle/) - Command-line tool
   - [ImageOptim](https://imageoptim.com/) - Mac app

### File Naming Convention

Keep the same filenames when replacing to avoid breaking links:

- Use lowercase
- Use hyphens for spaces
- Keep `.gif` extension (even though current files are SVG)

## Usage in Code

These assets are referenced throughout the site:

```astro
<!-- In Astro components -->
<img src="/images/rings.gif" alt="Wedding rings" width="100" height="100" />

<!-- As CSS background -->
<div style="background-image: url('/images/stars-bg.png')"></div>
```

## Licensing

When replacing with real GIFs, ensure you have proper licensing:

- Use public domain or Creative Commons licensed images
- Credit creators when required
- Avoid copyrighted material without permission
- GifCities content is from archived Geocities sites (public domain)

## Creating Custom GIFs

If you want to create custom GIFs:

### Tools

- **Photoshop** - Frame animation
- **GIMP** - Free alternative to Photoshop
- **Piskel** - Online pixel art animator
- **Aseprite** - Pixel art and animation tool

### Tips for Geocities Aesthetic

1. Use bright, saturated colors
2. Add sparkles and glitter effects
3. Keep animations simple and looping
4. Use dithering for gradients
5. Add drop shadows for depth
6. Make it slightly tacky (it's part of the charm!)

## Notes

- Current SVG files are optimized for web and include CSS animations
- SVG files will work in all modern browsers
- For true Geocities nostalgia, replace with actual GIFs
- Background patterns are designed to tile seamlessly
- All assets are optimized for fast loading

## Need Help?

If you need assistance finding or creating assets:

1. Check ASSET_SOURCING_GUIDE.md in the project root
2. Browse GifCities for authentic 90s graphics
3. Use AI tools like DALL-E or Midjourney for custom graphics
4. Commission a pixel artist on Fiverr or similar platforms

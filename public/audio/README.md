# Audio Assets

This directory contains audio files for the Rachel & Tim wedding website, following the classic Geocities tradition of auto-playing background music.

## Current Assets

### Placeholder Files Needed

- `wedding-march.mid` - Wedding march MIDI file
- `nyc-theme.mid` - NYC-themed music (optional)

## About MIDI Files

MIDI (Musical Instrument Digital Interface) files were popular on Geocities sites because:

- Very small file size (typically 5-50KB)
- Supported by most browsers in the 90s/early 2000s
- No copyright issues with public domain compositions
- Nostalgic "tinny" sound quality

## Sourcing MIDI Files

### Public Domain MIDI Sources

1. **FreeMIDI.org** - Large collection of free MIDI files
2. **MIDIWorld** - Categorized MIDI library
3. **BitMIDI** - Free MIDI file database
4. **Classical Archives** - Public domain classical music
5. **VGMusic** - Video game music MIDIs

### Recommended Tracks

#### Wedding March Options

- Wagner's "Bridal Chorus" (Here Comes the Bride)
- Mendelssohn's "Wedding March"
- Pachelbel's "Canon in D"
- Bach's "Air on the G String"

#### NYC Theme Options

- "New York, New York" (Frank Sinatra)
- "Empire State of Mind" (simplified version)
- "Theme from New York, New York"
- Generic jazz/big band MIDI

## Creating MIDI Files

If you want to create custom MIDI files:

### Tools

- **MuseScore** - Free music notation software (exports MIDI)
- **GarageBand** - Mac music creation (exports MIDI)
- **FL Studio** - Professional DAW with MIDI export
- **Online Sequencer** - Browser-based MIDI creator

### Tips

1. Keep it simple - fewer instruments = smaller file
2. Use General MIDI instruments for compatibility
3. Aim for 1-2 minute loops
4. Test in multiple browsers
5. Provide a mute button (important!)

## Converting Audio to MIDI

If you have MP3/WAV files:

### Conversion Tools

- **Bear File Converter** - Online audio to MIDI
- **AnthemScore** - AI-powered audio to MIDI
- **Audacity + Plugins** - Free audio editor with MIDI export

### Note

Audio-to-MIDI conversion is imperfect. Best results with:

- Solo instruments
- Clear melodies
- Simple arrangements

## Modern Alternative: MP3

For better quality, consider using MP3 instead:

### Pros

- Better sound quality
- More control over audio
- Wider format support

### Cons

- Larger file sizes (100KB-2MB)
- May need licensing for copyrighted music
- Less "authentic" Geocities feel

### Royalty-Free Music Sources

- **YouTube Audio Library** - Free music for creators
- **Free Music Archive** - Creative Commons music
- **Incompetech** - Kevin MacLeod's royalty-free music
- **Bensound** - Free music with attribution

## Implementation

The audio player is implemented in the site with:

```astro
<!-- Auto-play background music (with user control) -->
<audio id="bg-music" loop>
  <source src="/audio/wedding-march.mid" type="audio/midi" />
  <source src="/audio/wedding-march.mp3" type="audio/mpeg" />
</audio>
```

### User Controls

- Mute/unmute button in navigation
- Volume control
- Respects user's autoplay preferences
- Stops when user navigates away

## Browser Support

### MIDI Support

- **Limited** in modern browsers
- Chrome/Edge: Requires plugin or Web MIDI API
- Firefox: Limited support
- Safari: No native support

### Recommendation

Provide both MIDI (for nostalgia) and MP3 (for compatibility):

```
/audio/
  wedding-march.mid  (for authentic feel)
  wedding-march.mp3  (fallback for compatibility)
```

## File Size Guidelines

- **MIDI**: 5-50KB (ideal for Geocities aesthetic)
- **MP3 (low quality)**: 100-500KB
- **MP3 (medium quality)**: 500KB-2MB
- **MP3 (high quality)**: 2-5MB

For web use, aim for under 1MB total.

## Licensing

### Public Domain

- Classical music (pre-1928)
- Traditional wedding marches
- Folk songs

### Creative Commons

- Check license requirements
- Provide attribution if required
- Respect non-commercial restrictions

### Copyrighted Music

- Requires licensing/permission
- Consider royalty-free alternatives
- Use cover versions or MIDI renditions

## Accessibility

Remember to:

1. Provide mute controls
2. Don't auto-play at high volume
3. Respect `prefers-reduced-motion`
4. Add aria-labels to controls
5. Allow keyboard control

## Testing

Test audio on:

- Chrome/Edge
- Firefox
- Safari
- Mobile browsers
- Different operating systems

## Notes

- Current implementation uses Web Audio API
- MIDI playback may require additional libraries
- Consider using Tone.js or MIDI.js for better MIDI support
- Always provide user controls for audio
- Consider adding a "90s mode" toggle for MIDI vs MP3

## Need Help?

For audio assistance:

1. Check ASSET_SOURCING_GUIDE.md for music sources
2. Use MuseScore to create simple MIDI files
3. Search "public domain wedding music MIDI"
4. Consider hiring a musician on Fiverr for custom tracks

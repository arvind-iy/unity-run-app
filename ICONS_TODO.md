# 🎨 Icons TODO

The app is working but needs icons for PWA installation.

## Quick Fix: Remove icons from manifest

Edit `manifest.json` and temporarily remove the icons section:

```json
{
  "name": "Unity Run & Ride - Bib Management",
  "short_name": "Unity Bib",
  "description": "Bib assignment system for Unity Run & Ride event",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#667eea",
  "orientation": "portrait-primary",
  "icons": []
}
```

## Proper Fix: Add icons

Create icons using:
- [Favicon Generator](https://favicon.io/)
- [PWA Icon Generator](https://www.pwabuilder.com/imageGenerator)

Or use this simple text-based icon:

### Option 1: Text Icon (Quick)
1. Go to [favicon.io/favicon-generator/](https://favicon.io/favicon-generator/)
2. Text: "🏃" or "UR"
3. Background: #667eea
4. Font size: 110
5. Download
6. Extract icon-192.png and icon-512.png
7. Upload to your repo

### Option 2: Logo Image
1. Have a designer create:
   - 192x192 PNG
   - 512x512 PNG
2. Name them: `icon-192.png` and `icon-512.png`
3. Put in webapp root folder
4. Commit and push

The app works fine without icons - they're only for "Add to Home Screen" feature!

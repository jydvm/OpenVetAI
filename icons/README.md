# OpenVetAI PWA Icons

This directory contains the Progressive Web App icons for OpenVetAI.

## Required Icons

The following icon sizes are needed for full PWA compatibility:

### Standard Icons
- `icon-72x72.png` - Small icon
- `icon-96x96.png` - Medium icon  
- `icon-128x128.png` - Large icon
- `icon-144x144.png` - Android icon
- `icon-152x152.png` - iOS icon
- `icon-192x192.png` - Standard PWA icon
- `icon-384x384.png` - Large PWA icon
- `icon-512x512.png` - Maximum PWA icon

### Shortcut Icons
- `record-shortcut.png` - Quick record shortcut icon
- `notes-shortcut.png` - Recent notes shortcut icon

### Screenshots (Optional)
- `screenshot-mobile.png` - Mobile interface screenshot (390x844)
- `screenshot-tablet.png` - Tablet interface screenshot (768x1024)

## Icon Design Guidelines

### Design Requirements
- **Simple and recognizable** - Clear at small sizes
- **Veterinary themed** - Stethoscope, paw print, or medical cross
- **Professional appearance** - Clean, modern design
- **High contrast** - Works on light and dark backgrounds

### Technical Requirements
- **Format:** PNG with transparency
- **Color depth:** 24-bit or 32-bit
- **Background:** Transparent or solid color
- **Padding:** 10% safe area around main icon
- **Maskable:** Design should work with circular masks

## Temporary Solution

Until custom icons are created, you can use these placeholder approaches:

### Option 1: Text-based Icons
Create simple text-based icons with the OpenVetAI logo or "OV" initials.

### Option 2: Emoji Icons
Use veterinary-related emojis as temporary icons:
- 🩺 (stethoscope)
- 🐾 (paw prints)
- 🏥 (hospital)
- 📝 (notes)

### Option 3: Generate Icons
Use online icon generators with veterinary themes:
- PWA Icon Generator
- Favicon.io
- RealFaviconGenerator

## Installation

Once icons are created:
1. Place all PNG files in this directory
2. Ensure filenames match the manifest.json references
3. Test PWA installation on mobile devices
4. Verify icons appear correctly in app drawer/home screen

## Testing

Test icons on:
- ✅ Chrome (Android)
- ✅ Safari (iOS)
- ✅ Edge (Windows)
- ✅ Firefox (Desktop)

Verify:
- ✅ Icons display correctly in browser install prompt
- ✅ Icons appear on home screen after installation
- ✅ Icons work with system dark/light mode
- ✅ Icons are crisp on high-DPI displays

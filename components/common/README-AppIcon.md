# App Icon Component

Modern, minimal, high-contrast app icons for AI-tutored medical live classes.

## Preview

Navigate to `/app-icon-preview` to see all icon variants and sizes.

## Variants

### 1. Default
Medical cross with AI circuit nodes and live indicator. Best represents the fusion of healthcare, AI technology, and live sessions.

**Features:**
- Gradient medical cross in cyan (#00D9FF)
- AI circuit nodes in corners
- Pulsing red live indicator
- Dark gradient background

### 2. Simple
Minimalist design with clean lines and tech accents.

**Features:**
- Clean medical cross
- Corner tech accents suggesting AI/chip design
- Single red live dot
- Ultra-minimal aesthetic

### 3. Pulse
ECG heartbeat design representing medical monitoring and live activity.

**Features:**
- Heartbeat ECG line
- Medical cross background element
- AI nodes in corners
- Live red indicator

## Usage

```tsx
import AppIcon from '@/components/common/AppIcon';

// Default variant
<AppIcon size={512} variant="default" />

// Simple variant
<AppIcon size={512} variant="simple" />

// Pulse variant
<AppIcon size={512} variant="pulse" />
```

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Cyan | `#00D9FF` | Main brand color, medical cross |
| Live Red | `#EF4444` | Live indicator, urgent actions |
| Dark Background | `#0F0F0F` | Primary background |
| Card Background | `#1A1A1A` | Secondary background |
| White | `#FFFFFF` | Text, high contrast elements |

## Exporting for Production

To use these as actual app icons:

1. **Take a screenshot** of the icon at 1024x1024 resolution
2. Use icon generator tools:
   - [appicon.co](https://appicon.co) - Generate all iOS sizes
   - [icon.kitchen](https://icon.kitchen) - Generate iOS and Android sizes
   - Expo: Place in `assets/images/` and configure in `app.json`

3. **Expo Configuration** (`app.json`):
```json
{
  "expo": {
    "icon": "./assets/images/app-icon.png",
    "ios": {
      "icon": "./assets/images/app-icon-ios.png"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0F0F0F"
      }
    }
  }
}
```

## Design Principles

### High Contrast
- Dark backgrounds (#0F0F0F, #1A1A1A)
- Bright cyan accent (#00D9FF)
- Clear red indicator (#EF4444)
- White for text and critical elements

### Minimalism
- Clean geometric shapes
- No unnecessary details
- Clear visual hierarchy
- Scalable from 48px to 1024px

### Symbolism
- **Medical Cross**: Healthcare/medical education
- **Circuit Nodes**: AI technology
- **Red Dot**: Live sessions
- **Pulse/ECG**: Vital signs, monitoring, activity
- **Cyan Color**: Modern, tech, clarity

## Recommended Variant

**Default** - Best balance of all elements (medical, AI, live) with strong visual identity.

**Simple** - For minimal branding or when the icon needs to be very small.

**Pulse** - For emphasizing the "live" and medical monitoring aspects.

---
name: Obsidian Cyber
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d1f27'
  surface-container-high: '#272a32'
  surface-container-highest: '#32353d'
  on-surface: '#e1e2ec'
  on-surface-variant: '#e3bfb1'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2d3038'
  outline: '#aa8a7d'
  outline-variant: '#5a4136'
  surface-tint: '#ffb596'
  primary: '#ffb596'
  on-primary: '#581e00'
  primary-container: '#ff6500'
  on-primary-container: '#551d00'
  inverse-primary: '#a33e00'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#ffb68e'
  on-tertiary: '#542200'
  tertiary-container: '#f2700b'
  on-tertiary-container: '#512000'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb596'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#773300'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353d'
typography:
  display-hero:
    fontFamily: Montserrat
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 64px
  display-hero-mobile:
    fontFamily: Montserrat
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Montserrat
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system targets high-performance gamers, hardware enthusiasts, and tech collectors who expect precision, power, and prestige. The aesthetic merges **Cyberpunk High-Tech** with **Dark Glassmorphism**, projecting raw computational muscle through refined obsidian layers rather than chaotic visual clutter.

The experience evokes focus, adrenaline, and technological mastery. Every interaction feels instant, kinetic, and deliberate—borrowing cues from bespoke HUD interfaces, custom liquid-cooled rigs, and state-of-the-art telemetry arrays.

## Colors

The palette establishes an ultra-deep canvas to allow chromatic neon accents to command visual real estate without eye fatigue:

- **Base Surfaces:** Deep Obsidian (`#0A0D14`) acts as the absolute bedrock, Carbon Sub-layer (`#121722`) serves as primary module backdrops, and Elevated Obsidian (`#182030`) houses interactive cards and panels.
- **Electric Overclock Orange:** Primary CTA color (`#FF6500`) with high-energy radiant variant (`#FF7A1A`), evoking raw energy, performance stats, checkout flows, and high-impact warnings.
- **Cryo Cyan / Ice Blue:** Secondary accent (`#00E5FF`), utilized for telemetry badges, technical specifications, active system status, stock indicators, and digital HUD frames.
- **Functional States:** Success uses a pure Neon Mint (`#00E676`), Critical/Error uses Laser Crimson (`#FF1744`), and Warnings shift towards Amber Flare (`#FFAB00`).
- **Text Hierarchy:** High-contrast pure optical white (`#F0F4FC`) for headings, Cool Zinc (`#94A3B8`) for secondary body details, and Deep Muted Slate (`#4B5563`) for deactivated or telemetry markers.

## Typography

The typographic stack leverages three distinct roles:
1. **Montserrat (Headlines):** High-impact, wide-geometric uppercase and title cases delivering bold aggressive gaming momentum.
2. **Inter (Body):** Precision-engineered readability for dense hardware specs, item descriptions, and user feedback.
3. **JetBrains Mono (Telemetry & Metrics):** Applied to product SKUs, pricing arrays, real-time counters, FPS benchmarks, and hardware technical tables.

## Layout & Spacing

A structured 12-column fluid grid system with asymmetric module balancing. High-density hardware displays require disciplined spacing scales:

- **Desktop (1280px+):** 12 columns, 24px gutters, 32px safe margins. Max page container constrained to 1440px for optimal screen focus.
- **Tablet (768px - 1279px):** 8 columns, 16px gutters, 24px canvas margins.
- **Mobile (0px - 767px):** 4 columns, 16px gutters, 16px canvas margins. Two-up grid collapse for catalog cards with touch-optimized target spacing.

## Elevation & Depth

Visual hierarchy uses frosted crystalline layering combined with perimeter energy currents instead of conventional soft ambient light:

- **Level 0 (Canvas):** Pure `#0A0D14` backdrop. Optional micro-dot matrix pattern at 3% opacity.
- **Level 1 (Panels & Shells):** `#121722` at 85% opacity, `backdrop-filter: blur(16px)`. Border: 1px solid `rgba(255, 255, 255, 0.05)`.
- **Level 2 (Cards & Active Modules):** `#182030` at 65% opacity, `backdrop-filter: blur(24px)`. Rimmed with a linear gradient border from `rgba(255, 101, 0, 0.3)` to `rgba(0, 229, 255, 0.08)`.
- **Level 3 (Modals & HUD Overlays):** `#121722` at 95% opacity with an intense localized glow: `box-shadow: 0 0 35px rgba(0, 229, 255, 0.15), inset 0 0 1px 1px rgba(0, 229, 255, 0.4)`.
- **Interactive State Elevation:** Elements in hover or active focus project an electric aura using `drop-shadow(0 0 12px rgba(255, 101, 0, 0.45))`.

## Shapes

Subtle, technical radii convey industrial machined precision without looking bubbly:
- Standard surface curvature uses `0.25rem` (4px).
- Larger containers, sheets, and product preview frames use `0.5rem` (8px).
- Chamfered cut accents (45-degree angle clipped corners using CSS `clip-path`) should be selectively deployed on high-tier badge corners, countdown containers, and primary trigger buttons.

## Components

### Buttons
- **Primary Cyber:** Solid Electric Neon Orange (`#FF6500`) background with a gradient transition to `#FF7A1A`. Text in `#0A0D14` Montserrat Bold. Slanted 45-degree corner notch on top-right. Hover emits a 16px orange perimeter aura with a subtle horizontal light-streak animation.
- **Secondary Cryo:** Transparent background, 1px solid `#00E5FF`, text `#00E5FF`. Hover triggers an internal neon wash (`rgba(0, 229, 255, 0.12)`) and box-shadow `0 0 16px rgba(0, 229, 255, 0.3)`.
- **Ghost Action:** Obsidian panel surface with muted white typography, transforming to high-contrast white on hover with border `rgba(255, 255, 255, 0.2)`.

### Cards & Hardware Tiles
- **Product Card:** Frosted backdrop `#182030` with `backdrop-filter: blur(12px)`. Bordered with 1px translucent cybernetic outline. Top section embeds stock telemetry (`IN STOCK [99+]` in Cryo Cyan JetBrains Mono). On hover, card shifts -4px on Y-axis, border pulses with electric orange gradient, and hardware thumbnail enlarges slightly within its masked container.

### Status Badges & Chips
- Compact HUD indicators rendered in `JetBrains Mono` uppercase with an animated pulsing core dot (e.g., green for `LIVE RIG BENCHMARK`, cyan for `GEN 5 NVMe`, orange for `HOT DROP`).

### Futuristic Countdown Timers
- Segmented numeric modules featuring carbon backdrops (`#121722`), cyan numerical readouts in `JetBrains Mono`, and subtle neon progress bar lines beneath the digits tracking fractional drop expirations.

### Inputs & Search HUD
- Inputs utilize inset carbon fill (`#0E131D`) with a 1px border `rgba(255, 255, 255, 0.1)`. Focus triggers a glowing `#00E5FF` border alongside an instant HUD target line on the left edge. Placeholder text rendered in muted cool slate.
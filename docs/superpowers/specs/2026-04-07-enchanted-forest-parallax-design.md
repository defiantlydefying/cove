# Enchanted Forest Parallax — Design Spec

## Summary

Replace the current ParallaxLandscape section (a decorative mountain transition between hero and features) with an immersive enchanted forest scene. The forest builds depth through parallax layers and comes alive with bioluminescent elements that awaken as the user scrolls — like the forest responds to their presence.

## Goals

- More visually striking transition between the dark hero and the light features section
- Scroll-driven interactivity that rewards engagement without requiring it
- Reinforce the "cove" brand as a hidden, safe sanctuary
- Moderate bioluminescence: clearly visible but soft, like real fireflies at dusk

## Visual Layers

Five parallax layers, back to front, each moving at a different scroll speed:

1. **Sky / canopy ceiling** — Near-black with subtle breaks showing deep blue-green. Moves slowest.
2. **Distant trees** — Tall silhouettes in dark sage (`rgba(107,143,113,0.15)`). Faint mist between them.
3. **Mid-ground trees** — Larger, more defined silhouettes in deeper green. Shafts of dim light filter between trunks.
4. **Foreground elements** — Ferns, fallen logs, mushroom clusters along the bottom. Moves fastest.
5. **Ground / forest floor** — Gradient transition into the light `#EAF0EB` background of the FeatureTicker section below.

## Bioluminescent Elements

All triggered by scroll progress, with moderate intensity:

- **Mushroom clusters** (2-3 groups): Caps glow soft teal (`rgba(126,170,160,0.4)`) with a subtle pulse animation. Fade in around 30% scroll.
- **Fireflies** (8-12): Small dots that lift off from ferns and drift with gentle sine-wave motion. Appear around 40% scroll. Use the existing cove palette: sage, teal, amber.
- **Pool/clearing glow**: Center-bottom radial glow suggesting a reflective pool or clearing (the "cove"). Builds from 50-80% scroll. Brightest element but still moderate.
- **Floating pollen/spores**: Tiny particles drifting upward, very subtle. Fade in around 20% scroll.

## Scroll Timeline

| Scroll % | What happens |
|-----------|-------------|
| 0-20% | Dark canopy visible, distant tree silhouettes fade in, first spores appear |
| 20-40% | Mid-ground trees emerge, mushroom caps begin glowing |
| 40-60% | Fireflies lift off, light shafts become visible between trunks |
| 60-80% | Foreground ferns and elements appear, pool glow builds to full |
| 80-100% | Scene at full richness, then fades into the light background below |

## Technical Approach

- **Tree silhouettes**: SVG paths (lightweight, scalable, no image assets)
- **Parallax**: `useScroll` + `useTransform` from framer-motion for layer offsets and opacity triggers
- **Mushroom pulse**: CSS keyframe animation (`@keyframes mushroomPulse`)
- **Firefly drift**: CSS keyframe animation with sine-wave motion, staggered delays
- **Spores**: CSS-animated small dots drifting upward (similar pattern to existing `ParticleMotes`)
- **Pool glow**: Radial gradient div with scroll-driven opacity
- **No canvas needed**: CSS/SVG keeps it simple and performant
- **Reduced motion**: Respects `useReducedMotion` — shows static forest scene with all elements visible at full opacity, no animations

## Component Structure

Single component `ParallaxLandscape.tsx` (replaces existing file). No new dependencies required — uses framer-motion (already installed) and CSS animations.

## Color Palette

Uses existing cove palette throughout:
- Sage: `#6B8F71` / `rgba(107,143,113,...)`
- Teal: `#7EAAA0` / `rgba(126,170,160,...)`
- Amber: `#C4A055` / `rgba(196,160,85,...)`
- Heather: `#A08BA0` / `rgba(160,139,160,...)`
- Dark base: `#1C1B18`
- Light transition target: `#EAF0EB`

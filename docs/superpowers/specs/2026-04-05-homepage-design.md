# Cove Homepage — Design Specification

**Date:** 2026-04-05
**Purpose:** Create an award-worthy marketing homepage for Cove, a neurodivergent-friendly executive function companion. The page should inspire awe through rich animations while maintaining a warm, calming aesthetic.

## Design Pillars

- **Tone:** Warm & empathetic copy + atmospheric/poetic visuals (minimal copy, let motion speak)
- **Approach:** "Floating Layers" — glassmorphic depth, interactive vignettes, grain texture, parallax
- **Color journey:** Background palette evolves with scroll: cream → sage → teal → amber → terracotta
- **Motion philosophy:** Scroll-driven primary, ambient secondary. Nothing auto-plays except subtle ambient effects (particles, aurora, grain). Respects `prefers-reduced-motion` everywhere.
- **Target audience:** Neurodivergent users seeking productivity tools that don't overwhelm
- **Marketing pillars:** Autonomy, user-friendliness, neurodivergent-first design, gamification

## Tech Stack

- **Framework:** Next.js 16 (App Router) — existing project
- **Animation:** Framer Motion (new dependency, ~30KB)
- **Canvas:** HTML5 Canvas 2D for particle constellation + generative flow field
- **Styling:** Tailwind CSS v4 with existing design tokens
- **Logo:** New geometric teal rounded-square mountain mark (SVG, replaces old illustrated logo on homepage)
- **Fonts:** Geist Sans + Geist Mono (already installed)

## Routing

- `src/app/page.tsx` — currently redirects to `/dashboard` or `/login`. Will become the homepage (public, no auth required).
- Authenticated users visiting `/` see the homepage (not auto-redirected). They can click "Get started" → `/dashboard` or "Log in" → `/login`.
- The homepage is a standalone page with its own layout — does NOT use the AppShell.

## Section-by-Section Design

### Section 0: Sticky Navigation

**Component:** `NavBar`

- Fixed top, starts transparent, gains glassmorphic blur (`backdrop-filter: blur(12px)`) + subtle border on scroll
- Left: New geometric logo mark (SVG) + "cove" wordmark
- Right: "Features" (anchor link), "About" (anchor link), "Get started" button (links to `/register`)
- Magnetic hover effect on links: elements gravitate 8-12px toward cursor on proximity
- CTA button: sage green background, soft hover glow
- Mobile: hamburger → slide-down menu

### Section 1: Hero — Particle Constellation

**Component:** `HeroParticles`

Full viewport height. Dark canvas background (`#1C1B18`).

**Particle system (Canvas 2D):**
- ~100 particles in palette colors (sage, teal, amber, heather, terracotta) at varying opacity (0.2-0.6)
- Particles drift lazily with slight random velocity
- Nearby particles (distance < threshold) connect with faint lines (opacity proportional to distance)
- On page load (or after 1-2s): particles begin gravitating toward target coordinates that form the mountain/cove logo shape
- Spring physics: `damping: 25, stiffness: 80` — gentle convergence, not snappy
- Once assembled, the logo shape holds but particles still have subtle jitter/drift
- Mouse interaction: cursor creates a force field that pushes nearby particles (radius ~100px, gentle force). Particles spring back to logo position after cursor moves away.
- `prefers-reduced-motion`: skip animation, show static SVG logo immediately

**Text reveals (over the canvas):**
- After particles form logo (~2s): headline appears with character-by-character blur-to-focus reveal
- Headline: "Your brain works differently. We built something that works with it."
- Subtext (0.5s later): "An executive function companion that moves at your pace."
- CTA button (0.3s later): "Find your cove" — sage green, hover glow
- Each character: `opacity: 0, filter: blur(6px), translateY(8px)` → `opacity: 1, filter: blur(0), translateY(0)`, staggered 40ms per character

**Ambient layers:**
- Grain texture overlay: SVG noise at 2-3% opacity, static (no animation)
- Cursor light effect: radial gradient glow (sage, ~120px radius, 15% opacity) follows mouse position. Touch devices: fixed subtle center glow.
- Floating keyword tags at edges: "autonomy", "your pace", "gentle", "progress", "calm" — glassmorphic pills, stagger in after headline, gentle float animation (8s cycle, ±6px translateY)
- Floating particle motes: additional tiny dots (2-4px) rising slowly from bottom, palette colors, 7-11s travel time, low opacity
- Living gradient mesh: 3-4 large blurred color blobs from palette drift slowly underneath the canvas (the canvas has slight transparency so mesh shows through at very low intensity)

### Section 2: Scroll-Driven Parallax Landscape

**Component:** `ParallaxLandscape`

Triggered as user scrolls past hero. Full viewport height.

**Layers (back to front), each with independent parallax speed via `useScroll` + `useTransform`:**
1. Sky gradient: dawn colors shifting to golden hour as scroll progresses
2. Sun/moon: radial gradient glow, drifts upward with scroll
3. Distant mountains: lowest opacity (~0.15), slowest parallax
4. Mid mountains: medium opacity (~0.25), medium parallax
5. Trees: CSS triangle shapes scattered, moderate parallax
6. Near mountains: highest opacity (~0.35), fastest parallax
7. Ground: solid, no parallax

Mountains use CSS `clip-path: polygon()` for silhouettes. Colors from the sage/teal range.

**Cove entrance:** Centered at bottom of the scene. Radial glow emanates from it, pulsing gently. As scroll progresses, the entrance grows (scale transform) — you're "approaching" it.

**Aurora bands:** 3 overlapping horizontal gradient bands (palette colors, 200% width, heavily blurred) drift continuously across this section at different speeds. Opacity 8-12%.

**Transition out:** At ~80% scroll through this section, the landscape begins dissolving via clip-path shrink + opacity fade, revealing the light cream background of the product sections below. The color journey shifts from dark to warm cream.

### Section 3: Horizontal Feature Ticker

**Component:** `FeatureTicker`

A horizontal auto-scrolling strip bridging the landscape into features.

- Glassmorphic cards (90x110px each) glide continuously left-to-right
- Each card: icon + module name (Tasks, Routines, Wellness, Streaks, Reminders)
- Each icon uses its semantic color from the palette
- Seamless infinite loop (duplicate items)
- Slow speed (~8s full cycle), pausable on hover
- Mountain silhouette divider above this section (scroll-reveal via clip-path)

### Section 4: Interactive Feature Network Map

**Component:** `FeatureNetwork`

Full-section experience replacing a static feature grid.

**Layout:**
- Dot-grid background: `radial-gradient` pattern, 3px dots at 24px intervals, 4% opacity
- Center node: the actual Cove geometric logo (SVG), larger (72x72px), pulse rings emanating outward
- Orbiting nodes: 4 module nodes (Routines/teal, Wellness/heather, Streaks/amber, Reminders/terracotta) positioned around center
- Animated SVG lines connecting each module to center, traced via `stroke-dashoffset` animation, staggered

**Node interactions:**
- Scroll triggers nodes to fly in from off-screen and connect (staggered, blur-to-focus + translateY)
- Hover on a node: node scales up (1.15x), 3D perspective tilt follows cursor (max 8deg), light-reflection shine moves across surface
- Click/hover expands node into a glassmorphic vignette card with the live mini-demo:
  - Routines: toggle switches (on/off)
  - Wellness: mood slider + face selection
  - Streaks: rolling number ticker counting up + streak dots filling
  - Reminders: task list with auto-checking animation

**Animated SVG icons per node:** Checkmark draws itself, heart pulses, star spins in, brain wiggles. Each triggers on scroll entry.

**Mobile:** Nodes arrange in a vertical tree layout with connecting lines running top-to-bottom.

### Section 5: Split-Panel Before/After

**Component:** `SplitReveal`

Full-width, full-viewport section.

- Two panels side by side, initially closed (meeting at center seam)
- Left panel: "Before Cove" — muted desaturated palette, scattered/chaotic task icons, slight visual noise
- Right panel: "After Cove" — your warm palette, organized clean UI preview, calm
- Glowing seam down the center: CSS gradient line with animated box-shadow, pulsing
- Scroll drives `clip-path: inset()` on each panel — they separate, revealing a headline behind: "The difference is calm."
- Behind-content fades in with opacity tied to scroll progress
- Animated wave divider below this section

### Section 6: Animated Stats / Social Proof

**Component:** `StatsCounter`

Three big numbers, centered, with generous spacing.

- Each number uses rolling ticker animation (digits roll up mechanically like a departure board, staggered per digit)
- Triggered on scroll entry via IntersectionObserver
- Placeholder data: "12,000+ tasks completed" / "94% felt less overwhelmed" / "4.9 average rating"
- Colors: sage, teal, amber respectively
- Mountain silhouette divider above

### Section 7: Floating Testimonial Constellation

**Component:** `TestimonialConstellation`

- 4-6 glassmorphic quote cards positioned at different depths/angles (slight rotation, ±2deg)
- Each card: opening quote mark, italic text, author name with colored avatar dot
- Cards float with gentle drift animation (7-9s cycle, ±8px)
- Staggered scroll-triggered entrance (blur-to-focus + translateY)
- Placeholder quotes focused on neurodivergent experience
- Mobile: cards stack vertically with reduced drift

### Section 8: Empathy Break

**Component:** `EmpathyBreak`

Typographic-centered section. The quiet moment.

- Background: morphing organic blob (border-radius keyframes, 8s cycle) in sage/teal at low opacity behind text
- Text reveals line by line via character-level blur-to-focus, scroll-triggered:
  - "You don't need to work harder."
  - "You don't need another system that makes you feel behind."
  - "You need a space that *gets it*."
- "gets it" has subtle color shift to sage green + slightly heavier weight
- Aurora bands shift to warmer tones (amber/terracotta) in this section
- Generous vertical padding (120px+)
- Mountain silhouette divider above

### Section 9: Generative Flow Field CTA

**Component:** `GenerativeCTA`

Full-viewport section. The finale.

**Generative flow field (Canvas 2D):**
- Perlin/Simplex noise-driven flow field
- ~200 particles leave fading trail lines in palette colors
- Trails have randomized opacity (0.1-0.4) and width (0.5-1.5px)
- Mouse position feeds into noise function — cursor warps the flow field around it
- Glowing nodes pulse at flow intersection points
- Unique pattern every visit (seeded with `Date.now()`)
- `prefers-reduced-motion`: show static gradient background

**CTA overlay:**
- "Find your cove." — large, centered, character-level blur reveal
- "Free to start. Built to stay." — subtext
- CTA button: terracotta gradient background, ripple emanation rings (concentric circles pulsing outward like a stone in water)
- Button hover: warm glow + scale(1.03)
- Terracotta radial glow zone behind CTA

### Section 10: Footer

**Component:** `Footer`

Minimal, quiet.

- Logo mark (small) + "cove" wordmark
- "Your executive function companion"
- "Already have an account? Log in" link
- Subtle top border

### Persistent Elements (throughout page)

**Scroll Journey Progress Bar:**
- Fixed top (below nav), thin (3px) gradient bar that fills left-to-right as page scrolls
- Gradient: sage → teal → amber → terracotta (mirrors color journey)
- Dot markers pulse as you reach each section
- Fades in after scrolling past hero

**Mountain Silhouette Dividers:**
- Between sections 3→4, 5→6, 7→8: soft mountain-range silhouettes rise from below via clip-path animation on scroll
- Each uses a different palette color, marking color zone transitions

**Animated Wave Transitions:**
- Between sections 4→5, 6→7: undulating SVG waves with two overlapping layers at different speeds
- Colors blend between the sections they connect

**Aurora Borealis Overlay:**
- 3 horizontal gradient bands drifting continuously across the page
- Very low opacity (8-12%), heavy blur (50px+)
- Color composition shifts per section via scroll-linked hue adjustment
- Persistent but never distracting

**Particle Motes:**
- Tiny warm-colored dots (2-4px) rising continuously throughout the page
- Palette colors, low opacity, 7-11s travel time
- ~8-12 visible at any time

**Color Journey (background):**
- Page background transitions smoothly via scroll position:
  - Hero: dark (#1C1B18)
  - Landscape → Ticker: transition to cream (#F7F5F0)
  - Features: cream with sage tint
  - Split/Stats: cream with teal tint
  - Testimonials/Empathy: cream shifting to amber warmth
  - CTA: dark again (#1C1B18) for the generative canvas

## Accessibility

- Full `@media (prefers-reduced-motion: reduce)` support: all animations collapse to simple opacity fades or are removed. Canvas effects show static fallbacks (SVG logo, gradient background).
- Floating tags hidden on reduced-motion
- All text meets WCAG AA contrast (cream/charcoal palette = ~12:1, not harsh 21:1)
- Semantic HTML: proper heading hierarchy, nav landmarks, skip-to-content link
- Touch-friendly: min 44px tap targets on all interactive elements
- Keyboard navigable: focus-visible rings on all interactive elements
- Canvas elements are decorative (aria-hidden), all content is in DOM

## Responsive Behavior

- **Desktop (1024px+):** Full experience as described
- **Tablet (768-1023px):** Feature network nodes in 2x2 grid. Split panel stacks vertically. Parallax reduced.
- **Mobile (<768px):** Floating tags hidden. Feature network as vertical tree. Ticker stays horizontal. Particle count reduced to ~50. Canvas effects simplified. Character reveals become word-level. Generous touch targets.
- Typography uses `clamp()` throughout for fluid scaling

## File Structure

```
src/app/
  page.tsx                          # Homepage (replaces redirect)
  (marketing)/
    layout.tsx                      # Marketing layout (no AppShell)

src/components/homepage/
  NavBar.tsx                        # Sticky glassmorphic nav
  HeroParticles.tsx                 # Particle constellation hero
  ParticleCanvas.tsx                # Canvas 2D particle system
  ParallaxLandscape.tsx             # Scroll-driven mountain landscape
  FeatureTicker.tsx                 # Horizontal scrolling strip
  FeatureNetwork.tsx                # Interactive node graph
  FeatureNode.tsx                   # Individual expandable node
  FeatureVignette.tsx               # Mini-demo card content
  SplitReveal.tsx                   # Before/after split panel
  StatsCounter.tsx                  # Animated number counters
  RollingDigit.tsx                  # Single rolling digit component
  TestimonialConstellation.tsx      # Floating quote cards
  EmpathyBreak.tsx                  # Typography moment
  GenerativeCTA.tsx                 # Flow field canvas + CTA
  FlowFieldCanvas.tsx               # Canvas 2D flow field
  Footer.tsx                        # Minimal footer
  ScrollProgress.tsx                # Fixed progress bar
  AuroraOverlay.tsx                 # Persistent aurora bands
  ParticleMotes.tsx                 # Rising dot particles
  MountainDivider.tsx               # Mountain silhouette dividers
  WaveDivider.tsx                   # Animated wave transitions
  GrainOverlay.tsx                  # Static grain texture
  CursorLight.tsx                   # Mouse-following glow
  MagneticElement.tsx               # Magnetic hover wrapper
  CharacterReveal.tsx               # Per-character blur reveal
  MorphingBlob.tsx                  # Organic shape animation
  CoveLogo.tsx                      # New geometric logo SVG

src/lib/
  noise.ts                          # Perlin/Simplex noise implementation
  particleSystem.ts                 # Particle physics utilities
  flowField.ts                      # Flow field generation
```

## Dependencies to Add

- `framer-motion` — animation library (~30KB)

No other new dependencies. Canvas work is vanilla. Noise implementation is a small utility (~50 lines).

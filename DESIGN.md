# Design System Document: JBJ Automotores

## 1. Overview & Creative North Star: "The Kinetic Gallery"
This design system moves away from the traditional, cluttered automotive marketplace and towards a high-end editorial experience. Our Creative North Star is **"The Kinetic Gallery."** We treat every vehicle not as a commodity, but as a masterpiece in motion. 

The aesthetic is rooted in **Modern Editorialism**: high-contrast typography, expansive white space, and intentional asymmetry. We break the rigid "template" look by using overlapping elements—such as vehicle images bleeding over container edges—and a sophisticated layering system that communicates depth and premium quality without relying on dated shadows or heavy outlines.

---

## 2. Colors: Tonal Depth & High-Velocity Accents
The palette is a high-contrast study in tension between deep neutrals and a "vibrant engine red."

### Primary & Accent
- **Primary (`#b5000b`)**: Our signature "Racing Red." Use this for high-impact CTAs and critical brand moments.
- **Primary Container (`#e30613`)**: A more saturated version used for hover states or subtle background accents to add "soul" to the layout.

### Surface Hierarchy & The "No-Line" Rule
To achieve a bespoke feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined through tonal shifts:
- **Background (`#f9f9fc`)**: The base canvas.
- **Surface Container Low (`#f3f3f6`)**: Use for secondary content areas.
- **Surface Container Lowest (`#ffffff`)**: Use for primary cards or elevated content to create a natural "lift."

### The "Glass & Gradient" Rule
For floating elements (like navigation bars or quick-filters), use **Glassmorphism**:
- Background: `rgba(255, 255, 255, 0.7)` with a `backdrop-blur: 20px`.
- Use subtle linear gradients on CTAs: `linear-gradient(135deg, #b5000b 0%, #e30613 100%)`. This prevents the "flat" look and adds mechanical depth.

---

## 3. Typography: Authority in Motion
We pair a technical, wide-set display font with a highly legible, sophisticated body font.

- **Display & Headlines (Space Grotesk)**: This typeface's geometric, wide proportions evoke the technical precision of automotive engineering. Use `display-lg` (3.5rem) for hero statements with tight letter-spacing (-0.02em) to create an authoritative, "locked-in" look.
- **Body & Titles (Manrope)**: A modern sans-serif that balances the technical display face. It provides high readability for vehicle specs.
- **Labeling**: Use `label-md` (0.75rem) in all-caps with increased letter-spacing (0.05em) for technical categories (e.g., "SPECIFICATIONS," "MILEAGE").

---

## 4. Elevation & Depth: The Layering Principle
Instead of structural lines, hierarchy is conveyed through **Tonal Layering**.

- **The Stacking Rule**: Depth is achieved by placing lighter surfaces on darker ones. Example: A `surface-container-lowest` (#ffffff) vehicle card sitting on a `surface-container-low` (#f3f3f6) section background.
- **Ambient Shadows**: Use only for floating components. Shadows must be ultra-diffused: `box-shadow: 0 20px 40px rgba(26, 28, 30, 0.06)`. The tint is derived from the `on-surface` color, not pure black.
- **The Ghost Border**: If contrast is required for accessibility, use `outline-variant` (#e9bcb6) at **15% opacity**. This creates a "suggestion" of a border rather than a hard cage.

---

## 5. Components

### Navigation
- **The Kinetic Bar**: A fixed glassmorphic top-bar (`surface-container-lowest` at 80% opacity + blur). No bottom border. Use a subtle `surface-dim` shadow on scroll to indicate elevation.

### Buttons: Action in High Gear
- **Primary**: `primary` (#b5000b) background, `on-primary` (#ffffff) text. Border-radius: `md` (0.375rem). For a dynamic feel, the width should expand slightly on hover with a transition.
- **Secondary**: `secondary-container` (#e2e2e5) background. No border. This provides a "flush" look that integrates with the layout.

### Vehicle Cards
- **Structure**: No borders. Use `surface-container-lowest` (#ffffff).
- **Asymmetry**: Vehicle images should be "cut out" (PNG) and slightly overlap the top edge of the card container to break the grid.
- **Data Points**: Use `label-sm` for specs like "Manual" or "Petrol," styled as neutral chips using `secondary-container`.

### Input Fields
- **State**: Text inputs use `surface-container-low` with a `none` border. On focus, transition to a "Ghost Border" of `primary` at 20% opacity.

---

## 6. Do's and Don'ts

### Do's
- **DO** use generous white space. If you think there's enough space, add 16px more.
- **DO** use the `xl` (0.75rem) border radius for large imagery and the `md` (0.375rem) radius for interactive components to maintain a "technical yet approachable" balance.
- **DO** use "Racing Red" sparingly. It should be the spark plug of the design, not the fuel.

### Don'ts
- **DON'T** use 100% opaque black for text. Use `on-surface` (#1a1c1e) to keep the editorial feel soft and premium.
- **DON'T** use divider lines. Use a 48px or 64px vertical gap to separate sections.
- **DON'T** place high-saturation red text on dark backgrounds; use it only for buttons or small status indicators.
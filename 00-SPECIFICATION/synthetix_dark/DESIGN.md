# Design System Specification: High-End Editorial for Multi-Agent AI

## 1. Overview & Creative North Star

### Creative North Star: "The Orchestrated Intelligence"
This design system moves away from the "chat-in-a-box" trope of generic AI tools. Instead, it treats the multi-agent experience as a high-end editorial workspace. It is designed to feel like a premium command center where AI agents are not just chatbots, but sophisticated entities performing complex tasks.

The system breaks the standard "SaaS template" by utilizing **Atmospheric Depth** and **Intentional Asymmetry**. Rather than rigid grids and harsh borders, we use tonal shifts and expansive white space to guide the eye. We lean into the futuristic nature of AI through glassmorphism and subtle kinetic energy, ensuring the interface feels alive yet professionally grounded.

---

## 2. Colors

The palette is anchored in deep, midnight blues and charcoal foundations, providing a sophisticated backdrop for "Electric Blue" intelligence indicators.

### The "No-Line" Rule
**Strict Guideline:** 1px solid borders are prohibited for sectioning. 
Visual separation is achieved through:
- **Background Shifts:** Placing a `surface_container_low` sidebar against a `surface` main stage.
- **Tonal Transitions:** Using padding and color blocks to define the "Working Area" versus the "Agent Zone."

### Surface Hierarchy & Nesting
Treat the UI as physical layers of digital paper.
- **Foundation:** `surface` (#091421) is your desk.
- **Lower Level:** `surface_container_low` (#121C2A) for the global Navigation Bar.
- **Primary Workspace:** `surface_container` (#16202E) for the "Working Area."
- **Focus Elements:** `surface_container_highest` (#2B3544) for active agent cards or high-priority panels.

### The "Glass & Gradient" Rule
Floating elements, such as the **Prompt Bar**, should utilize Glassmorphism. Use `surface_bright` at 60% opacity with a `backdrop-filter: blur(12px)`. For primary CTAs, use a signature gradient: `primary` (#ADC6FF) to `primary_container` (#4D8EFF) at a 135° angle to create "visual soul."

---

## 3. Typography

Our typography balances futuristic precision with editorial readability.

*   **Display & Headlines:** **Space Grotesk**. This typeface provides a technical, "engineered" feel. Use `display-lg` (3.5rem) sparingly for high-impact data or empty states.
*   **Titles & Body:** **Manrope**. A modern geometric sans-serif that ensures long-form agent logs are legible and professional. Use `title-md` (1.125rem) for agent names and section headers.
*   **Labels & Metadata:** **Inter**. Utilized for the smallest granular details (e.g., timestamps, token counts).

**Editorial Hierarchy:** Use high contrast between `headline-lg` and `body-sm` to create a clear informational scent. Do not be afraid of large margins around text; breathing room is a luxury.

---

## 4. Elevation & Depth

### The Layering Principle
Hierarchy is conveyed through **Tonal Layering**. If the "Working Area" is `surface_container`, a secondary agent log panel should be `surface_container_high`. This creates a soft, natural lift that mimics ambient occlusion rather than synthetic shadows.

### Ambient Shadows
When an element must float (e.g., a context menu or the Prompt Bar):
- **Shadow:** Use `on_surface` color at 6% opacity.
- **Blur:** 32px to 48px.
- **Spread:** -4px to ensure the shadow feels tucked under the element, not spilled onto the canvas.

### The "Ghost Border" Fallback
If contrast is needed for accessibility, use a **Ghost Border**: `outline_variant` (#424754) at 15% opacity. This provides a "suggestion" of a boundary without the visual noise of a solid line.

---

## 5. Components

### The Prompt Bar (Signature Component)
Unlike standard input fields, the prompt bar should be a floating island (`surface_bright` with glassmorphism). 
- **Radius:** `xl` (1.5rem).
- **Icons:** Use `primary_fixed_dim` for the microphone and "play" icons to signify active intelligence.

### Agent Cards & Lists
- **No Dividers:** Lists in the sidebar or "Agent Zone" must use vertical spacing (`spacing.4`) or subtle background hover states (`surface_container_highest`) to separate items.
- **Active State:** Use a 2px vertical "glow" bar of `primary` on the left edge rather than a full background fill.

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `md` (0.75rem) corners, `label-md` uppercase typography.
- **Tertiary:** No background, `primary` text. Used for "Settings" or "Collapse" actions to keep the periphery clean.

### Chips (Agent Status)
Use `tertiary_container` for "Thinking" states and `primary_container` for "Active" states. Corners should always be `full` (9999px) to contrast against the architectural squareness of the main layout.

---

## 6. Do's and Don'ts

### Do:
- **Do** use the `spacing.8` (2rem) and `spacing.12` (3rem) tokens to create "Editorial Gutters" between the Navigation Bar and the Working Area.
- **Do** use `surface_container_lowest` for the absolute background of the app to make content containers feel like they are floating above a void.
- **Do** use `surface_tint` at 5% opacity over imagery to integrate visuals into the dark blue ecosystem.

### Don't:
- **Don't** use pure black (#000000) or pure white (#FFFFFF). Rely on the defined surface and "on-surface" tokens to maintain tonal depth.
- **Don't** use 1px dividers to separate chat messages. Use `body-md` for the message and `label-sm` (Inter) for the timestamp, separated by `spacing.3`.
- **Don't** use standard "drop shadows" on buttons; let the color and gradient define the interactivity.
- **Don't** crowd the "Agent Zone." If more than five agents are active, use a "Stacked Sheet" visual pattern where only the active agent is fully visible.

---

## 7. Layout Specification (Based on Wireframe)

- **Navigation Bar (Left):** `surface_container_low`. Width: 80px (collapsed) to 240px (expanded).
- **Working Area (Center):** `surface_container`. This is the primary stage for "Final Results."
- **Agent Zone (Right):** `surface`. A more recessed area for the "Thinking," "Actions," and "Feedback" logs. This separation ensures the user can focus on results while monitoring the process.
- **Prompt Bar (Bottom):** Centered within the Working Area, `xl` rounding, floating with an Ambient Shadow.
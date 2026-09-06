# PAIMANA: UI/UX & Design Document

PAIMANA is designed for high-level government officials, ministers, and portfolio managers. The UI cannot look like a standard, uninspired data-entry tool; it must command authority, build trust in the AI, and reduce cognitive load when analyzing 750+ projects.

---

## 1. The "Milky Matte" Aesthetic

We designed a custom theme called **Milky Matte**—a bright, premium, glassmorphism-inspired design system. It eschews harsh dark modes in favor of soft, translucent layers that feel modern and accessible.

### Core Color Palette
- **Background:** `bg-slate-50` (Very soft, off-white/gray for reduced eye strain).
- **Text:** `text-slate-800` (Deep slate, avoiding pure black #000 for better contrast accessibility).
- **Primary Accent:** `teal-600` (`#0d9488`). Used for active states, primary buttons, and positive indicators. Teal conveys trust and modernization.
- **Critical Accent:** `coral` / `rose-600` (`#e11d48`). Used exclusively for CRITICAL risk states, drawing the eye immediately without being an overly aggressive pure red.
- **Warning Accent:** `amber-500` (`#f59e0b`). Used for HIGH risk and escalating momentum.

### Glassmorphism (The `glass-panel`)
All cards and data containers use a custom Tailwind class:
```css
.glass-panel {
  @apply bg-white/70 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm;
}
```
This creates a layered depth effect, making the dashboard feel lightweight and deeply integrated rather than boxy and flat.

---

## 2. Micro-Animations & Interactivity

To make the dashboard feel alive and responsive, we heavily utilize `framer-motion`:

- **Staggered Page Loads:** When visiting the Dashboard or Project Details, components do not pop in instantly. They fade and slide up (`y: 15` to `0`) with a staggered delay (e.g., `staggerChildren: 0.1`). This guides the user's eye hierarchically from top to bottom.
- **Hover States:** Buttons, table rows, and map states scale slightly (`scale: 1.02`) and increase their shadow intensity on hover, providing tactile feedback.
- **Map Interactivity:** The Geospatial map uses smooth transitions. Hovering a state instantly fades in an intricate, dark-themed tooltip containing rich HTML data, while updating a side-panel with spring-physics progress bars.

---

## 3. Cognitive Load Reduction (Data Visualization)

A core UX principle of PAIMANA is **progressive disclosure**:
1. **Macro:** The Dashboard shows *only* counts and extreme priorities.
2. **Meso:** The Analytics and Map tabs show distributions and spatial context.
3. **Micro:** The Project Detail page shows the exact ML features.

### Iconography
We use `lucide-react` for consistent, stroked (2px width) icons.
- 🧠 `Brain` / `Sparkles` — Used strictly for AI/ML generated insights (Predictions, Prescriptions).
- 🚨 `AlertOctagon` — Used for CRITICAL risks.
- 📈 `TrendingUp` — Used for Risk Momentum.

### Skeleton Loaders
To prevent layout shift and blank screens during network requests, all pages implement `SkeletonLoader` components that pulse gently, mimicking the shape of the data that is about to arrive.

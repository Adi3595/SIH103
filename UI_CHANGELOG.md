# PAIMANA Frontend UI Fixes & Changes

This document outlines all visual and structural changes made to the PAIMANA frontend to align it with the finalized design system, implement correct contrast behaviors, and establish a dynamic theme switching system without touching the backend structure.

## 1. Typography Hierarchy
- **Primary UI Text**: Standardized the use of `Inter` font across the entire application interface for all general text and labels.
- **Data & Identifiers**: Configured `JetBrains Mono` as the primary font for metrics, tabular data, numerical readouts, and specific IDs. Implemented the `.tabular-nums` and `.font-mono` utilities to force alignment and enhance readability on data-heavy elements.

## 2. Design Tokens and Theme Switcher
- **Semantic CSS Architecture**: Restructured the root `index.css` to rely entirely on dynamic CSS variables (`--surface-page`, `--text-primary`, `--border-default`, `--surface-card`) rather than static colors.
- **Tailwind Mapping**: Re-mapped `tailwind.config.js` to point its color utilities directly to these CSS variables. Legacy hardcoded utilities (`bg-slate-50`, `text-slate-800`, `border-gray-200`) were eliminated.
- **Theme Toggling**: Introduced a `[data-theme="dark"]` selector in `index.css` allowing the entire palette to invert instantly.
- **Navbar Switcher**: Added a sun/moon icon toggle in `Header.tsx` allowing the user to seamlessly switch between Light and Dark mode.

## 3. Flat Elevation System
- Eliminated deep drop shadows (`shadow-lg`, `shadow-xl`) across standard card components.
- The `glass-card` and `glass-panel` elements were redesigned to rely on crisp solid borders (`var(--border-default)`) to distinguish boundaries, leading to a much cleaner, flatter look that works better in both themes.

## 4. Semantic Risk Colors
- Embedded dedicated semantic utilities into `index.css` (`.risk-critical`, `.risk-high`, `.risk-medium`, `.risk-low`, `.risk-improving`, `.risk-rising`).
- Components such as `RiskBadge` and `ProjectStateBadge` were updated to consume these classes, ensuring their backgrounds and text adjust smoothly between modes without losing semantic meaning.

## 5. Site-Wide Contrast & Alignment Fixes
- **Navbar Layout**: Removed the "Admin User" name, icon, and specific context menu from the far right side of the `Header.tsx`. Spacing and alignment naturally adapted to correctly align remaining elements.
- **Recharts Tooltips Sweep**: Replaced all hardcoded absolute colors inside Recharts `<Tooltip>` components (which were previously forcing `#fff` backgrounds with dark text, making them unreadable in dark mode). They now use `var(--surface-card)` and `var(--text-primary)`.
- **Absolute Color Fixes**: Removed scattered uses of stark color patches (e.g., `bg-amber-100` panels and `text-red-500` text in `PredictiveML` and `DataIngestion`) and swapped them to semantic tokens (`bg-brand/10` and `text-coral`). This removed jarring high-brightness blocks in dark mode environments.

## 6. AI Advisor Constraints
- **Preserved Identity**: Ensured the `AIAdvisor.tsx` card continues to use its specific, deep gradient (`linear-gradient(135deg, #151d1a, #1a2420)`) regardless of whether the site is in light mode or dark mode.
- **Prose Overrides**: Implemented `!important` CSS rules targeting `.ai-advisor-card .prose` inside `index.css` to force the Markdown-rendered text to stay visibly light/white at all times, overcoming theme inversions.

## 7. Global Refactoring
- A batch search-and-replace pipeline was executed across the entire `src/` directory to eliminate instances of manual absolute tailwind classes (e.g., `bg-white`, `text-black`, `bg-gray-100`) and migrate them fully to the new token system (`bg-card`, `text-primary`, `bg-sunken`).
- Adjusted `framer-motion` variant type definitions in `Dashboard.tsx` to clear build-time typescript warnings.

*(Note: No backend files, routes, or database configurations were modified during this process.)*

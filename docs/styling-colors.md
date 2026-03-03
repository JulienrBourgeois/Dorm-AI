# Styling: colors and animations (app/styles)

Brand colors and shared animations live under `app/styles/` so the app has one place for design tokens and motion.

## Location and usage

- **`app/styles/colors.css`** — Defines CSS custom properties and wires them into Tailwind v4 via `@theme`. Do not put other styles (resets, layout) here; this file is only for color variables.
- **`app/styles/animations/slide-up.css`** — Auth funnel and shared UI animations: slide-up (`fade-in-up`), fade-in, and shake. Defines `@keyframes` and utility classes (`.animate-fade-in-up`, `.animate-fade-in-up-cascade`, `.animate-fade-in`, `.animate-shake`).
- **`app/globals.css`** — Imports `./styles/colors.css` and `./styles/animations/slide-up.css` after `tailwindcss` so the theme and animations are available globally.

## Palette

| Token | Hex | Role |
|-------|-----|------|
| **Primary** | `#0F172A` | Deep Navy — institutional, security, multi-campus, strong admin presence; “university-level SaaS”. |
| **Primary (alt)** | `#111827` | Slightly lighter navy for hover/secondary surfaces. |
| **Secondary** | `#334155` | Cool Slate Gray — pairs with primary and white/light grays. |
| **Secondary (alt)** | `#475569` | Lighter slate for borders, muted text, or accents. |
| **Accent** | `#0EA5E9` | Sky Blue — interactive highlights, links, focus states, back buttons. |
| **Accent (alt)** | `#0284C7` | Darker sky blue for hover states on accent elements. |

## How to use

**Tailwind utilities** (preferred in components):

- `bg-primary`, `text-primary`, `border-primary`, `ring-primary`
- `bg-primary-alt`, `text-secondary`, `border-secondary`, `hover:bg-secondary`, etc.
- `text-accent`, `border-accent`, `bg-accent`, `hover:text-accent-alt`, etc.

**Raw CSS** (when not using Tailwind classes):

- `color: var(--primary);`
- `background: var(--secondary);`
- `border-color: var(--secondary-alt);`

## Changing colors

Edit **`app/styles/colors.css`** only. Update the `:root` variables; the `@theme inline` block references them, so Tailwind utilities and `var(...)` usage stay in sync.

For dark mode or overrides later, add a `@media (prefers-color-scheme: dark)` or a `.dark` block in the same file and redefine `--primary`, `--secondary`, etc. there.

## Animations

- **Slide-up** — `.animate-fade-in-up` runs a single 1s slide-up (opacity + translateY). Used for the login page wrapper.
- **Cascaded slide-up** — `.animate-fade-in-up-cascade` applies the same animation to each direct child with staggered delays (0s, 0.1s, 0.2s, …), so top-to-bottom content animates in sequence. Used by `AnimateStep` in `components/admin/ui.tsx` for every admin login step.
- **Fade-in** — `.animate-fade-in` for simple opacity fade (e.g. footer text).
- **Shake** — `.animate-shake` for error feedback (e.g. `ErrorMessage`).

To change duration, easing, or stagger interval, edit **`app/styles/animations/slide-up.css`** only.

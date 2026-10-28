# Sneller Snow & Grounds: Brand Brief for AI Assistants

> **Claude / AI assistant:** This file defines the visual brand for this project. Read it fully before writing any UI. Follow it exactly. If a request conflicts with this file, ask before deviating.
>
> Master source: the `sneller-brand` repo (`tokens.json` + `README.md`). Brief version: **2026.2**.

---

## Your setup checklist

When you start in a new project, do these in order:

1. **Detect the stack** (Tailwind v3/v4, plain CSS, a CMS, etc.) and tell me what you found.
2. **Install the theme.** Put the CSS in [Theme CSS](#theme-css) into the project's global stylesheet. Adapt it to the stack but keep every value the same.
   - Tailwind v4: map the role variables in `@theme` (for example `--color-primary: var(--primary);`).
   - Tailwind v3: map them in `theme.extend.colors`, `fontFamily`, `borderRadius` and `fontSize`.
   - Leave out the `.dark` block. Projects are light only unless I ask for dark mode (see [Dark mode](#dark-mode)).
3. **Load the fonts** with the Google Fonts link below, or `next/font` in a Next.js project.
4. **Summarize** what you changed and wait for my confirmation before you build pages.

## Hard rules

- **Use roles, not raw colors.** Style with `primary`, `background`, `muted-foreground` and the other role variables. Don't write hex values inline in components.
- **Stay in the palette.** No new colors, and no Tailwind default palette colors (blue-500, gray-700 and so on). If something truly needs a new color, ask me first.
- **Keep to the spacing scale:** 4, 8, 12, 16, 24, 32, 48 or 64px only.
- **Keep to the radius scale:** 8, 12, 16 or 20px, or full.
- **Don't let blue take over.** Sneller Blue should cover about 15% of any layout. Neutrals carry the other 80% or so.
- **Accessibility:**
  - White on Sneller Blue is allowed only for text **16px bold or larger** and for UI elements.
  - Never set small body text in Sneller Blue. Underline inline links.
  - Warning amber always gets dark text.
  - Never remove focus outlines. Use a 2px Sneller Blue ring with a 2px offset.
- **Fonts:** Roboto 600 for headings, with tight letter-spacing. Lato 400 for body text. Lato 700 for buttons and labels, because Lato has no 600 weight.

---

## Palette

| Name | Hex | Role |
|---|---|---|
| Sneller Blue | `#0A94D5` | Primary, links, focus ring |
| Rock Salt | `#ECE9E4` | Accent (soft warm neutral), highlight panels |
| Midnight Asphalt | `#121820` | Text on light · background on dark |
| Storm Charcoal | `#2F3944` | Secondary text · cards on dark · borders on dark |
| Steel Blade | `#5B6775` | Muted text, captions, icons |
| Winter Frost | `#D9E1EA` | Borders, dividers, muted fills |
| Snow Drift | `#F7FAFC` | Page background (light) |
| Blizzard White | `#FFFFFF` | Cards and surfaces (light) |
| Success | `#16A249` | Confirmations |
| Warning | `#F59F0A` | Caution (dark text only) |
| Error | `#B51C1C` · on dark `#D42121` | Errors, destructive actions |

**Chart order:** Sneller Blue, Rock Salt, Storm Charcoal, Steel Blade, Winter Frost. On dark backgrounds, use `#2BB0EE` for the blue and `#8A96A8` for Steel Blade.

## Typography

| Style | Size / line height | Font |
|---|---|---|
| Display | 44 / 52 | Roboto 600 |
| H1 | 36 / 44 | Roboto 600 |
| H2 | 28 / 36 | Roboto 600 |
| H3 | 22 / 30 | Roboto 600 |
| H4–H6 | 18 / 24 | Roboto 600 |
| Body large | 18 / 28 | Lato 400 |
| Body | 16 / 24 | Lato 400 |
| Small | 14 / 20 | Lato 400 |
| Caption | 12 / 16 | Lato 400 |
| Button / Label | 14–16 | Lato 700 |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Roboto:wght@500;600;700&display=swap" rel="stylesheet">
```

## Components

| Component | Recipe |
|---|---|
| Primary button | `primary` fill, `primary-foreground` text, Lato 700, 12px radius. On hover, 90% opacity |
| Outline button | 1px `primary` border and `primary` text. On hover, filled `primary` |
| Card | `card` surface, 1px `border`, 16px radius, light shadow. On hover, shadow grows and card lifts 2px |
| Featured card | Card with a border in `primary` at 20% opacity |
| Highlight card | Solid `accent` fill, 1px `border` |
| Status badge | Pale tint of the status color, dark text in the same hue, matching border |
| Lists | Bullet markers in `primary` |
| Gradient | 135°, from `primary` to `accent`. For hero or decorative use only, never behind body text |

---

## Theme CSS

This is the canonical theme. Adapt the syntax to the stack you're working in, but don't change any values.

```css
:root {
  /* Brand palette */
  --sneller-blue: #0A94D5;
  --rock-salt: #ECE9E4;
  --midnight-asphalt: #121820;
  --storm-charcoal: #2F3944;
  --steel-blade: #5B6775;
  --winter-frost: #D9E1EA;
  --snow-drift: #F7FAFC;
  --blizzard-white: #FFFFFF;

  /* Roles: light */
  --background: var(--snow-drift);
  --foreground: var(--midnight-asphalt);
  --card: var(--blizzard-white);
  --card-foreground: var(--midnight-asphalt);
  --popover: var(--blizzard-white);
  --popover-foreground: var(--midnight-asphalt);
  --primary: var(--sneller-blue);
  --primary-foreground: var(--blizzard-white);
  --secondary: var(--blizzard-white);
  --secondary-foreground: var(--storm-charcoal);
  --muted: var(--winter-frost);
  --muted-foreground: var(--steel-blade);
  --accent: var(--rock-salt);
  --accent-foreground: var(--midnight-asphalt);
  --border: var(--winter-frost);
  --input: var(--winter-frost);
  --ring: var(--sneller-blue);
  --success: #16A249;
  --warning: #F59F0A;
  --destructive: #B51C1C;
  --destructive-foreground: var(--blizzard-white);

  /* Type */
  --font-heading: "Roboto", system-ui, sans-serif;
  --font-body: "Lato", system-ui, sans-serif;

  /* Spacing (8pt grid) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;

  /* Radius */
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;
  --radius-full: 9999px;
}

/* Dark mode: opt-in only. Add this block only when dark mode is requested. */
.dark {
  --background: var(--midnight-asphalt);
  --foreground: var(--snow-drift);
  --card: var(--storm-charcoal);
  --card-foreground: var(--snow-drift);
  --popover: var(--storm-charcoal);
  --popover-foreground: var(--snow-drift);
  --secondary: var(--storm-charcoal);
  --secondary-foreground: var(--winter-frost);
  --muted: #2E3742;
  --muted-foreground: var(--winter-frost);
  --border: var(--storm-charcoal);
  --input: var(--storm-charcoal);
  --destructive: #D42121;
  --destructive-foreground: var(--snow-drift);
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 24px;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 600;
  letter-spacing: -0.01em;
}

button, label { font-family: var(--font-body); font-weight: 700; }

:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
```

### Dark mode

Dark mode is opt-in. Don't add it, a theme toggle or `dark:` classes unless I ask for dark mode. When I do, use the
`.dark` block above (toggled by a `.dark` class on `<html>`), plus the on-dark values in [Palette](#palette): Error
`#D42121`, and the lighter chart blue `#2BB0EE` and Steel Blade `#8A96A8`.

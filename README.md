# @millibar/tokens

Millibar brand colours, shared by every Millibar project (app.millibar.io, instructors, centers, divers, Millibar Nitrox, Academy).

- **Navy** for brand surfaces: headers, hero sections, CTA bands, footers, dark mode. Main tone `navy-800` `#0b1f3a`; gradient `#07152a → #0b2a4f → #134a7c`.
- **Ocean** for actions: buttons, links, focus. Primary `ocean-600` `#0072a5`.

`tokens.json` is the single source. Edit it, run `npm run build`, commit `dist/`, then tag a new version.

## Install

```bash
pnpm add github:MBAR-Millibar/millibar-tokens#v1.0.0
# or: npm install github:MBAR-Millibar/millibar-tokens#v1.0.0
```

Pin a tag so a project only changes colour when you bump it.

## Use

| You have | Import |
| --- | --- |
| Tailwind v4 + shadcn (Next.js landing sites) | `@import '@millibar/tokens/shadcn.css';` and `@import '@millibar/tokens/tailwind.css';` in `globals.css`, after `tailwindcss` |
| Tailwind v3 + shadcn (Millibar Nitrox) | `@import '@millibar/tokens/shadcn-hsl.css';` and `presets: [require('@millibar/tokens/tailwind-preset')]` in `tailwind.config` |
| Tailwind v4 without shadcn (Academy) | `@import '@millibar/tokens/tailwind.css';` |
| Plain CSS / Filament (app.millibar.io) | `@import '@millibar/tokens/tokens.css';` then use `var(--mbar-navy-800)`, `var(--mbar-gradient)` |

## What you get

- `tokens.css`: `--mbar-navy-{600…950}`, `--mbar-ocean-{50…950}`, `--mbar-logo`, `--mbar-gradient`, `--mbar-gradient-deep`.
- `tailwind.css` (v4): `navy-*`, `ocean-*` and `mbar-logo` colours; `bg-mbar-gradient` and `bg-mbar-gradient-deep` utilities.
- `shadcn.css` / `shadcn-hsl.css`: the shadcn variables (`--background`, `--primary`, …) for light and `.dark`, in hex (v4) or HSL triplets (v3).
- `tailwind-preset.cjs` (v3): the same colours and gradients.

Wider brand guidelines (typography, spacing, logo use) belong to the Millibar Design Kit (WEB-32).

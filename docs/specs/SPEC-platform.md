# SPEC-platform

## Objective

Foundation everything else sits on: Vite + React scaffold, design tokens (primitive → semantic → component), router, global layout (navbar, footer, font/size accessibility toggles), cartoon mascots, Framer Motion motion utilities.

## Key Decisions

- Tailwind 4 + CSS custom properties from `styles/tokens.css` (three-layer tokens; no raw hex in components).
- Fonts: Baloo 2 (headings) + Atkinson Hyperlegible (body); dyslexia-friendly toggle switches font via `html[data-font]`.
- Mascots: rebuild ToffyCat/JummiMouse/HootyOwl/DizzyDog/BunboRabbit as lightweight SVG components with idle animation via Framer Motion.

## Boundaries

- Never hardcode colors/spacing in components — always tokens.
- No page-specific logic here (pages live in their modules).

## Success Criteria

- `npm run dev` starts; tokens.css used by every component (validated); route shell renders all 5 mascots; font + size toggles persist; keyboard nav works.

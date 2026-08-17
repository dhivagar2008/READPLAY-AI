# SPEC-insights

## Objective

Parent dashboard at `/insights` (Google sign-in required): answers "what is my child struggling with?" in <10s.

- Today/yesterday/week practice minutes + sessions (from event log).
- Skill heatmap (mastery per skill, color-coded) with "strongest/needs practice" lists.
- AI summary (POST `/api/insights`): 2–3 sentence plain-language takeaway + recommended next steps (prefilled into lesson generator).
- Progress export (JSON) + clear-data button (parent-gated).

## Key Decisions

- Read-only view over `progress` store; no write paths.
- Charts: lightweight SVG bars (no chart lib) to keep bundle small; Framer Motion for transitions.
- AI summary cached 1h per profile; failure → local heuristics fallback (never blank).

## Boundaries

- No child data leaves the device except the AI summary request (containing only aggregated mastery numbers + weak skill names, no names/audio).

## Success Criteria

- Insights render from sample events with correct numbers (tested selector functions); AI summary degrades gracefully offline; sign-in gate works; export/clear flow works.

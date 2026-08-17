# SPEC-progress

## Objective

Per-child progress on the device: child profiles (name + mascot avatar), mastery % per skill, stars per lesson, practice history events. Storage: localStorage with a pure, tested reducer.

## Key Decisions

- Event log model (append-only): `{ id, ts, profileId, type: 'lesson_done'|'game_done'|'tutor_turn'|'read_attempt', payload }` — this feeds adaptive + insights.
- Mastery per skill: weighted update from lesson/game events (see SPEC-adaptive for the formula).
- Deleting a lesson removes its stars; profiles can be switched in navbar.

## Boundaries

- No cloud sync in v1; storage schema versioned (`readplayai:v2`).
- Export progress as JSON (parent copy) — no child PII beyond name entered locally.

## Success Criteria

- Switching profiles shows separate stars/mastery; events accumulate correctly (tested reducer); progress export works; localStorage migrations handled.

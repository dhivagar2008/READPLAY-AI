# SPEC-adaptive

## Objective

Skill model that turns progress events into a personalized next step:

- **Strength map:** per skill, mastery 0–100 computed from event history (correct/incorrect from games, lesson completion weight, recency decay).
- **Recommendation:** "Next up" = highest-priority skill = lowest mastery among _active_ skills (attempted but < 80), else new skills in curriculum order; difficulty scales with mastery.
- **AI hook:** recommended skill is pre-filled into the AI lesson generator ("Make me a lesson about short 'a' words").

## Key Decisions

- Pure function `recommendNext(profile, curriculum)` — fully unit-tested, no I/O.
- Mastery update: `mastery += (1 - mastery) * learningRate` on success; `mastery -= mastery * forgetRate` on miss; recency decay per day.
- Skills come from a static curriculum map (`src/data/curriculum.js`) that also drives content.

## Boundaries

- No recommendations without ≥ 3 events (avoid cold-start noise); suggestions are suggestions — child can always pick any lesson.

## Success Criteria

- `recommendNext` returns the weakest active skill; mastery math monotonic and bounded 0–100 (tested with property-style cases); generator prefills the weak skill.

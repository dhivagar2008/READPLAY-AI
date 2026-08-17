# SPEC-content

## Objective

The reading core: curated lessons (phonics, reading, math, science, social studies), the Reader with word-by-word TTS, and practice games (word match, mixed words, sight words). Content lives in `src/data/` as plain data files.

## Key Decisions

- Lesson format: `{ id, title, category, skillIds[], difficulty, words[], sentences[], gameHints }`.
- Reader: word-by-word highlight + TTS via `speechSynthesis` (Atkinson Hyperlegible + large size by default; `useSpeech` hook with unmount token invalidation).
- Games: rebuild the 3 existing game types; scoring feeds `progress` events (same event shape the adaptive engine consumes).

## Boundaries

- No AI at runtime for core content (must work offline).
- Games must announce score via aria-live.

## Success Criteria

- 15+ lessons across 5 categories; Reader reads aloud with highlight and stops cleanly on navigation; 3 game types playable and scored offline; lesson data schema validated by a test.

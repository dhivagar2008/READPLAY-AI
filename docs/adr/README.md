# ADR-001: Vitest 4 over Vitest 3 for the Vite 8 stack

**Status:** Accepted (2026-08)

## Context

The project uses Vite 8 (Rolldown) and `@vitejs/plugin-react` 6 (oxc transform, no Babel). Vitest 3 bundles its own older Vite copy, which cannot parse the automatic JSX runtime output of plugin-react 6 — tests failed with `React is not defined` at transform time.

## Decision

Use `vitest ^4` (which supports the Vite 8 ecosystem) with `@testing-library/react` and jsdom.

## Consequences

- Tests transform correctly with the oxc-based plugin-react.
- The test suite is pinned to the current Vite major; upgrades of Vite must be validated against Vitest in the same change.

# ADR-002: Append-only event log for progress

**Status:** Accepted (2026-08)

## Context

Progress must feed three consumers: stars (My Stars), the adaptive engine (suggestions), and the parent insights dashboard — and it must work fully offline with no backend.

## Decision

Store progress in `localStorage` as an append-only event log (`playlearn:progress`, versioned, shape `{ v: 1, events: [...] }`). Events are stamped with `ts` on record and never mutated. Derived views (stars, accuracy, weekly activity) are pure functions of the log.

## Consequences

- Every feature derives from one source of truth, so they can never disagree.
- Event types are additive: `lesson_started`, `lesson_completed`, `reading_scored`, `game_result`.
- Storage stays tiny; the log is append-only by design, which keeps history for insights.
- `recordEvent` deliberately stamps `Date.now()` — callers cannot inject timestamps, which keeps the log honest and tests deterministic.

# ADR-003: AI keys server-side only

**Status:** Accepted (2026-08)

## Context

The Make a Lesson and Tutor features call a generative model. Shipping a `VITE_` key bundles it into the public JavaScript.

## Decision

- Production: client POSTs to Vercel serverless functions (`/api/generate-lesson`, `/api/tutor`); the key lives in `AI_API_KEY` env on Vercel only.
- Local dev: the client falls back to a direct Gemini REST call using `VITE_AI_API_KEY` (dev convenience only; never set this on Vercel).
- No key / offline: graceful degradation — offline lesson templates, "Hooty is sleeping" in chat.
- Every AI response is treated as untrusted: validated against the lesson schema client-side, length-capped, rendered as text (no `innerHTML`).

## Consequences

- Keys never appear in the production bundle.
- Dev experience still works without a deployed backend.
- The AI endpoints are rate-limited per IP (15/min) and reject oversized payloads.

# ADR-004: Client-side reading feedback, no audio off-device

**Status:** Accepted (2026-08)

## Context

Reading feedback needs to score how well a child reads a sentence aloud, and the spec forbids transmitting audio off-device.

## Decision

Use the browser's SpeechRecognition API (Chrome) entirely on-device. Transcripts are scored client-side against the expected words using a small edit-distance matcher (`src/lib/feedback.js`): distance 0 = correct, ≤ 1 = close, otherwise missed. No audio ever leaves the device.

## Consequences

- Works offline; no backend involved.
- Non-Chrome browsers fall back to the existing tap-to-hear flow with a friendly note.
- SpeechRecognition transcripts are treated as untrusted input (normalised, length-limited, no rendering of raw transcript).

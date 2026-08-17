# SPEC-ai

## Objective

The AI layer:

1. **Lesson generator** — POST `/api/generate-lesson` (topic + target skill + difficulty) → lesson JSON (reuses existing serverless pattern; `AI_API_KEY` server-side, per-IP rate limit).
2. **Tutor chat** — POST `/api/tutor` with lesson context + child's question → patient, child-friendly answer (streaming optional; prompt constrains tone: short sentences, phonetic hints, encouragement).
3. **Reading feedback** — browser Web Speech API (`webkitSpeechRecognition`) captures the child reading a sentence aloud; client-side fuzzy match vs expected words → per-word accuracy; optional POST `/api/feedback` for a gentle voice-based diagnosis.

## Key Decisions

- All AI output validated client-side (JSON schemas) — treated as untrusted data (security skill: no `innerHTML`, no eval).
- Prompt templates stored in `api/prompts.js`; child profile (age, weak skills) included so tutor stays on-target.
- Graceful degradation: no key / offline → tutor button shows "AI is sleeping right now", core lessons unaffected.
- STT: English-only fallback chain (Chrome SpeechRecognition → manual word tap). Never transmit audio off-device.

## Boundaries

- AI keys server-side only; never log chat content; rate limit 15/min/IP.
- Tutor never answers with a grade; always encourages effort (dyslexia-sensitive copy).

## Success Criteria

- Lesson generation returns valid lesson JSON end-to-end (tested with mocked fetch; live test via `vercel dev`).
- Tutor responds within 10s with age-appropriate text; malformed AI output handled without crashing.
- Reading feedback scores a sentence and shows friendly per-word results; works offline in fallback mode.

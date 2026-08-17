# Implementation Plan: PlayLearn AI

## Overview

Rebuild of the ReadPlayAI dyslexia companion as a fresh codebase. React 19 + Vite + Tailwind 4, Google sign-in, offline-capable core, AI tutor + lesson generator + reading feedback (Gemini via Vercel serverless), adaptive skill model, parent insights dashboard. Old `playai/` remains untouched as reference.

## Architecture Decisions

- Fresh scaffold in `D:\open ai\readplay-ai`; versions verified against official docs before install.
- Event-log progress model (append-only) powers adaptive + insights.
- AI keys server-side only; STT stays on-device (Web Speech API).
- Three-layer design tokens; claymorphism language from the original app.
- Vitest + RTL for logic/components; browser verification via DevTools at milestones.

## Task List

### Phase 1: platform (scaffold + foundation)

- [ ] T1: Scaffold Vite + React app, verify versions (source-driven), npm install
- [ ] T2: Design tokens (tokens.css), Tailwind 4 setup, global styles, fonts
- [ ] T3: Router + App shell (Navbar, Footer, ScrollToTop), font/size a11y toggles
- [ ] T4: Cartoon mascots (5) as motion components + Framer Motion motion.js helpers

### Checkpoint: shell runs, tokens used, toggles persist, mascots animate

### Phase 2: content (reading core)

- [ ] T5: Curriculum + lesson data (18 lessons, 5 categories) with schema test
- [ ] T6: Home + Lessons pages (categories, filters, cards)
- [ ] T7: Reader component + useSpeech hook (word highlight, TTS, unmount invalidation)
- [ ] T8: Lesson page (reading flow, sentence practice, completion → progress events)
- [ ] T9: Games page + 3 game types (word match, mixed words, sight words) with scoring + aria-live
- [ ] T10: Create page UI (topic/difficulty form → calls ai module; graceful offline)

### Checkpoint: core loop playable offline end-to-end (lesson → game → stars)

### Phase 3: progress (profiles + storage)

- [ ] T11: storage reducer (event log, mastery, stars) — pure, tested
- [ ] T12: Profile picker/creator (name + mascot avatar), switch in navbar
- [ ] T13: Progress page (stars, streaks, recent activity) + export JSON

### Checkpoint: switching profiles isolates progress; reducer tests green

### Phase 4: identity

- [ ] T14: auth lib (GIS popup, session) + Login page
- [ ] T15: Insights route gating (parent sign-in; guest message)

### Checkpoint: sign-in/out works, /insights gated

### Phase 5: ai

- [ ] T16: Serverless functions: generate-lesson, tutor, feedback (+ rate limit, prompts.js)
- [ ] T17: ai.js client (payload builders, JSON schema validation, fallback states)
- [ ] T18: Tutor chat UI (lesson context, streaming-safe, a11y)
- [ ] T19: Reading feedback UI (STT capture → per-word result)
- [ ] T20: Create page wired to real generator

### Checkpoint: lesson generation + tutor work via `vercel dev`; offline fallbacks clean

### Phase 6: adaptive

- [ ] T21: curriculum.js skill map + mastery math (pure, property-tested)
- [ ] T22: recommendNext() + "Next up" on Home + generator prefill

### Checkpoint: recommendation targets weakest active skill

### Phase 7: insights

- [ ] T23: selector functions (practice minutes, heatmap, streaks) — tested
- [ ] T24: Insights page UI (SVG bars, lists, AI summary w/ fallback, export/clear)

### Checkpoint: parent answers "what is my child struggling with?" in <10s

### Phase 8: ship

- [ ] T25: Full test pass, lint, type check, build; console/a11y browser pass
- [ ] T26: README, ADRs, AGENTS.md; service worker + vercel.json
- [ ] T27: git init + commits; deploy to Vercel (with user)

## Risks and Mitigations

| Risk                                                    | Impact | Mitigation                                                      |
| ------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| Web Speech STT unavailable (Firefox/Safari)             | Med    | Manual tap-along fallback; detection + message                  |
| Gemini rate limits / outages                            | Med    | Rate limit client + server; graceful fallbacks; cached insights |
| React 19 + Tailwind 4 breaking changes vs training data | High   | source-driven-development: verify docs before writing           |
| Scope creep (classroom features)                        | Med    | Out-of-scope list in SPEC; features gated behind ask-first      |
| localStorage loss = lost progress                       | Med    | Export JSON; single-store schema versioned                      |

## Open Questions

- None blocking. Deploy creds needed at Phase 8.

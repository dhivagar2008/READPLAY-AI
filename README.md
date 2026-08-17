# PlayLearn AI

A gentle reading companion for children with dyslexia. Big clear letters, words that read aloud, games that make practice feel like play — plus an AI tutor, adaptive lesson suggestions, and parent insights.

## Features

- **18 ready-made lessons** across Phonics, Reading, Math, Science and Social Studies — short decodable words and sentences, validated by tests
- **Read-aloud everywhere**: every word and sentence can be spoken (Web Speech API), with word-by-word highlighting as the story is read
- **3 games**: word matching, mixed-up letters, and sight-word spotting (WordMatch, MixedWords, SightWords)
- **Make a Lesson**: type any topic and get a gentle AI-built lesson (graceful offline fallback — still works with no key and no internet)
- **Ask the Tutor**: child-friendly AI chat with lesson context (serverless, rate-limited)
- **Read it yourself**: SpeechRecognition-based sentence practice with per-word feedback (correct / so close / not yet)
- **My Stars**: progress tracking with stars (1 = started, 2 = completed)
- **Adaptive suggestions**: the Lessons page recommends what to do next based on reading accuracy
- **For Parents**: sign-in (Google) gated insights dashboard — activity, weekly rhythm, accuracy, and skills to watch
- **Accessibility**: dyslexia-friendly font and text-size toggles (persisted), reduced-motion support, keyboard-friendly, ARIA-labelled throughout

## Stack

- Vite 8 (Rolldown) + React 19 + react-router-dom 7 + framer-motion 13
- Tailwind CSS 4 via `@tailwindcss/vite` (no config file — design tokens in CSS)
- Vitest 4 + Testing Library + jsdom
- ESLint 9 flat config + Prettier 3
- Vercel serverless functions for AI (`api/`) — API keys live server-side only

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
```

Optional: copy `.env.example` to `.env.local` and add a Gemini API key to try AI lesson generation locally (dev only — keys are never bundled for production).

## Scripts

| Script                  | What it does                                       |
| ----------------------- | -------------------------------------------------- |
| `npm run dev`           | Vite dev server                                    |
| `npm run build`         | Production build to `dist/`                        |
| `npm run preview`       | Preview the production build                       |
| `npm test`              | Run the full Vitest suite (84 tests)               |
| `npm run test:watch`    | Watch mode                                         |
| `npm run test:coverage` | Coverage report                                    |
| `npm run lint`          | ESLint + Prettier check (part of the quality gate) |
| `npm run lint:fix`      | Auto-fix lint issues                               |
| `npm run typecheck`     | `tsc --noEmit`                                     |

## How progress works

All progress lives in the browser as an append-only event log in `localStorage` under `playlearn:progress`:

- `lesson_started` / `lesson_completed` → stars (1 / 2)
- `reading_scored` → per-word reading accuracy from sentence practice
- `game_result` → game scores

The adaptive engine (`src/lib/adaptive.js`) and parent insights (`src/lib/insights.js`) read the same event log, so every feature is consistent and works fully offline.

## AI endpoints (Vercel serverless)

- `POST /api/generate-lesson` — build a lesson for the Make a Lesson page
- `POST /api/tutor` — answer a child's reading question

Both are rate-limited per IP (15/min), validated server-side, and treat the AI output as untrusted data. Prompts live in `api/prompts.js`. The client validates and sanitises every AI response before rendering it.

## Docs

- `SPEC.md` — project spec
- `docs/specs/` — per-module specs (content, progress, AI, adaptive, insights, identity, platform)
- `docs/adr/` — architecture decision records
- `tasks/plan.md` — implementation plan and status

## Deploying

```bash
npx vercel --prod
```

Set `AI_API_KEY` (and optionally `AI_PROVIDER`, `AI_BASE_URL`, `AI_MODEL`) in Vercel env — never as `VITE_` vars. Set `VITE_GOOGLE_CLIENT_ID` for sign-in and add your Vercel origin to the Google OAuth client's authorized JavaScript origins.

## License

Private project — all rights reserved.

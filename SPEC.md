# Spec: PlayLearn AI — AI-Assisted Learning for Dyslexia

## Objective

Rebuild the ReadPlayAI dyslexia reading companion from scratch: same child-facing core (lessons, games, read-aloud) with AI as the core of the experience — an AI tutor chat, AI reading feedback, and adaptive lesson paths. Parents get an insights dashboard ("what is my child struggling with?"). The old `playai/` codebase stays untouched as reference; this is a fresh codebase in `D:\open ai\readplay-ai`.

## Users

- **Child (~5–12, dyslexia):** practices reading through lessons and games at home, using an AI tutor and read-aloud support.
- **Parent:** reviews insights (time-on-task, skill strengths/weaknesses, AI recommendations) — no child accounts to manage.

## Capability Map

| Module id | Responsibility                                                                                 | Depends on         |
| --------- | ---------------------------------------------------------------------------------------------- | ------------------ |
| platform  | Vite + React scaffold, design tokens, router, layout, mascots, fonts/a11y tools                | —                  |
| identity  | Google sign-in (popup, client-side), session in localStorage                                   | platform           |
| content   | Lessons (phonics/reading/math/science/social), Reader with TTS, games                          | platform           |
| progress  | Child profiles (per device), mastery per skill, stars, history in localStorage                 | content            |
| ai        | Serverless functions: lesson generator, tutor chat, feedback; browser STT for reading feedback | content, platform  |
| adaptive  | Skill model: strength map → recommended next lesson/difficulty (personalized + AI)             | progress, ai       |
| insights  | Parent dashboard: trends, weak skills, AI recommendations                                      | progress, adaptive |

**Build order:** platform → content → progress → identity → ai → adaptive → insights

## Tech Stack

| Layer      | Choice                                                                     | Verified against    |
| ---------- | -------------------------------------------------------------------------- | ------------------- |
| Framework  | React 19 + Vite                                                            | react.dev, vite.dev |
| Styling    | Tailwind CSS 4 + CSS tokens (design-system skill)                          | tailwindcss.com     |
| Routing    | react-router v7                                                            | reactrouter.com     |
| Animation  | Framer Motion 12 (motion)                                                  | framer.com/motion   |
| Tests      | Vitest + React Testing Library                                             | vitest.dev          |
| AI         | Gemini via Vercel serverless functions; browser Web Speech API (TTS + STT) | —                   |
| Deployment | Vercel + service worker offline shell                                      | vercel.com          |

Version numbers will be verified against official docs before `npm install` (source-driven-development).

## Commands

```
Dev:          npm run dev
Test:         npm test            (vitest run --coverage for coverage)
Lint/format:  npm run lint        (eslint + prettier --check)
Type check:   npx tsc --noEmit
Build:        npm run build
Preview:      npm run preview
AI local:     npx vercel dev      (runs serverless functions locally)
Deploy:       npx vercel --prod --yes
```

## Project Structure

```
src/
  main.jsx, App.jsx, router.jsx
  styles/         → tokens.css (design tokens), global.css
  lib/            → storage, tts, stt, auth, ai, adaptive, motion
  hooks/          → useSpeech, useAuth, useProfiles, useProgress
  components/     → layout, mascots/, Reader, GameBits, Navbar, Footer
  pages/          → Home, Lessons, Lesson, Games, Create, Progress,
                    Tutor, Insights (parent), Login
  data/           → lessons, phonics, skills, games
api/              → generate-lesson.js, tutor.js, feedback.js
tests/            → unit tests beside source (component.test.jsx)
public/           → sw.js (offline shell), icons, favicon
```

## Code Style

- Function components + hooks only; named exports; colocated tests `X.test.jsx`.
- UI: claymorphism (chunky 3D borders), teal primary, Baloo 2 headings + Atkinson Hyperlegible body, `--space-*` 8dp scale, dyslexia font toggle `html[data-font]`, text size `html[data-size]`.
- All text targets a 9-year-old reading level; every screen reachable by keyboard; touch targets ≥ 44px.
- Example (component style):

```jsx
export function SkillChip({ skill, mastery, onClick }) {
  return (
    <button type="button" onClick={onClick} className="chip">
      <span className="chip__label">{skill.name}</span>
      <span className="chip__meter" aria-label={`${mastery}% mastered`}>
        <span style={{ width: `${mastery}%` }} />
      </span>
    </button>
  );
}
```

## Testing Strategy

- **Unit (Vitest + RTL):** storage reducer, adaptive skill model, tts/stt wrappers (mocked), ai.js payload builders.
- **Component:** lessons list, reader, game scoring, tutor message rendering, insights chart data.
- **Browser verification:** Chrome DevTools MCP where available (browser-testing skill) for console errors, a11y tree, screenshots at each milestone.
- Coverage expectation: ≥ 80% on `lib/` logic; components smoke-tested.

## Boundaries

- **Always:** run `npm test` + `npm run build` before each commit; keyboard + screen-reader pass on new screens; dyslexia font/size toggles present; AI output treated as untrusted data.
- **Ask first:** adding dependencies, changing auth, changing the AI provider/keys, schema-shaped storage changes, deploying to Vercel, any public-facing copy.
- **Never:** put AI keys in the browser bundle; log personal data (child names, speech audio); commit `.env` files; break offline core-lesson usage; collect data beyond the device (no analytics of kids' data).

## Success Criteria

- Child can complete a lesson and 2+ games offline; AI tutor and feedback work when online.
- Adaptive engine recommends a lesson targeting the child's weakest skill; AI-generated lesson can target that skill.
- Parent can answer "what is my child struggling with?" from the Insights page in under 10 seconds.
- Zero console errors; WCAG AA contrast; works at 320px–1440px.
- New codebase passes lint, type check, tests, build; deployed to Vercel.

## Resolved Decisions

- App name: **PlayLearn AI**.
- Lesson count: 18 curated (Phonics 4, Reading 4, Math 4, Science 3, Social Studies 3).
- AI model: Gemini 2.5 Flash default for tutor + lesson generation (fast, cheap); configurable via `AI_MODEL`; `AI_MODEL_INSIGHTS` may use a Pro model for parent summaries.

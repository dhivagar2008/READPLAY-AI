import { useState } from "react";
import { Link } from "react-router-dom";
import { lessons } from "../data/lessons.js";
import { categoryMeta } from "../data/categories.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { FadeUp, MotionPage } from "../lib/motion.jsx";
import {
  WordMatch,
  MixedWords,
  SightWords,
} from "../components/games/Games.jsx";
import { recordGameResult } from "../lib/game.js";
import { JummiMouse } from "../components/mascots/Mascots.jsx";

const GAME_META = [
  {
    id: "wordmatch",
    label: "Word Match",
    emoji: "🔊",
    blurb: "Listen, then find the matching word.",
  },
  {
    id: "mixedwords",
    label: "Mixed Words",
    emoji: "🔤",
    blurb: "Spell the word from scrambled letters.",
  },
  {
    id: "sightwords",
    label: "Sight Words",
    emoji: "👀",
    blurb: "Spot the spoken word, fast!",
  },
];

export function Games() {
  const { speak, stop } = useSpeech();
  const [lesson, setLesson] = useState(null);
  const [game, setGame] = useState(null);
  const [result, setResult] = useState(null);

  const startGame = (gameId) => {
    stop();
    setResult(null);
    setGame(gameId);
  };

  const onDone = (score, total) => {
    const meta = { game, score, total };
    recordGameResult(lesson.id, lesson.skillIds, game, score, total);
    setResult(meta);
  };

  if (lesson && game && !result) {
    const props = { words: lesson.words, onDone, speak };
    return (
      <MotionPage id="main" className="mx-auto max-w-4xl px-4 py-10">
        <FadeUp className="flex flex-wrap items-center gap-3">
          <Link
            to="/games"
            className="text-primary-dark no-underline"
            onClick={() => setLesson(null)}
          >
            ← Games
          </Link>
          <span className="chip border-0 bg-primary-light text-primary-dark">
            {lesson.title}
          </span>
          <span className="ml-auto font-display text-lg font-bold">
            Score: {result?.score ?? 0}
          </span>
        </FadeUp>
        <FadeUp className="mt-6">
          {game === "wordmatch" && <WordMatch {...props} />}
          {game === "mixedwords" && <MixedWords {...props} />}
          {game === "sightwords" && <SightWords {...props} />}
        </FadeUp>
        <FadeUp className="mt-4 flex gap-3">
          <button
            type="button"
            className="btn-clay btn-clay--ghost"
            onClick={() => setGame(null)}
          >
            Change game
          </button>
          <button
            type="button"
            className="btn-clay btn-clay--ghost"
            onClick={() => startGame(game)}
          >
            ↺ Restart
          </button>
        </FadeUp>
      </MotionPage>
    );
  }

  if (lesson && game && result) {
    const meta = GAME_META.find((g) => g.id === game);
    return (
      <MotionPage
        id="main"
        className="mx-auto max-w-2xl px-4 py-16 text-center"
      >
        <FadeUp>
          <JummiMouse className="mx-auto w-24" aria-hidden="true" />
          <h1 className="mt-4 text-4xl">Well played!</h1>
          <p className="mt-2 text-lg" aria-live="polite">
            You scored {result.score} of {result.total} in {meta.label}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="btn-clay"
              onClick={() => startGame(game)}
            >
              Play again
            </button>
            <button
              type="button"
              className="btn-clay btn-clay--ghost"
              onClick={() => setGame(null)}
            >
              Try another game
            </button>
            <Link
              to="/lessons"
              className="btn-clay btn-clay--ghost no-underline"
            >
              More lessons
            </Link>
          </div>
        </FadeUp>
      </MotionPage>
    );
  }

  return (
    <MotionPage id="main" className="mx-auto max-w-4xl px-4 py-10">
      <FadeUp>
        <h1 className="text-4xl">Games</h1>
        <p className="mt-1 text-text-muted">
          Pick a lesson, then choose a game to play with its words.
        </p>
      </FadeUp>

      <FadeUp className="mt-6">
        <h2 className="text-xl">1 · Choose a lesson</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((l) => {
            const meta = categoryMeta(l.category);
            return (
              <button
                key={l.id}
                type="button"
                className={`card-clay text-left transition hover:-translate-y-0.5 ${
                  lesson?.id === l.id ? "border-primary bg-primary-light" : ""
                }`}
                aria-pressed={lesson?.id === l.id}
                onClick={() => setLesson(l)}
              >
                <span className={`chip border-0 ${meta.tone}`}>
                  <span aria-hidden="true">{meta.emoji}</span> {meta.label}
                </span>
                <p className="mt-2 font-display text-lg font-bold">{l.title}</p>
              </button>
            );
          })}
        </div>
      </FadeUp>

      {lesson && (
        <FadeUp className="mt-8">
          <h2 className="text-xl">2 · Pick a game</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {GAME_META.map((g) => (
              <button
                key={g.id}
                type="button"
                className="card-clay text-left transition hover:-translate-y-0.5"
                onClick={() => startGame(g.id)}
              >
                <p className="text-3xl" aria-hidden="true">
                  {g.emoji}
                </p>
                <p className="mt-2 font-display text-lg font-bold">{g.label}</p>
                <p className="mt-1 text-sm text-text-muted">{g.blurb}</p>
              </button>
            ))}
          </div>
        </FadeUp>
      )}
    </MotionPage>
  );
}

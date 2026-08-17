import { useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORY_META } from "../data/categories.js";
import { generateLesson } from "../lib/ai.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { Reader } from "../components/Reader.jsx";
import { FadeUp, MotionPage } from "../lib/motion.jsx";
import { HootyOwl } from "../components/mascots/Mascots.jsx";

export function Create() {
  const { speak } = useSpeech();
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("phonics");
  const [difficulty, setDifficulty] = useState(1);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);

  const generate = async (event) => {
    event.preventDefault();
    if (!topic.trim()) return;
    setStatus("loading");
    try {
      const { lesson } = await generateLesson({ topic, category, difficulty });
      setResult(lesson);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  };

  return (
    <MotionPage id="main" className="mx-auto max-w-3xl px-4 py-10">
      <FadeUp>
        <h1 className="text-4xl">Make a Lesson</h1>
        <p className="mt-1 text-text-muted">
          Tell us a topic, and the AI tutor builds a gentle lesson for it.
          Offline? We&apos;ll still make one.
        </p>
      </FadeUp>

      {status === "idle" || status === "error" ? (
        <FadeUp>
          <form
            className="card-clay mt-6 flex flex-col gap-4"
            onSubmit={generate}
          >
            <label className="flex flex-col gap-1">
              <span className="font-display font-bold">Topic</span>
              <input
                type="text"
                className="input-clay"
                placeholder="e.g. baby dinosaurs, the moon, bees…"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </label>

            <fieldset>
              <legend className="font-display font-bold">Subject</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(CATEGORY_META).map(([value, meta]) => (
                  <button
                    key={value}
                    type="button"
                    className="chip"
                    aria-pressed={category === value}
                    onClick={() => setCategory(value)}
                  >
                    <span aria-hidden="true">{meta.emoji}</span> {meta.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="font-display font-bold">Difficulty</legend>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className="chip"
                    aria-pressed={difficulty === level}
                    onClick={() => setDifficulty(level)}
                  >
                    {level === 1
                      ? "Gentle"
                      : level === 2
                        ? "Just right"
                        : "Challenging"}
                  </button>
                ))}
              </div>
            </fieldset>

            {status === "error" && (
              <p role="alert" className="text-danger">
                Something went wrong making the lesson. Try again, or use a
                ready-made lesson.
              </p>
            )}

            <button
              type="submit"
              className="btn-clay w-full sm:w-auto"
              disabled={!topic.trim()}
            >
              Make my lesson
            </button>
          </form>
        </FadeUp>
      ) : status === "loading" ? (
        <FadeUp className="card-clay mt-6 text-center">
          <HootyOwl className="mx-auto w-20" aria-hidden="true" />
          <p className="mt-3 font-display text-lg font-bold" role="status">
            Hooty is thinking up a lesson…
          </p>
        </FadeUp>
      ) : (
        <FadeUp className="mt-6 flex flex-col gap-4">
          <div className="card-clay">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl">{result.title}</h2>
              <button
                type="button"
                className="btn-clay btn-clay--ghost ml-auto px-4 py-1 text-sm"
                onClick={() => {
                  setResult(null);
                  setStatus("idle");
                }}
              >
                Make another
              </button>
            </div>
            <ul className="mt-4 flex flex-wrap gap-3" aria-label="New words">
              {result.words.map((word) => (
                <li key={word}>
                  <button
                    type="button"
                    onClick={() => speak(word)}
                    className="word-big rounded-xl bg-surface px-4 py-2 shadow-md transition hover:bg-surface-alt"
                    aria-label={`Hear the word ${word}`}
                  >
                    {word}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="card-clay">
            <Reader sentences={result.sentences} />
          </div>
          <p className="text-sm text-text-muted">
            Made with {result.words.length} words and {result.sentences.length}{" "}
            sentences. Practise them here any time — or{" "}
            <Link to="/lessons" className="text-primary-dark">
              try a ready-made lesson
            </Link>
            .
          </p>
        </FadeUp>
      )}
    </MotionPage>
  );
}

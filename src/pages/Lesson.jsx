import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { lessons } from "../data/lessons.js";
import { categoryMeta } from "../data/categories.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { Reader } from "../components/Reader.jsx";
import { SentencePractice } from "../components/SentencePractice.jsx";
import { FadeUp, MotionPage } from "../lib/motion.jsx";
import { HootyOwl } from "../components/mascots/Mascots.jsx";
import {
  hasEvent,
  loadStore,
  recordEvent,
  saveStore,
} from "../lib/progress.js";

export function Lesson() {
  const { slug } = useParams();
  const lesson = lessons.find((l) => l.id === slug);
  const { speak } = useSpeech();
  const [step, setStep] = useState("words");
  const [completed, setCompleted] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!lesson) return;
    startedRef.current = true;
    const store = recordEvent(loadStore(), {
      type: "lesson_started",
      lessonId: lesson.id,
      skillIds: lesson.skillIds,
    });
    saveStore(store);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  const onStoryCompleted = useCallback(() => {
    if (!lesson) return;
    const store = recordEvent(loadStore(), {
      type: "lesson_completed",
      lessonId: lesson.id,
      skillIds: lesson.skillIds,
    });
    saveStore(store);
    setCompleted(true);
  }, [lesson]);

  if (!lesson) {
    return (
      <MotionPage
        id="main"
        className="mx-auto max-w-3xl px-4 py-16 text-center"
      >
        <h1 className="text-3xl">Hmm, that lesson took a wrong turn</h1>
        <p className="mt-4 text-text-muted">We could not find this lesson.</p>
        <Link to="/lessons" className="btn-clay mt-6">
          Back to lessons
        </Link>
      </MotionPage>
    );
  }

  const meta = categoryMeta(lesson.category);
  const alreadyDone =
    completed || hasEvent(loadStore(), lesson.id, "lesson_completed");
  const practiceSentence = lesson.sentences[lesson.sentences.length - 1];

  return (
    <MotionPage id="main" className="mx-auto max-w-4xl px-4 py-10">
      <FadeUp className="flex flex-wrap items-center gap-3">
        <Link to="/lessons" className="text-primary-dark no-underline">
          ← Lessons
        </Link>
        <span className={`chip border-0 ${meta.tone}`}>
          <span aria-hidden="true">{meta.emoji}</span> {meta.label}
        </span>
        <h1 className="w-full text-3xl sm:text-4xl">{lesson.title}</h1>
      </FadeUp>

      <FadeUp
        className="mt-4 flex gap-2"
        role="tablist"
        aria-label="Lesson steps"
      >
        {[
          { id: "words", label: "Words" },
          { id: "story", label: "Story" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={step === tab.id}
            className="chip"
            onClick={() => setStep(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </FadeUp>

      {step === "words" ? (
        <FadeUp className="mt-6">
          <p className="text-text-muted">
            Tap a word to hear it. Say it out loud after you hear it!
          </p>
          <ul className="mt-4 flex flex-wrap gap-3" aria-label="Lesson words">
            {lesson.words.map((word) => (
              <li key={word}>
                <button
                  type="button"
                  onClick={() => speak(word)}
                  className="word-big rounded-xl bg-surface px-4 py-2 shadow-md transition hover:-translate-y-0.5 hover:bg-surface-alt"
                  aria-label={`Hear the word ${word}`}
                >
                  {word}
                </button>
              </li>
            ))}
          </ul>
        </FadeUp>
      ) : (
        <FadeUp className="mt-6 flex flex-col gap-4">
          <Reader
            sentences={lesson.sentences}
            onCompleted={onStoryCompleted}
            autoPlay={!alreadyDone}
          />
          <SentencePractice
            sentence={practiceSentence}
            lessonId={lesson.id}
            skillIds={lesson.skillIds}
          />
        </FadeUp>
      )}

      {alreadyDone && (
        <FadeUp className="card-clay mt-8 flex flex-wrap items-center gap-4 bg-yellow-100 text-center sm:text-left">
          <HootyOwl className="w-16" />
          <div className="flex-1">
            <h2 className="text-2xl">Hooray — you did it!</h2>
            <p className="mt-1 text-text-muted">
              This lesson is complete. Listen to the story again, or try a game.
            </p>
          </div>
          <Link to="/games" className="btn-clay">
            Play a game
          </Link>
        </FadeUp>
      )}
    </MotionPage>
  );
}

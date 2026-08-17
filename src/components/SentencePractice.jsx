import { useEffect, useRef, useState } from "react";
import {
  createRecognizer,
  isRecognitionSupported,
} from "../lib/recognition.js";
import { scoreReading } from "../lib/feedback.js";
import { loadStore, recordEvent, saveStore } from "../lib/progress.js";
import { useSpeech } from "../hooks/useSpeech.js";

function StatusChip({ status, word }) {
  const styles = {
    correct: "bg-success text-white",
    close: "bg-warning text-white",
    missed: "bg-surface-strong text-text-muted",
  };
  return (
    <span
      className={`rounded-xl px-3 py-1 font-display font-bold ${styles[status]}`}
      aria-label={`${word}: ${status === "correct" ? "great" : status === "close" ? "so close" : "not yet"}`}
    >
      {word}
    </span>
  );
}

export function SentencePractice({ sentence, lessonId, skillIds }) {
  const { speak } = useSpeech();
  const [listening, setListening] = useState(false);
  const [score, setScore] = useState(null);
  const [error, setError] = useState("");
  const recRef = useRef(null);

  const supported = isRecognitionSupported();
  const expected = sentence.split(/\s+/);

  useEffect(() => () => recRef.current?.stop(), []);

  const recordScore = (result) => {
    if (!lessonId) return;
    const store = recordEvent(loadStore(), {
      type: "reading_scored",
      lessonId,
      skillIds: skillIds || [],
      score: {
        correct: result.correct,
        close: result.close,
        missed: result.missed,
        total: result.total,
      },
    });
    saveStore(store);
  };

  const toggleListen = () => {
    setError("");
    if (listening) {
      recRef.current?.stop();
      return;
    }
    if (!supported) return;
    try {
      const rec = createRecognizer();
      recRef.current = rec;
      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join(" ");
        const result = scoreReading(transcript, expected);
        recordScore(result);
        setScore(result);
        setListening(false);
      };
      rec.onerror = () => {
        setError("I could not hear you — check the microphone and try again.");
        setListening(false);
      };
      rec.onend = () => setListening(false);
      rec.start();
      setListening(true);
    } catch {
      setError("Listening is not ready here — tap the words instead.");
    }
  };

  const heardTotal = score ? score.correct + score.close : 0;

  return (
    <section
      className="rounded-2xl border-2 border-dashed border-border bg-surface-alt p-4"
      aria-label="Read it yourself"
    >
      <p className="font-display text-lg font-bold">Read it yourself</p>
      <p className="mt-1 text-lg leading-relaxed text-text">{sentence}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-clay btn-clay--ghost"
          onClick={() => speak(sentence)}
        >
          Hear it first
        </button>
        {supported ? (
          <button
            type="button"
            className="btn-clay"
            onClick={toggleListen}
            aria-pressed={listening}
          >
            {listening ? "Listening… tap to stop" : "Try reading it"}
          </button>
        ) : (
          <p className="self-center text-sm text-text-muted">
            Mic not available here — tap the words in the story to hear them.
          </p>
        )}
      </div>

      {listening && (
        <p className="mt-3 text-text-muted" role="status">
          Go ahead — read the sentence out loud.
        </p>
      )}
      {error && (
        <p className="mt-3 text-danger" role="alert">
          {error}
        </p>
      )}
      {score && (
        <div className="mt-4">
          <p className="font-display font-bold">
            {heardTotal === expected.length
              ? "Wow, you got every word! You are a star!"
              : `You read ${heardTotal} of ${expected.length} words. Keep going!`}
          </p>
          <ul
            className="mt-2 flex flex-wrap gap-2"
            aria-label="Word by word results"
          >
            {score.results.map((r, i) => (
              <li key={i}>
                <StatusChip status={r.status} word={r.expected} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn-clay btn-clay--ghost mt-3"
            onClick={toggleListen}
          >
            Try again
          </button>
        </div>
      )}
    </section>
  );
}

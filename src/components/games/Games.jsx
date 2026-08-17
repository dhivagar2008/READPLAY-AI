import { useRef, useState } from "react";
import { takeN, scrambleWord } from "../../lib/game.js";

function SpeakCard({ word, onSpeak }) {
  return (
    <button
      type="button"
      className="card-clay flex min-h-20 flex-col items-center justify-center gap-1 p-3 text-center transition hover:-translate-y-0.5"
      onClick={() => onSpeak(word)}
      aria-label={`Listen: ${word}`}
    >
      <span aria-hidden="true" className="text-2xl">
        🔊
      </span>
      <span className="text-sm text-text-muted">Listen</span>
    </button>
  );
}

function SeeCard({ word, isMatched, onPick }) {
  return (
    <button
      type="button"
      disabled={isMatched}
      className="card-clay word-big min-h-20 p-3 text-center transition hover:-translate-y-0.5 disabled:opacity-40"
      onClick={() => onPick(word)}
    >
      {isMatched ? "✓" : word}
    </button>
  );
}

export function WordMatch({ words, onDone, speak }) {
  const pairs = useRef(
    takeN(words, 4).map((word) => ({ word, id: `${word}-${Math.random()}` })),
  );
  const [heardWord, setHeardWord] = useState(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const total = pairs.current.length;

  const hearWord = (word) => {
    setHeardWord(word);
    speak(word);
  };

  const pickSee = (word) => {
    if (!heardWord) {
      setMessage("Listen to a word first!");
      return;
    }
    if (word === heardWord) {
      const next = matchedCount + 1;
      setMatchedCount(next);
      setScore(next);
      setMessage(`Match! ${word}. Score ${next}!`);
      if (next === total) setTimeout(() => onDone(next, total), 600);
    } else {
      setMessage("Not that one — listen again.");
    }
    setHeardWord(null);
  };

  return (
    <div className="card-clay">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pairs.current.map(({ word, id }) => (
          <SpeakCard key={`hear-${id}`} word={word} onSpeak={hearWord} />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {pairs.current.map(({ word, id }) => (
          <SeeCard
            key={`see-${id}`}
            word={word}
            isMatched={false}
            onPick={pickSee}
          />
        ))}
      </div>
      <p
        className="mt-4 text-center font-display text-lg font-bold"
        aria-live="polite"
      >
        {message || "Tap a speaker, then tap its word."}
      </p>
    </div>
  );
}

export function MixedWords({ words, onDone, speak }) {
  const targets = useRef(
    takeN(words, 4).map((word) => ({ word, hint: scrambleWord(word) })),
  );
  const [round, setRound] = useState(0);
  const [built, setBuilt] = useState("");
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");

  const { word, hint } = targets.current[round] ?? { word: "", hint: "" };

  const pressLetter = (letter) => {
    const next = built + letter;
    setBuilt(next);
    if (next === word) {
      const nextScore = score + 1;
      setScore(nextScore);
      setMessage(`You spelled ${word}!`);
      speak(word);
      if (round + 1 >= targets.current.length) {
        setTimeout(() => onDone(nextScore, targets.current.length), 700);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
          setBuilt("");
        }, 900);
      }
    } else if (!word.startsWith(next)) {
      setMessage("Hmm, try again.");
      setTimeout(() => setBuilt(""), 300);
    }
  };

  return (
    <div className="card-clay text-center">
      <button
        type="button"
        className="btn-clay btn-clay--ghost mx-auto"
        onClick={() => speak(word)}
      >
        🔊 Hear it
      </button>
      <div className="mt-4 flex min-h-16 flex-wrap items-center justify-center gap-2">
        {[...built].map((letter, i) => (
          <span
            key={i}
            className="word-big rounded-lg bg-primary-light px-3 text-primary-dark"
          >
            {letter}
          </span>
        ))}
      </div>
      <div
        className="mt-4 flex flex-wrap justify-center gap-2"
        aria-label="Letter tiles"
      >
        {[...hint].map((letter, i) => (
          <button
            key={`${letter}-${i}`}
            type="button"
            className="chip min-h-12 min-w-12 text-xl"
            onClick={() => pressLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <p className="mt-4 font-display text-lg font-bold" aria-live="polite">
        {message || `Round ${round + 1} of ${targets.current.length}`}
      </p>
    </div>
  );
}

export function SightWords({ words, onDone, speak }) {
  const targets = useRef(
    takeN(words, 4).map((word) => ({
      word,
      distractors: takeN(
        words.filter((w) => w !== word),
        2,
      ),
    })),
  );
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");

  const { word, distractors } = targets.current[round] ?? {
    word: "",
    distractors: [],
  };
  const options = takeN([word, ...distractors]);

  const pick = (chosen) => {
    if (chosen === word) {
      const next = score + 1;
      setScore(next);
      setMessage(`Great spotting! ${word}. Score ${next}!`);
      if (round + 1 >= targets.current.length) {
        setTimeout(() => onDone(next, targets.current.length), 700);
      } else {
        setTimeout(() => {
          setRound((r) => r + 1);
          setMessage("");
        }, 900);
      }
    } else {
      setMessage("Not that one — listen and look again.");
    }
  };

  return (
    <div className="card-clay text-center">
      <button
        type="button"
        className="btn-clay mx-auto"
        onClick={() => speak(word)}
      >
        🔊 Find this word
      </button>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className="btn-clay btn-clay--ghost"
            onClick={() => pick(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <p className="mt-4 font-display text-lg font-bold" aria-live="polite">
        {message || `Round ${round + 1} of ${targets.current.length}`}
      </p>
    </div>
  );
}

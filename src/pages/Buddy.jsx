import { useEffect, useRef, useState } from "react";
import { buddyReply, buddyWordRound, pickBuddyWord } from "../lib/buddy.js";
import {
  createRecognizer,
  isRecognitionSupported,
} from "../lib/recognition.js";
import { useSpeech } from "../hooks/useSpeech.js";
import { BuddyDuo } from "../components/mascots/BuddyDuo.jsx";
import { FadeUp, MotionPage } from "../lib/motion.jsx";

const STREAK_PRAISE = {
  3: "Three in a row! You are a reading superstar!",
  5: "FIVE words in a row! I am dancing with joy!",
};

const MODES = [
  { id: "chat", label: "💬 Chat with Buddy" },
  { id: "words", label: "🔤 Word Practice" },
];

export function Buddy() {
  const { speak, speaking } = useSpeech();
  const [mood, setMood] = useState("curious");
  const [speech, setSpeech] = useState(
    "Hi! I am Toffy the cat. Tap the mic and talk to me!",
  );
  const [mode, setMode] = useState("chat");
  const [listening, setListening] = useState(false);
  const [input, setInput] = useState("");
  const [log, setLog] = useState([]);
  const [target, setTarget] = useState(pickBuddyWord());
  const [streak, setStreak] = useState(0);
  const recRef = useRef(null);
  const supported = isRecognitionSupported();

  useEffect(() => () => recRef.current?.stop(), []);

  const say = (text, nextMood) => {
    setSpeech(text);
    setMood(nextMood);
    speak(text);
  };

  const handleUtterance = (text) => {
    const clean = String(text || "").trim();
    if (!clean) return;
    if (mode === "chat") {
      const reply = buddyReply(clean);
      setLog((l) => [
        ...l,
        { who: "kid", text: clean },
        { who: "buddy", text: reply.speech },
      ]);
      say(reply.speech, reply.mood);
      return;
    }
    const result = buddyWordRound(clean, target);
    const nextStreak = result.status === "correct" ? streak + 1 : 0;
    setStreak(nextStreak);
    const praise = nextStreak > 0 ? STREAK_PRAISE[nextStreak] : undefined;
    const reply = praise ? { speech: praise, mood: "happy" } : result;
    setLog((l) => [
      ...l,
      { who: "kid", text: clean },
      { who: "buddy", text: reply.speech },
    ]);
    say(reply.speech, reply.mood);
    if (praise) setTarget(pickBuddyWord(target));
  };

  const toggleListen = () => {
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
        setListening(false);
        handleUtterance(transcript);
      };
      rec.onerror = () => {
        setSpeech("I could not hear you — check the microphone and try again.");
        setMood("encouraging");
        setListening(false);
      };
      rec.onend = () => setListening(false);
      rec.start();
      setListening(true);
    } catch {
      setSpeech("Listening is not ready here — type to me instead!");
      setMood("encouraging");
    }
  };

  const submitInput = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    handleUtterance(input);
    setInput("");
  };

  const nextWord = () => {
    const word = pickBuddyWord(target);
    setTarget(word);
    setStreak(0);
    say(`Your turn! Say: ${word}`, "curious");
  };

  const heardStreak = streak > 0;

  return (
    <MotionPage id="main" className="mx-auto max-w-3xl px-4 py-10">
      <FadeUp className="text-center">
        <h1 className="text-4xl">
          Meet the <span className="text-accent">Buddy Team</span>
        </h1>
        <p className="mt-2 text-text-muted">
          Toffy the cat and Jummi the mouse love to hear you read. Talk to them!
        </p>
      </FadeUp>

      <FadeUp className="mt-10">
        <BuddyDuo mood={mood} speech={speech} speaking={speaking} />
      </FadeUp>

      <FadeUp className="mt-12">
        <div
          className="flex justify-center gap-2"
          role="group"
          aria-label="Buddy activity"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`btn-clay px-4 py-2 text-sm ${
                mode === m.id ? "" : "btn-clay--ghost"
              }`}
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </FadeUp>

      <FadeUp className="card-clay mt-6 p-5">
        {mode === "chat" ? (
          <div className="text-center">
            <p className="font-display text-lg font-bold">
              Say hi, ask a question, or tell Buddy a story!
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {supported ? (
                <button
                  type="button"
                  className="btn-clay"
                  onClick={toggleListen}
                  aria-pressed={listening}
                >
                  {listening ? "Listening… tap to stop" : "🎤 Talk to Buddy"}
                </button>
              ) : (
                <p className="text-sm text-text-muted">
                  Mic not available here — type to Buddy instead!
                </p>
              )}
              <form onSubmit={submitInput} className="flex gap-2">
                <label htmlFor="buddy-input" className="sr-only">
                  Type to Buddy
                </label>
                <input
                  id="buddy-input"
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type to Buddy…"
                  className="input-clay"
                />
                <button type="submit" className="btn-clay btn-clay--ghost">
                  Send
                </button>
              </form>
            </div>
            {listening && (
              <p className="mt-3 text-text-muted" role="status">
                Buddy is listening — go ahead!
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="font-display text-lg font-bold">
              Say the word you see:
            </p>
            <p className="mt-2 font-display text-5xl font-extrabold tracking-wide text-primary-dark">
              {target}
            </p>
            {heardStreak && (
              <p className="mt-2 font-display font-bold text-success">
                {streak} in a row! Keep going!
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {supported ? (
                <button
                  type="button"
                  className="btn-clay"
                  onClick={toggleListen}
                  aria-pressed={listening}
                >
                  {listening ? "Listening… tap to stop" : "🎤 Say the word"}
                </button>
              ) : (
                <p className="text-sm text-text-muted">
                  Mic not available here — type the word instead!
                </p>
              )}
              <form onSubmit={submitInput} className="flex gap-2">
                <label htmlFor="buddy-word" className="sr-only">
                  Type the word
                </label>
                <input
                  id="buddy-word"
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Type the word…"
                  className="input-clay"
                />
                <button type="submit" className="btn-clay btn-clay--ghost">
                  Check
                </button>
              </form>
              <button
                type="button"
                className="btn-clay btn-clay--ghost"
                onClick={nextWord}
              >
                Next word
              </button>
            </div>
            {listening && (
              <p className="mt-3 text-text-muted" role="status">
                Buddy is listening — say the word!
              </p>
            )}
          </div>
        )}
      </FadeUp>

      <FadeUp className="mt-6">
        <h2 className="font-display text-lg font-bold">Our talk so far</h2>
        {log.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">
            Nothing yet — say the first word!
          </p>
        ) : (
          <ul className="mt-3 space-y-2" role="log" aria-label="Conversation">
            {log.map((entry, i) => (
              <li
                key={i}
                className={`rounded-2xl border-2 border-border px-4 py-2 text-sm ${
                  entry.who === "kid" ? "bg-primary-light" : "bg-surface-alt"
                }`}
              >
                <span className="font-display font-bold">
                  {entry.who === "kid" ? "You" : "Buddy"}:
                </span>{" "}
                {entry.text}
              </li>
            ))}
          </ul>
        )}
      </FadeUp>
    </MotionPage>
  );
}

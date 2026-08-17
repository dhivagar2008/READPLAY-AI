import { useEffect, useRef, useState } from "react";
import { askTutor } from "../lib/tutor.js";
import { lessons } from "../data/lessons.js";
import { FadeUp, MotionPage } from "../lib/motion.jsx";
import { HootyOwl } from "../components/mascots/Mascots.jsx";

const GREETING = {
  role: "tutor",
  text: "Hi! I am Hooty, your reading buddy. Ask me anything about a word, a sound, or a sentence — I will help you figure it out.",
};

export function Tutor() {
  const [messages, setMessages] = useState([GREETING]);
  const [draft, setDraft] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [busy, setBusy] = useState(false);
  const [sleeping, setSleeping] = useState(false);
  const listRef = useRef(null);

  const lesson = lessons.find((l) => l.id === lessonId);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const send = async (event) => {
    event.preventDefault();
    const question = draft.trim();
    if (!question || busy) return;
    setDraft("");
    setBusy(true);
    setSleeping(false);
    setMessages((m) => [...m, { role: "child", text: question }]);
    try {
      const answer = await askTutor({
        question,
        lessonTitle: lesson ? lesson.title : "",
      });
      setMessages((m) => [...m, { role: "tutor", text: answer }]);
    } catch (err) {
      setSleeping(true);
      setMessages((m) => [
        ...m,
        {
          role: "tutor",
          text:
            err.message === "too-many"
              ? "Whoa, that was a lot of questions! Give me a minute to catch my breath, then ask again."
              : "Hooty is sleeping right now. Try again in a moment — or keep practising your lessons!",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <MotionPage id="main" className="mx-auto max-w-2xl px-4 py-10">
      <FadeUp className="flex items-center gap-4">
        <HootyOwl className="w-16" aria-hidden="true" />
        <div>
          <h1 className="text-4xl">Ask the Tutor</h1>
          <p className="mt-1 text-text-muted">
            Stuck on a word or a sentence? Ask Hooty — questions are fine,
            mistakes are fine, no grades here.
          </p>
        </div>
      </FadeUp>

      <FadeUp className="card-clay mt-6">
        <label
          htmlFor="lesson-context"
          className="font-display text-sm font-bold"
        >
          Reading now (optional)
        </label>
        <select
          id="lesson-context"
          className="input-clay mt-1"
          value={lessonId}
          onChange={(e) => setLessonId(e.target.value)}
        >
          <option value="">Just exploring</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
      </FadeUp>

      <FadeUp className="card-clay mt-4 flex h-96 flex-col">
        <div
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto p-4"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "child" ? "justify-end" : "justify-start"}`}
            >
              <p
                className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                  m.role === "child"
                    ? "bg-primary text-white"
                    : "bg-surface-alt text-text"
                }`}
              >
                {m.text}
              </p>
            </div>
          ))}
          {busy && (
            <p className="text-sm text-text-muted" role="status">
              Hooty is thinking…
            </p>
          )}
          {sleeping && (
            <p className="text-sm text-text-muted" role="status">
              You can still practise your lessons while Hooty naps.
            </p>
          )}
        </div>

        <form
          onSubmit={send}
          className="flex gap-2 border-t-2 border-border p-3"
        >
          <label htmlFor="question" className="sr-only">
            Ask Hooty a question
          </label>
          <input
            id="question"
            className="input-clay flex-1"
            placeholder="e.g. Why does 'ough' sound so many ways?"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
          />
          <button
            type="submit"
            className="btn-clay"
            disabled={busy || !draft.trim()}
          >
            Ask
          </button>
        </form>
      </FadeUp>
    </MotionPage>
  );
}

import { describe, expect, it, beforeEach } from "vitest";
import { act } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Lesson } from "../src/pages/Lesson.jsx";
import { lessons } from "../src/data/lessons.js";

let utterances = [];

function mockSpeech() {
  utterances = [];
  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.onboundary = null;
      this.onend = null;
      this.onerror = null;
      utterances.push(this);
    }
  };
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: {
      speak: () => {},
      cancel: () => {},
      getVoices: () => [],
    },
  });
}

function renderLesson(slug) {
  return render(
    <MemoryRouter initialEntries={[`/lessons/${slug}`]}>
      <Routes>
        <Route path="/lessons/:slug" element={<Lesson />} />
        <Route path="/lessons" element={<div>lessons list</div>} />
        <Route path="/games" element={<div>games page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Lesson page", () => {
  beforeEach(() => {
    mockSpeech();
    localStorage.clear();
  });

  it("shows the lesson words and hears them aloud", async () => {
    const user = userEvent.setup();
    const lesson = lessons[0];
    renderLesson(lesson.id);
    expect(
      screen.getByRole("heading", { name: lesson.title }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: `Hear the word ${lesson.words[0]}` }),
    );
    expect(utterances.at(-1).text).toBe(lesson.words[0]);
  });

  it("shows a friendly 404 for an unknown lesson", () => {
    renderLesson("nope-nope");
    expect(screen.getByText(/wrong turn/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Back to lessons" }),
    ).toBeInTheDocument();
  });

  it("records completion and celebrates when the story finishes", async () => {
    const user = userEvent.setup();
    renderLesson("phonics-short-a");
    await user.click(screen.getByRole("tab", { name: "Story" }));

    // autoPlay started the first sentence; pause, then read each sentence.
    await user.click(screen.getByRole("button", { name: "⏸ Pause" }));
    for (let i = 0; i < 4; i++) {
      await user.click(screen.getByRole("button", { name: "▶ Listen" }));
      await act(async () => {
        utterances.at(-1).onend?.();
      });
    }
    expect(await screen.findByText(/you did it/i)).toBeInTheDocument();

    const store = JSON.parse(localStorage.getItem("playlearn:progress"));
    const completed = store.events.filter((e) => e.type === "lesson_completed");
    expect(completed).toHaveLength(1);
  });
});

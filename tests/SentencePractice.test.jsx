import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SentencePractice } from "../src/components/SentencePractice.jsx";

function mockSpeech() {
  window.SpeechSynthesisUtterance = class {};
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
  });
}

function mockRecognition(transcript) {
  const handlers = {};
  vi.stubGlobal(
    "webkitSpeechRecognition",
    class {
      constructor() {
        this.lang = "";
        this.interimResults = false;
        this.maxAlternatives = 1;
      }
      start() {
        this.onstart && this.onstart();
        this.onresult &&
          this.onresult({
            results: [{ 0: { transcript } }],
          });
        this.onend && this.onend();
      }
      stop() {
        this.onend && this.onend();
      }
      set onresult(fn) {
        handlers.onresult = fn;
      }
      get onresult() {
        return handlers.onresult;
      }
      set onerror(fn) {
        handlers.onerror = fn;
      }
      set onend(fn) {
        handlers.onend = fn;
      }
    },
  );
}

describe("SentencePractice", () => {
  beforeEach(() => {
    localStorage.clear();
    mockSpeech();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("offers the hear-first button", () => {
    render(<SentencePractice sentence="The cat sat." />);
    expect(
      screen.getByRole("button", { name: "Hear it first" }),
    ).toBeInTheDocument();
  });

  it("scores a perfect reading", async () => {
    mockRecognition("the cat sat");
    const user = userEvent.setup();
    render(<SentencePractice sentence="The cat sat." />);
    await user.click(screen.getByRole("button", { name: "Try reading it" }));
    expect(
      await screen.findByText(/Wow, you got every word/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
  });

  it("scores a partial reading with missed words", async () => {
    mockRecognition("the dog");
    const user = userEvent.setup();
    render(<SentencePractice sentence="The cat sat." />);
    await user.click(screen.getByRole("button", { name: "Try reading it" }));
    expect(
      await screen.findByText(/You read 1 of 3 words/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("the: great")).toBeInTheDocument();
    expect(screen.getByLabelText("cat: not yet")).toBeInTheDocument();
    expect(screen.getByLabelText("sat: not yet")).toBeInTheDocument();
  });
});

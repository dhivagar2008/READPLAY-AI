import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Reader } from "../src/components/Reader.jsx";
import { wordIndexAtChar, wordRange } from "../src/lib/text.js";

const SENTENCES = ["The cat sat on the mat.", "The dog can hop."];

function mockSpeech() {
  const speak = vi.fn();
  const cancel = vi.fn();
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { speak, cancel, getVoices: () => [] },
  });
  return { speak, cancel };
}

describe("wordIndexAtChar", () => {
  it("maps a char index to the current word index", () => {
    expect(wordIndexAtChar("The cat sat", 4)).toBe(1); // "cat"
    expect(wordIndexAtChar("The cat sat", 0)).toBe(0);
    expect(wordIndexAtChar("The cat sat", 11)).toBe(2);
  });
});

describe("wordRange", () => {
  it("returns char offsets for a word", () => {
    expect(wordRange("The cat sat", 1)).toEqual([4, 7]);
    expect(wordRange("The cat sat", 0)).toEqual([0, 3]);
  });
});

describe("Reader", () => {
  beforeEach(() => {
    mockSpeech();
    window.SpeechSynthesisUtterance = class {
      onboundary = null;
      onend = null;
      onerror = null;
      constructor(text) {
        this.text = text;
      }
    };
  });

  it("renders all sentences as tappable words", () => {
    render(<Reader sentences={SENTENCES} />);
    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("mat.")).toBeInTheDocument();
    expect(screen.getByText("Sentence 1 of 2")).toBeInTheDocument();
  });

  it("speaks a word when it is tapped", async () => {
    const user = userEvent.setup();
    const { speak } = mockSpeech();
    render(<Reader sentences={SENTENCES} />);
    await user.click(screen.getByRole("button", { name: "Hear the word cat" }));
    expect(speak).toHaveBeenCalledWith(
      expect.objectContaining({ text: "cat" }),
    );
  });

  it("advances to the next sentence when listening finishes", async () => {
    const user = userEvent.setup();
    render(<Reader sentences={SENTENCES} />);
    await user.click(screen.getByRole("button", { name: "▶ Listen" }));
    expect(screen.getByText("Sentence 1 of 2")).toBeInTheDocument();
  });

  it("navigates with the next button", async () => {
    const user = userEvent.setup();
    render(<Reader sentences={SENTENCES} />);
    await user.click(screen.getByRole("button", { name: "Next ▶" }));
    expect(screen.getByText("Sentence 2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next ▶" })).toBeDisabled();
  });
});

import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WordMatch } from "../src/components/games/Games.jsx";
import { scrambleWord, shuffle, takeN } from "../src/lib/game.js";

function mockSpeech() {
  window.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
    }
  };
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
  });
}

describe("game helpers", () => {
  it("keeps the same items when shuffling", () => {
    const items = ["a", "b", "c", "d"];
    expect(shuffle(items).sort()).toEqual(items.sort());
  });

  it("takes exactly n items", () => {
    expect(takeN(["a", "b", "c", "d", "e"], 3)).toHaveLength(3);
  });

  it("never returns the original word when scrambling", () => {
    for (const word of ["cat", "star", "teacher", "circle"]) {
      expect(scrambleWord(word)).not.toBe(word);
      expect([...scrambleWord(word)].sort()).toEqual([...word].sort());
    }
  });
});

describe("WordMatch", () => {
  beforeEach(() => {
    mockSpeech();
    localStorage.clear();
  });

  it("rewards matching a heard word with its card", async () => {
    const user = userEvent.setup();
    const onDone = () => {};
    render(
      <WordMatch
        words={["cat", "hat", "bat", "mat"]}
        onDone={onDone}
        speak={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Listen: cat" }));
    await user.click(screen.getByRole("button", { name: "cat" }));
    expect(screen.getByText(/Match! cat/)).toBeInTheDocument();
  });

  it("gently corrects a wrong match", async () => {
    const user = userEvent.setup();
    render(
      <WordMatch
        words={["cat", "hat", "bat", "mat"]}
        onDone={() => {}}
        speak={() => {}}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Listen: cat" }));
    await user.click(screen.getByRole("button", { name: "hat" }));
    expect(screen.getByText(/Not that one/)).toBeInTheDocument();
  });

  it("finishes after all four pairs are matched", async () => {
    const user = userEvent.setup();
    const onDone = () => {};
    render(
      <WordMatch
        words={["cat", "hat", "bat", "mat"]}
        onDone={onDone}
        speak={() => {}}
      />,
    );

    for (const word of ["cat", "hat", "bat", "mat"]) {
      await user.click(screen.getByRole("button", { name: `Listen: ${word}` }));
      await user.click(screen.getByRole("button", { name: word }));
    }
    expect(await screen.findByText(/Match! mat/)).toBeInTheDocument();
  });
});

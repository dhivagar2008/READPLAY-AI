import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Create } from "../src/pages/Create.jsx";
import { generateLessonOffline } from "../src/lib/ai.js";

function mockSpeech() {
  window.SpeechSynthesisUtterance = class {};
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
  });
}

describe("Create page", () => {
  beforeEach(() => {
    mockSpeech();
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("offers subject and difficulty choices", () => {
    render(
      <MemoryRouter>
        <Create />
      </MemoryRouter>,
    );
    expect(screen.getByRole("button", { name: /Phonics/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Gentle" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Topic" })).toBeInTheDocument();
  });

  it("builds an offline lesson when the API is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Create />
      </MemoryRouter>,
    );
    await user.type(screen.getByRole("textbox", { name: "Topic" }), "bunnies");
    await user.click(screen.getByRole("button", { name: "Make my lesson" }));

    expect(
      await screen.findByRole("heading", { name: /bunnies/i }),
    ).toBeInTheDocument();
    const offline = generateLessonOffline({
      topic: "bunnies",
      category: "phonics",
      difficulty: 1,
    });
    for (const word of offline.words.slice(0, 3)) {
      expect(
        screen.getByRole("button", { name: `Hear the word ${word}` }),
      ).toBeInTheDocument();
    }
    expect(screen.getByText(/Made with \d+ words/)).toBeInTheDocument();
  });

  it("keeps the build button disabled without a topic", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Create />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("button", { name: "Make my lesson" }),
    ).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Topic" }), "bunnies");
    expect(
      screen.getByRole("button", { name: "Make my lesson" }),
    ).toBeEnabled();
  });
});

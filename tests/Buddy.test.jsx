import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Buddy } from "../src/pages/Buddy.jsx";

function mockSpeech() {
  window.SpeechSynthesisUtterance = class {};
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { speak: () => {}, cancel: () => {}, getVoices: () => [] },
  });
}

describe("Buddy page", () => {
  beforeEach(() => {
    localStorage.clear();
    mockSpeech();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("introduces the duo", () => {
    render(<Buddy />);
    expect(
      screen.getByRole("heading", { name: /meet the buddy team/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Toffy the cat and Jummi the mouse"),
    ).toBeInTheDocument();
    expect(screen.getByText(/talk to me/i)).toBeInTheDocument();
  });

  it("replies when the kid types a greeting", async () => {
    const user = userEvent.setup();
    render(<Buddy />);
    await user.type(screen.getByLabelText("Type to Buddy"), "hi buddy");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText(/hello, friend/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Conversation")).toHaveTextContent("hi buddy");
  });

  it("practices words and cheers a correct answer", async () => {
    const user = userEvent.setup();
    render(<Buddy />);
    await user.click(screen.getByRole("button", { name: /word practice/i }));
    const word = screen.getByText(/^[a-z]+$/);
    await user.type(screen.getByLabelText("Type the word"), word.textContent);
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(
      await screen.findByText(/perfect! you read it/i),
    ).toBeInTheDocument();
  });

  it("gently corrects a missed word", async () => {
    const user = userEvent.setup();
    render(<Buddy />);
    await user.click(screen.getByRole("button", { name: /word practice/i }));
    await user.type(screen.getByLabelText("Type the word"), "zzzzz");
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(await screen.findByText(/that one is tricky/i)).toBeInTheDocument();
  });

  it("moves to a new word", async () => {
    const user = userEvent.setup();
    render(<Buddy />);
    await user.click(screen.getByRole("button", { name: /word practice/i }));
    const first = screen.getByText(/^[a-z]+$/).textContent;
    await user.click(screen.getByRole("button", { name: "Next word" }));
    expect(await screen.findByText(/your turn/i)).toBeInTheDocument();
    const second = screen.getByText(/^[a-z]+$/).textContent;
    expect(second).not.toBe(first);
  });
});

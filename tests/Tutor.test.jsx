import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Tutor } from "../src/pages/Tutor.jsx";
import { lessons } from "../src/data/lessons.js";

describe("Tutor page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("greets the child and shows the lesson selector", () => {
    render(
      <MemoryRouter>
        <Tutor />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Hi! I am Hooty/)).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: /Reading now/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: lessons[0].title }),
    ).toBeInTheDocument();
  });

  it("sends a question and shows the tutor answer", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ answer: "That word says 'cat'. Try it slowly!" }),
      }),
    );
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Tutor />
      </MemoryRouter>,
    );
    await user.type(
      screen.getByRole("textbox", { name: "Ask Hooty a question" }),
      "How do I say cat?",
    );
    await user.click(screen.getByRole("button", { name: "Ask" }));
    expect(
      await screen.findByText("That word says 'cat'. Try it slowly!"),
    ).toBeInTheDocument();
  });

  it("shows the sleeping message when the API is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Tutor />
      </MemoryRouter>,
    );
    await user.type(
      screen.getByRole("textbox", { name: "Ask Hooty a question" }),
      "hello?",
    );
    await user.click(screen.getByRole("button", { name: "Ask" }));
    expect(
      await screen.findByText(/Hooty is sleeping right now/),
    ).toBeInTheDocument();
  });
});

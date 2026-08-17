import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/App.jsx";
import "../src/styles/global.css";

describe("PlayLearn shell", () => {
  it("starts on the login page and reaches home with hero and mascots", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /playlearn ai/i }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("link", { name: /keep learning without signing in/i }),
    );
    expect(
      await screen.findByRole("heading", {
        name: /learn to read like it.s play/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Toffy the cat")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /text size/i }),
    ).toBeInTheDocument();
  });

  it("navigates to the lessons stub via the mobile menu", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Toggle menu" }));
    await user.click(screen.getByRole("link", { name: "Lessons" }));
    expect(
      await screen.findByRole("heading", { name: "Lessons" }),
    ).toBeInTheDocument();
  });
});

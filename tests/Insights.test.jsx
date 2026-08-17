import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Insights } from "../src/pages/Insights.jsx";
import { lessons } from "../src/data/lessons.js";

describe("Insights page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the empty state before any activity", () => {
    render(
      <MemoryRouter>
        <Insights />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "For Parents" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Nothing here yet/)).toBeInTheDocument();
  });

  it("summarises activity once lessons start", () => {
    localStorage.setItem(
      "playlearn:progress",
      JSON.stringify({
        v: 1,
        events: [
          {
            type: "lesson_started",
            lessonId: lessons[0].id,
            skillIds: lessons[0].skillIds,
            ts: 1,
          },
          {
            type: "lesson_completed",
            lessonId: lessons[0].id,
            skillIds: lessons[0].skillIds,
            ts: 2,
          },
          {
            type: "reading_scored",
            lessonId: lessons[0].id,
            skillIds: lessons[0].skillIds,
            score: { missed: 1, close: 1, total: 8 },
            ts: 3,
          },
        ],
      }),
    );
    render(
      <MemoryRouter>
        <Insights />
      </MemoryRouter>,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "This week" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Skills to watch" }),
    ).toBeInTheDocument();
  });

  it("clears all progress", async () => {
    localStorage.setItem(
      "playlearn:progress",
      JSON.stringify({
        v: 1,
        events: [
          {
            type: "lesson_started",
            lessonId: lessons[0].id,
            skillIds: [],
            ts: 1,
          },
        ],
      }),
    );
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Insights />
      </MemoryRouter>,
    );
    await user.click(
      screen.getByRole("button", { name: "Clear all progress on this device" }),
    );
    expect(await screen.findByText(/Nothing here yet/)).toBeInTheDocument();
    expect(localStorage.getItem("playlearn:progress")).toBeNull();
  });
});

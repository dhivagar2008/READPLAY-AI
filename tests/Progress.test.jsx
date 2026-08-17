import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Progress } from "../src/pages/Progress.jsx";
import { lessons } from "../src/data/lessons.js";

describe("Progress page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the empty state with no progress", () => {
    render(
      <MemoryRouter>
        <Progress />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "My Stars" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/No stars yet/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "start your first lesson" }),
    ).toBeInTheDocument();
  });

  it("counts stars from started and completed lessons", () => {
    localStorage.setItem(
      "playlearn:progress",
      JSON.stringify({
        v: 1,
        events: [
          { type: "lesson_started", lessonId: lessons[0].id, ts: 1 },
          { type: "lesson_completed", lessonId: lessons[0].id, ts: 2 },
          { type: "lesson_started", lessonId: lessons[1].id, ts: 3 },
        ],
      }),
    );
    render(
      <MemoryRouter>
        <Progress />
      </MemoryRouter>,
    );
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(
      screen.getByText(/stars so far — from 2 lessons/),
    ).toBeInTheDocument();
  });

  it("lists completed lessons as finished", () => {
    localStorage.setItem(
      "playlearn:progress",
      JSON.stringify({
        v: 1,
        events: [{ type: "lesson_completed", lessonId: lessons[0].id, ts: 1 }],
      }),
    );
    render(
      <MemoryRouter>
        <Progress />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Finished lessons" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: lessons[0].title }),
    ).toBeInTheDocument();
  });
});

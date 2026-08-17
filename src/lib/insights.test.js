import { describe, expect, it } from "vitest";
import { activitySummary, skillBreakdown, weeklyActivity } from "./insights.js";
import { createStore, recordEvent } from "./progress.js";

function storeWith(events) {
  return events.reduce(recordEvent, createStore());
}

describe("activitySummary", () => {
  it("counts activity and accuracy", () => {
    const store = storeWith([
      { type: "lesson_started", lessonId: "a", skillIds: ["s"] },
      { type: "lesson_completed", lessonId: "a", skillIds: ["s"] },
      { type: "lesson_started", lessonId: "b", skillIds: ["s"] },
      { type: "game_result", lessonId: "b", game: "match", score: 3, total: 5 },
      {
        type: "reading_scored",
        lessonId: "a",
        skillIds: ["s"],
        score: { missed: 1, close: 1, total: 8 },
      },
    ]);
    expect(activitySummary(store)).toEqual({
      lessonsStarted: 2,
      lessonsCompleted: 1,
      gamesPlayed: 1,
      wordsRead: 8,
      wordsMissed: 2,
      accuracy: 75,
    });
  });

  it("returns null accuracy when no words were read", () => {
    expect(activitySummary(createStore()).accuracy).toBeNull();
  });
});

describe("weeklyActivity", () => {
  it("groups by day and ignores future events", () => {
    const now = Date.now();
    const store = {
      v: 1,
      events: [
        { type: "lesson_started", lessonId: "a", skillIds: ["s"], ts: now },
        {
          type: "reading_scored",
          lessonId: "a",
          skillIds: ["s"],
          score: { missed: 0, close: 0, total: 5 },
          ts: now,
        },
        {
          type: "lesson_started",
          lessonId: "b",
          skillIds: ["s"],
          ts: now + 1e12,
        },
      ],
    };
    const week = weeklyActivity(store);
    expect(week).toHaveLength(7);
    const today = week[6];
    expect(today.lessonsStarted).toBe(1);
    expect(today.wordsRead).toBe(5);
  });
});

describe("skillBreakdown", () => {
  it("ranks skills by miss rate", () => {
    const store = storeWith([
      {
        type: "reading_scored",
        lessonId: "a",
        skillIds: ["s1"],
        score: { missed: 8, close: 0, total: 10 },
      },
      {
        type: "reading_scored",
        lessonId: "b",
        skillIds: ["s2"],
        score: { missed: 1, close: 0, total: 10 },
      },
    ]);
    const skills = skillBreakdown(store);
    expect(skills[0].skillId).toBe("s1");
    expect(skills[0].missRate).toBe(80);
    expect(skills[1].missRate).toBe(10);
  });
});

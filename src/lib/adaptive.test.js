import { describe, expect, it } from "vitest";
import {
  personalizedPath,
  recommendedDifficulty,
  skillsFromStore,
  suggestNextLesson,
} from "./adaptive.js";
import { lessons } from "../data/lessons.js";
import { createStore, recordEvent } from "./progress.js";

function storeWith(events) {
  return events.reduce(recordEvent, createStore());
}

describe("skillsFromStore", () => {
  it("aggregates attempts, completions and reading misses", () => {
    const store = storeWith([
      { type: "lesson_started", lessonId: "a", skillIds: ["phonics.1"] },
      { type: "lesson_completed", lessonId: "a", skillIds: ["phonics.1"] },
      {
        type: "reading_scored",
        lessonId: "a",
        skillIds: ["phonics.1"],
        score: { missed: 2, close: 1, total: 8 },
      },
    ]);
    const skills = skillsFromStore(store);
    expect(skills["phonics.1"]).toEqual({
      attempts: 1,
      completed: 1,
      misses: 3,
      words: 8,
    });
  });
});

describe("suggestNextLesson", () => {
  it("suggests the easiest unstarted lesson first", () => {
    const store = createStore();
    const { lesson, reason } = suggestNextLesson(store, lessons);
    expect(reason).toBe("fresh-start");
    expect(lesson.difficulty).toBe(1);
  });

  it("suggests practice in a struggling skill before new lessons", () => {
    const skillId = lessons[0].skillIds[0];
    const store = storeWith([
      { type: "lesson_started", lessonId: "a", skillIds: [skillId] },
      {
        type: "reading_scored",
        lessonId: "a",
        skillIds: [skillId],
        score: { missed: 6, close: 2, total: 10 },
      },
    ]);
    const { lesson, reason } = suggestNextLesson(store, lessons);
    expect(reason).toBe("practice-more");
    expect(lesson.skillIds.includes(skillId)).toBe(true);
    expect(lesson.id).not.toBe("a");
  });

  it("keeps the path deterministic and complete", () => {
    const path = personalizedPath(createStore(), lessons);
    expect(path).toHaveLength(lessons.length);
    expect(new Set(path).size).toBe(lessons.length);
    expect(path[0]).toBe(
      [...lessons].sort((a, b) => a.difficulty - b.difficulty)[0].id,
    );
  });
});

describe("recommendedDifficulty", () => {
  it("starts gentle with no data", () => {
    expect(recommendedDifficulty(createStore())).toBe(1);
  });

  it("stays gentle when reading misses are high", () => {
    const store = storeWith([
      {
        type: "reading_scored",
        lessonId: "a",
        skillIds: ["s"],
        score: { missed: 8, close: 1, total: 10 },
      },
    ]);
    expect(recommendedDifficulty(store)).toBe(1);
  });

  it("levels up when reading is strong", () => {
    const store = storeWith([
      {
        type: "reading_scored",
        lessonId: "a",
        skillIds: ["s"],
        score: { missed: 0, close: 1, total: 10 },
      },
      { type: "lesson_completed", lessonId: "a", skillIds: ["s"] },
    ]);
    expect(recommendedDifficulty(store)).toBe(3);
  });
});

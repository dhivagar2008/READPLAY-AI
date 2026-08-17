import { describe, expect, it } from "vitest";
import {
  createStore,
  hasEvent,
  loadStore,
  recordEvent,
  saveStore,
  starsForLesson,
  totalStars,
} from "./progress.js";

const lesson = { id: "phonics-short-a" };

describe("progress store", () => {
  it("records events append-only with a timestamp", () => {
    const store = recordEvent(createStore(), {
      type: "lesson_started",
      lessonId: lesson.id,
    });
    const next = recordEvent(store, {
      type: "lesson_completed",
      lessonId: lesson.id,
    });
    expect(store.events).toHaveLength(1);
    expect(next.events).toHaveLength(2);
    expect(hasEvent(next, lesson.id, "lesson_completed")).toBe(true);
    expect(hasEvent(store, lesson.id, "lesson_completed")).toBe(false);
  });

  it("never mutates the previous store", () => {
    const store = createStore();
    const next = recordEvent(store, {
      type: "lesson_started",
      lessonId: lesson.id,
    });
    expect(store.events).toHaveLength(0);
    expect(next.events).toHaveLength(1);
  });

  it("counts stars: 1 for start, 2 for completion", () => {
    const started = recordEvent(createStore(), {
      type: "lesson_started",
      lessonId: lesson.id,
    });
    const completed = recordEvent(started, {
      type: "lesson_completed",
      lessonId: lesson.id,
    });
    expect(starsForLesson(started, lesson.id)).toBe(1);
    expect(starsForLesson(completed, lesson.id)).toBe(2);
    expect(starsForLesson(createStore(), lesson.id)).toBe(0);
    expect(totalStars(started)).toBe(1);
    expect(totalStars(completed)).toBe(3);
  });

  it("round-trips through localStorage", () => {
    const store = recordEvent(createStore(), {
      type: "lesson_started",
      lessonId: lesson.id,
    });
    saveStore(store);
    const loaded = loadStore();
    expect(loaded.events).toEqual(store.events);
  });

  it("falls back to an empty store on corrupt data", () => {
    localStorage.setItem("playlearn:progress", "{not json");
    expect(loadStore().events).toEqual([]);
    localStorage.setItem("playlearn:progress", '{"v":1,"events":"nope"}');
    expect(loadStore().events).toEqual([]);
  });
});

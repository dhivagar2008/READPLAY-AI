import { describe, expect, it, vi, afterEach } from "vitest";
import { generateLesson, generateLessonOffline, sanitizeLesson } from "./ai.js";
import { validateLesson } from "../data/validate.js";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("sanitizeLesson", () => {
  it("rejects malformed or malicious AI output", () => {
    expect(sanitizeLesson(null)).toBeNull();
    expect(
      sanitizeLesson({
        id: "x",
        title: "<script>alert(1)</script>",
        category: "nope",
      }),
    ).toBeNull();
    expect(
      sanitizeLesson({
        id: "x",
        title: "ok",
        category: "phonics",
        words: [],
        sentences: [],
      }),
    ).toBeNull();
  });

  it("passes through a valid lesson shape", () => {
    const lesson = sanitizeLesson({
      id: "custom-abc",
      title: "My Lesson",
      category: "phonics",
      skillIds: ["custom.phonics"],
      difficulty: 2,
      words: ["cat", "hat", "bat", "mat", "sat", "rat"],
      sentences: ["The cat sat.", "The rat has a hat."],
      gameHints: { match: "a", mixed: "b", sight: "c" },
    });
    expect(lesson).not.toBeNull();
    expect(validateLesson(lesson).ok).toBe(true);
  });
});

describe("generateLessonOffline", () => {
  it("always returns a valid lesson, even for odd topics", () => {
    const lesson = generateLessonOffline({
      topic: "Space!!! 123",
      category: "science",
      difficulty: 1,
    });
    expect(lesson).not.toBeNull();
    expect(validateLesson(lesson).ok).toBe(true);
    expect(lesson.category).toBe("science");
  });
});

describe("generateLesson", () => {
  it("falls back to the offline generator when the API is unreachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("network down")),
    );
    const result = await generateLesson({
      topic: "pirates",
      category: "social",
      difficulty: 2,
    });
    expect(result.source).toBe("offline");
    expect(validateLesson(result.lesson).ok).toBe(true);
  });

  it("uses the serverless API result when valid", async () => {
    const lesson = {
      id: "custom-1",
      title: "Pirate Ships",
      category: "social",
      skillIds: ["custom.social"],
      difficulty: 2,
      words: ["ship", "sea", "map", "flag", "sail", "crew"],
      sentences: ["The ship sails the sea.", "The map shows the way."],
      gameHints: { match: "a", mixed: "b", sight: "c" },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => lesson }),
    );
    const result = await generateLesson({
      topic: "pirates",
      category: "social",
      difficulty: 2,
    });
    expect(result.source).toBe("serverless");
    expect(result.lesson.title).toBe("Pirate Ships");
  });

  it("ignores invalid serverless responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ title: "bad", words: [] }),
      }),
    );
    const result = await generateLesson({
      topic: "pirates",
      category: "social",
      difficulty: 2,
    });
    expect(result.source).toBe("offline");
  });
});

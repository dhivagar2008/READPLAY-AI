import { describe, expect, it } from "vitest";
import { lessons } from "./lessons.js";
import { CATEGORIES, validateCatalog, validateLesson } from "./validate.js";

describe("lesson catalog", () => {
  it("has at least 15 lessons across all 5 categories", () => {
    const result = validateCatalog(lessons);
    expect(result.errors).toEqual([]);
    expect(result.total).toBeGreaterThanOrEqual(15);
    expect(Object.keys(result.counts)).toHaveLength(5);
    for (const c of CATEGORIES)
      expect(result.counts[c]).toBeGreaterThanOrEqual(3);
  });

  it("gives every lesson a difficulty of 1-3", () => {
    for (const l of lessons) expect(l.difficulty).toBeGreaterThanOrEqual(1);
    for (const l of lessons) expect(l.difficulty).toBeLessThanOrEqual(3);
  });

  it("keeps every sentence short and decodable", () => {
    for (const l of lessons) {
      for (const s of l.sentences)
        expect(s.split(" ").length).toBeLessThanOrEqual(12);
    }
  });
});

describe("validateLesson", () => {
  it("rejects a duplicate id within the catalog", () => {
    const result = validateLesson(lessons[0], new Set([lessons[0].id]));
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toContain("duplicate");
  });

  it("rejects an unknown category", () => {
    const result = validateLesson({ ...lessons[0], category: "astronomy" });
    expect(result.ok).toBe(false);
  });

  it("rejects too few words", () => {
    const result = validateLesson({ ...lessons[0], words: ["cat", "hat"] });
    expect(result.ok).toBe(false);
  });
});

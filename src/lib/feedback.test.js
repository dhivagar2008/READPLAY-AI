import { describe, expect, it } from "vitest";
import { normalizeWord, scoreReading, wordDistance } from "./feedback.js";

describe("normalizeWord", () => {
  it("strips punctuation and case", () => {
    expect(normalizeWord("Cat,")).toBe("cat");
    expect(normalizeWord("  The ")).toBe("the");
    expect(normalizeWord("don't")).toBe("don't");
  });
});

describe("wordDistance", () => {
  it("matches exact words with distance 0", () => {
    expect(wordDistance("cat", "cat")).toBe(0);
  });
  it("allows one-letter slips", () => {
    expect(wordDistance("cat", "car")).toBe(1);
  });
});

describe("scoreReading", () => {
  it("scores a perfect reading", () => {
    const { results, correct, total } = scoreReading("the cat sat on the mat", [
      "The",
      "cat",
      "sat",
      "on",
      "the",
      "mat.",
    ]);
    expect(correct).toBe(6);
    expect(total).toBe(6);
    expect(results.every((r) => r.status === "correct")).toBe(true);
  });

  it("marks close slips for one-letter mistakes", () => {
    const { results, correct, close, missed } = scoreReading("the car mat", [
      "the",
      "cat",
      "sat",
    ]);
    expect(correct).toBe(1);
    expect(close).toBe(2);
    expect(missed).toBe(0);
    const statuses = results.map((r) => r.status);
    expect(statuses).toEqual(["correct", "close", "close"]);
  });

  it("marks skipped words as missed", () => {
    const { results, correct, missed } = scoreReading("the sat", [
      "the",
      "dog",
      "sat",
    ]);
    expect(correct).toBe(2);
    expect(missed).toBe(1);
    const statuses = results.map((r) => r.status);
    expect(statuses).toEqual(["correct", "missed", "correct"]);
  });

  it("is safe with an empty transcript", () => {
    const { results, missed, total } = scoreReading("", ["a", "b"]);
    expect(missed).toBe(2);
    expect(total).toBe(2);
    expect(results[0].heard).toBe("");
  });
});

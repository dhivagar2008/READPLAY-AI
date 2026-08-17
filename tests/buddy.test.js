import { describe, expect, it } from "vitest";
import {
  buddyReply,
  buddyWordRound,
  pickBuddyWord,
  BUDDY_WORDS,
} from "../src/lib/buddy.js";

describe("buddyReply", () => {
  it("greets back", () => {
    const r = buddyReply("hi buddy");
    expect(r.speech).toMatch(/hello, friend/i);
    expect(r.mood).toBe("curious");
  });

  it("answers a name question", () => {
    expect(buddyReply("what's your name?").speech).toMatch(/toffy/i);
  });

  it("acknowledges thanks", () => {
    expect(buddyReply("thank you").speech).toMatch(/welcome/i);
    expect(buddyReply("thank you").mood).toBe("happy");
  });

  it("says goodbye", () => {
    expect(buddyReply("bye").speech).toMatch(/by[e]? bye/i);
  });

  it("returns love", () => {
    expect(buddyReply("I love you").speech).toMatch(/love you too/i);
  });

  it("recognizes a single spoken word", () => {
    const r = buddyReply("cat");
    expect(r.speech).toContain("cat");
    expect(r.mood).toBe("happy");
  });

  it("falls back for anything else", () => {
    const r = buddyReply("my dog has a rocket");
    expect(r.speech).toMatch(/talking so well/i);
  });

  it("returns a nudge for empty input", () => {
    expect(buddyReply("  ").speech).toMatch(/say something/i);
  });
});

describe("buddyWordRound", () => {
  it("marks an exact match correct", () => {
    const r = buddyWordRound("cat", "cat");
    expect(r.status).toBe("correct");
    expect(r.mood).toBe("happy");
  });

  it("marks a one-letter slip as close", () => {
    const r = buddyWordRound("cot", "cat");
    expect(r.status).toBe("close");
    expect(r.speech).toContain("cat");
  });

  it("marks a wrong word missed", () => {
    const r = buddyWordRound("sun", "cat");
    expect(r.status).toBe("missed");
    expect(r.speech).toContain("cat");
  });
});

describe("pickBuddyWord", () => {
  it("returns a word from the list", () => {
    expect(BUDDY_WORDS).toContain(pickBuddyWord());
  });

  it("avoids repeating the same word when possible", () => {
    const picked = pickBuddyWord("cat");
    expect(picked).not.toBe("cat");
  });
});

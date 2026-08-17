import { describe, expect, it, vi, afterEach } from "vitest";
import { askTutor } from "./tutor.js";

describe("askTutor", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts the question and returns a trimmed answer", async () => {
    let captured = null;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(async (url, opts) => {
        captured = { url, opts };
        return {
          ok: true,
          json: async () => ({ answer: "  Try the letter S first.  " }),
        };
      }),
    );
    const answer = await askTutor({
      question: "  how do I read this? ",
      lessonTitle: "The Cat",
    });
    expect(answer).toBe("Try the letter S first.");
    expect(captured.url).toBe("/api/tutor");
    expect(JSON.parse(captured.opts.body)).toEqual({
      question: "how do I read this?",
      lessonTitle: "The Cat",
    });
  });

  it("reports the rate-limit case distinctly", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429 }),
    );
    await expect(askTutor({ question: "hi" })).rejects.toThrow("too-many");
  });

  it("treats an empty answer as the AI being asleep", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue({ ok: true, json: async () => ({ answer: "" }) }),
    );
    await expect(askTutor({ question: "hi" })).rejects.toThrow("sleeping");
  });
});

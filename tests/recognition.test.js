import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isRecognitionSupported, listenOnce } from "../src/lib/recognition.js";

let handlers = {};

function stubRecognizer() {
  handlers = {};
  const Ctor = class {
    constructor() {
      this.lang = "";
      this.interimResults = false;
      this.maxAlternatives = 1;
    }
    start() {
      this.onstart && this.onstart();
    }
    stop() {
      this.onend && this.onend();
    }
    set onresult(fn) {
      handlers.onresult = fn;
    }
    get onresult() {
      return handlers.onresult;
    }
    set onerror(fn) {
      handlers.onerror = fn;
    }
    get onerror() {
      return handlers.onerror;
    }
    set onend(fn) {
      handlers.onend = fn;
    }
    get onend() {
      return handlers.onend;
    }
    set onstart(fn) {
      handlers.onstart = fn;
    }
    get onstart() {
      return handlers.onstart;
    }
  };
  vi.stubGlobal("webkitSpeechRecognition", Ctor);
  return Ctor;
}

describe("recognition", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    stubRecognizer();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("reports support only when the API exists", () => {
    expect(isRecognitionSupported()).toBe(true);
    vi.unstubAllGlobals();
    expect(isRecognitionSupported()).toBe(false);
    window.SpeechRecognition = class {};
    expect(isRecognitionSupported()).toBe(true);
    delete window.SpeechRecognition;
  });

  it("delivers the transcript from a result", () => {
    const onResult = vi.fn();
    listenOnce({ onResult });
    handlers.onresult({ results: [{ 0: { transcript: "hello buddy" } }] });
    expect(onResult).toHaveBeenCalledWith("hello buddy");
  });

  it("maps a blocked mic to a friendly permission message", () => {
    const onError = vi.fn();
    listenOnce({ onError });
    handlers.onerror({ error: "not-allowed" });
    expect(onError).toHaveBeenCalledWith(
      "not-allowed",
      expect.stringContaining("lock icon"),
    );
  });

  it("times out with a friendly message when nothing is heard", () => {
    const onError = vi.fn();
    listenOnce({ onError, timeoutMs: 5000 });
    vi.advanceTimersByTime(5000);
    expect(onError).toHaveBeenCalledWith(
      "timeout",
      expect.stringContaining("could not hear anything"),
    );
  });

  it("does not call back twice after settle", () => {
    const onResult = vi.fn();
    listenOnce({ onResult });
    handlers.onresult({ results: [{ 0: { transcript: "cat" } }] });
    handlers.onend();
    expect(onResult).toHaveBeenCalledTimes(1);
  });

  it("stops cleanly without callbacks", () => {
    const onResult = vi.fn();
    const session = listenOnce({ onResult });
    session.stop();
    handlers.onresult({ results: [{ 0: { transcript: "late" } }] });
    expect(onResult).not.toHaveBeenCalled();
  });
});

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getCurrentUser,
  isGoogleConfigured,
  signInWithCredential,
  signOut,
  subscribeAuth,
} from "./auth.js";

const token = () => {
  const payload = btoa(
    JSON.stringify({ sub: "123", email: "a@b.c", name: "Ada" }),
  );
  return `x.${payload}.y`;
};

describe("auth", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    signOut();
    vi.unstubAllGlobals();
  });

  it("is only configured when a client id is set", () => {
    expect(isGoogleConfigured()).toBe(false);
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "abc.apps.googleusercontent.com");
    expect(isGoogleConfigured()).toBe(true);
  });

  it("signs in with a valid Google JWT credential", () => {
    const user = signInWithCredential(token());
    expect(user).toEqual({
      sub: "123",
      email: "a@b.c",
      name: "Ada",
      picture: "",
    });
    expect(getCurrentUser().sub).toBe("123");
    expect(JSON.parse(localStorage.getItem("playlearn:session"))).toBeTruthy();
  });

  it("rejects malformed credentials", () => {
    expect(signInWithCredential("not-a-token")).toBeNull();
    expect(signInWithCredential("")).toBeNull();
  });

  it("notifies subscribers and clears the session on sign out", () => {
    const seen = [];
    const unsub = subscribeAuth((u) => seen.push(u));
    signInWithCredential(token());
    signOut();
    expect(getCurrentUser()).toBeNull();
    expect(seen).toHaveLength(2);
    expect(seen[1]).toBeNull();
    unsub();
  });
});

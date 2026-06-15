import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the env module before importing session
vi.mock("../lib/env", () => ({
  env: { sessionSecret: "test-secret-for-jwt-unit-tests" },
}));

import { signSessionToken, verifySessionToken } from "./session";

describe("session JWT helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("signSessionToken returns a non-empty string", async () => {
    const token = await signSessionToken({ userId: 42 });
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);
  });

  it("verifySessionToken round-trips a signed token", async () => {
    const token = await signSessionToken({ userId: 7 });
    const payload = await verifySessionToken(token);
    expect(payload).toEqual({ userId: 7 });
  });

  it("verifySessionToken returns null for empty string", async () => {
    const result = await verifySessionToken("");
    expect(result).toBeNull();
  });

  it("verifySessionToken returns null for invalid token", async () => {
    const result = await verifySessionToken("not.a.jwt");
    expect(result).toBeNull();
  });

  it("verifySessionToken returns null for tampered token", async () => {
    const token = await signSessionToken({ userId: 1 });
    const tampered = token.slice(0, -5) + "XXXXX";
    const result = await verifySessionToken(tampered);
    expect(result).toBeNull();
  });

  it("preserves userId through sign → verify cycle", async () => {
    for (const id of [1, 100, 999999]) {
      const token = await signSessionToken({ userId: id });
      const payload = await verifySessionToken(token);
      expect(payload?.userId).toBe(id);
    }
  });
});

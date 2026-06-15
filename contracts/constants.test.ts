import { describe, it, expect } from "vitest";
import { Session, ErrorMessages, Paths } from "./constants";

describe("Session constants", () => {
  it("has the expected cookie name", () => {
    expect(Session.cookieName).toBe("ff_sid");
  });

  it("maxAgeMs equals 30 days in milliseconds", () => {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    expect(Session.maxAgeMs).toBe(thirtyDaysMs);
  });
});

describe("ErrorMessages", () => {
  it("unauthenticated message is defined", () => {
    expect(ErrorMessages.unauthenticated).toBe("Authentication required");
  });

  it("insufficientRole message is defined", () => {
    expect(ErrorMessages.insufficientRole).toBe("Insufficient permissions");
  });
});

describe("Paths", () => {
  it("login path is /login", () => {
    expect(Paths.login).toBe("/login");
  });
});

import { describe, it, expect } from "vitest";
import { Errors } from "./errors";
import type { AppError } from "./errors";

describe("Errors", () => {
  it("badRequest returns status 400 with message", () => {
    const err: AppError = Errors.badRequest("missing field");
    expect(err).toEqual({ tag: "app_error", status: 400, message: "missing field" });
  });

  it("unauthorized returns status 401 with message", () => {
    const err = Errors.unauthorized("no token");
    expect(err).toEqual({ tag: "app_error", status: 401, message: "no token" });
  });

  it("forbidden returns status 403 with message", () => {
    const err = Errors.forbidden("admin only");
    expect(err).toEqual({ tag: "app_error", status: 403, message: "admin only" });
  });

  it("notFound returns status 404 with message", () => {
    const err = Errors.notFound("page missing");
    expect(err).toEqual({ tag: "app_error", status: 404, message: "page missing" });
  });

  it("internal returns status 500 with message", () => {
    const err = Errors.internal("server crash");
    expect(err).toEqual({ tag: "app_error", status: 500, message: "server crash" });
  });

  it("all errors share the app_error tag", () => {
    const errors = [
      Errors.badRequest("a"),
      Errors.unauthorized("b"),
      Errors.forbidden("c"),
      Errors.notFound("d"),
      Errors.internal("e"),
    ];
    for (const e of errors) {
      expect(e.tag).toBe("app_error");
    }
  });
});

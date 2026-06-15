import { describe, it, expect } from "vitest";
import { getSessionCookieOptions } from "./cookies";

function headersWithHost(host: string): Headers {
  return new Headers({ host });
}

describe("getSessionCookieOptions", () => {
  it("returns Lax sameSite and non-secure for localhost", () => {
    const opts = getSessionCookieOptions(headersWithHost("localhost:3000"));
    expect(opts.sameSite).toBe("Lax");
    expect(opts.secure).toBe(false);
    expect(opts.httpOnly).toBe(true);
    expect(opts.path).toBe("/");
  });

  it("returns Lax sameSite for 127.0.0.1", () => {
    const opts = getSessionCookieOptions(headersWithHost("127.0.0.1:5173"));
    expect(opts.sameSite).toBe("Lax");
    expect(opts.secure).toBe(false);
  });

  it("returns None sameSite and secure for production host", () => {
    const opts = getSessionCookieOptions(headersWithHost("example.com"));
    expect(opts.sameSite).toBe("None");
    expect(opts.secure).toBe(true);
    expect(opts.httpOnly).toBe(true);
    expect(opts.path).toBe("/");
  });

  it("treats localhost without port as non-local (isLocalhost requires trailing colon)", () => {
    const opts = getSessionCookieOptions(headersWithHost("localhost"));
    expect(opts.sameSite).toBe("None");
    expect(opts.secure).toBe(true);
  });

  it("treats 127.0.0.1 without port as non-local", () => {
    const opts = getSessionCookieOptions(headersWithHost("127.0.0.1"));
    expect(opts.sameSite).toBe("None");
    expect(opts.secure).toBe(true);
  });

  it("returns None sameSite when host header is missing", () => {
    const opts = getSessionCookieOptions(new Headers());
    expect(opts.sameSite).toBe("None");
    expect(opts.secure).toBe(true);
  });
});

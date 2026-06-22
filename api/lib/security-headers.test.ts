import { describe, it, expect } from "vitest";
import { securityHeaders } from "./security-headers";

function createMockContext() {
  const headers = new Headers();
  let nextCalled = false;
  const c = {
    res: { headers },
    req: { raw: new Request("http://localhost") },
  };
  const next = async () => { nextCalled = true; };
  return { c, next, headers, wasNextCalled: () => nextCalled };
}

describe("securityHeaders", () => {
  it("sets Strict-Transport-Security", async () => {
    const { c, next, headers } = createMockContext();
    const mw = securityHeaders();
    await mw(c as never, next);
    expect(headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
  });

  it("sets X-Frame-Options to DENY", async () => {
    const { c, next, headers } = createMockContext();
    await securityHeaders()(c as never, next);
    expect(headers.get("X-Frame-Options")).toBe("DENY");
  });

  it("sets X-Content-Type-Options to nosniff", async () => {
    const { c, next, headers } = createMockContext();
    await securityHeaders()(c as never, next);
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sets CSP with connect-src 'self'", async () => {
    const { c, next, headers } = createMockContext();
    await securityHeaders()(c as never, next);
    const csp = headers.get("Content-Security-Policy") ?? "";
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("connect-src 'self'");
  });

  it("sets Permissions-Policy blocking camera and geolocation", async () => {
    const { c, next, headers } = createMockContext();
    await securityHeaders()(c as never, next);
    const pp = headers.get("Permissions-Policy") ?? "";
    expect(pp).toContain("camera=()");
    expect(pp).toContain("geolocation=()");
  });

  it("calls next()", async () => {
    const { c, next, wasNextCalled } = createMockContext();
    await securityHeaders()(c as never, next);
    expect(wasNextCalled()).toBe(true);
  });
});

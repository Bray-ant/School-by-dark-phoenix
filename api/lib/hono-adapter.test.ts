import { describe, it, expect } from "vitest";
import { setCookie } from "hono/cookie";
import { createHonoContext, runHonoHandler } from "./hono-adapter";

describe("hono-adapter", () => {
  it("supports setCookie via the header method", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", passwordHash: "x" }),
    });

    const c = createHonoContext(request);
    setCookie(c, "session", "abc123", { httpOnly: true, path: "/" });

    const response = c.json({ success: true });
    expect(response.headers.get("set-cookie")).toContain("session=abc123");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  });

  it("appends multiple cookies", async () => {
    const request = new Request("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", passwordHash: "x" }),
    });

    const c = createHonoContext(request);
    setCookie(c, "a", "1", { path: "/" });
    setCookie(c, "b", "2", { path: "/" });

    const response = c.json({ success: true });
    const cookies = response.headers.getSetCookie();
    expect(cookies).toHaveLength(2);
    expect(cookies[0]).toContain("a=1");
    expect(cookies[1]).toContain("b=2");
  });
});

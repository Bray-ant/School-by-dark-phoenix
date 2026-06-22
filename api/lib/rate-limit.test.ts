import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "./rate-limit";

function createMockContext(ip = "127.0.0.1", path = "/api/test") {
  const resHeaders = new Headers();
  let status = 200;
  let body: unknown = null;
  const c = {
    req: {
      header: (name: string) => name === "x-forwarded-for" ? ip : undefined,
      path,
    },
    res: { headers: resHeaders },
    json: (data: unknown, s?: number) => {
      body = data;
      status = s ?? 200;
      return { body, status } as never;
    },
  };
  return { c, resHeaders, getStatus: () => status, getBody: () => body };
}

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests under the limit", async () => {
    const mw = rateLimit({ windowMs: 60_000, max: 3 });
    const next = vi.fn();

    for (let i = 0; i < 3; i++) {
      const { c } = createMockContext("10.0.0.1", "/api/r1");
      await mw(c as never, next);
    }
    expect(next).toHaveBeenCalledTimes(3);
  });

  it("blocks requests exceeding the limit with 429", async () => {
    const mw = rateLimit({ windowMs: 60_000, max: 2 });
    const next = vi.fn();

    // First 2 should pass
    for (let i = 0; i < 2; i++) {
      const { c } = createMockContext("10.0.0.2", "/api/r2");
      await mw(c as never, next);
    }
    expect(next).toHaveBeenCalledTimes(2);

    // Third should be blocked
    const { c, resHeaders } = createMockContext("10.0.0.2", "/api/r2");
    await mw(c as never, next);
    expect(next).toHaveBeenCalledTimes(2); // not called again
    expect(resHeaders.get("Retry-After")).toBeTruthy();
  });

  it("resets after window expires", async () => {
    const mw = rateLimit({ windowMs: 1000, max: 1 });
    const next = vi.fn();

    const { c: c1 } = createMockContext("10.0.0.3", "/api/r3");
    await mw(c1 as never, next);
    expect(next).toHaveBeenCalledTimes(1);

    // Advance past window
    vi.advanceTimersByTime(1500);

    const { c: c2 } = createMockContext("10.0.0.3", "/api/r3");
    await mw(c2 as never, next);
    expect(next).toHaveBeenCalledTimes(2);
  });

  it("tracks different IPs separately", async () => {
    const mw = rateLimit({ windowMs: 60_000, max: 1 });
    const next = vi.fn();

    const { c: c1 } = createMockContext("10.0.0.4", "/api/r4");
    await mw(c1 as never, next);
    expect(next).toHaveBeenCalledTimes(1);

    const { c: c2 } = createMockContext("10.0.0.5", "/api/r4");
    await mw(c2 as never, next);
    expect(next).toHaveBeenCalledTimes(2);
  });
});

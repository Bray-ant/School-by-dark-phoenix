import type { MiddlewareHandler } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Evict expired entries periodically to prevent memory leaks.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}, 60_000);

export function rateLimit(opts: {
  windowMs: number;
  max: number;
}): MiddlewareHandler {
  return async (c, next) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }

    entry.count++;

    if (entry.count > opts.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.res.headers.set("Retry-After", String(retryAfter));
      return c.json({ error: "Too many requests. Please try again later." }, 429);
    }

    await next();
  };
}

import type { MiddlewareHandler } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitStore {
  get(key: string): RateLimitEntry | undefined;
  set(key: string, entry: RateLimitEntry): void;
  delete(key: string): void;
  entries(): IterableIterator<[string, RateLimitEntry]>;
}

const memoryStore: RateLimitStore = new Map<string, RateLimitEntry>();

// Evict expired entries periodically to prevent memory leaks.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now >= entry.resetAt) memoryStore.delete(key);
  }
}, 60_000);

export function rateLimit(opts: {
  windowMs: number;
  max: number;
  keyGenerator?: (ip: string, path: string) => string;
  store?: RateLimitStore;
}): MiddlewareHandler {
  const store = opts.store ?? memoryStore;

  return async (c, next) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      c.req.header("x-real-ip") ||
      "unknown";
    const key = opts.keyGenerator
      ? opts.keyGenerator(ip, c.req.path)
      : `${ip}:${c.req.path}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, opts.max - entry.count);
    c.res.headers.set("X-RateLimit-Limit", String(opts.max));
    c.res.headers.set("X-RateLimit-Remaining", String(remaining));
    c.res.headers.set("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > opts.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      c.res.headers.set("Retry-After", String(retryAfter));
      return c.json({ error: "Too many requests. Please try again later." }, 429);
    }

    await next();
  };
}

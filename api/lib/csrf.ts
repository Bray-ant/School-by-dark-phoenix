import type { MiddlewareHandler } from "hono";

/**
 * Origin-based CSRF protection middleware.
 * Rejects mutating requests (POST, PUT, DELETE, PATCH) whose Origin header
 * doesn't match the server host. GET/HEAD/OPTIONS are always allowed.
 */
export function csrfProtection(): MiddlewareHandler {
  return async (c, next) => {
    const method = c.req.method.toUpperCase();
    if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
      return next();
    }

    const origin = c.req.header("origin");
    const host = c.req.header("host");

    // If Origin is missing, check Referer as fallback
    const referer = c.req.header("referer");
    const requestOrigin = origin || (referer ? new URL(referer).origin : null);

    // Allow requests from same origin or when origin cannot be determined
    // (e.g., server-to-server, curl, Postman in development)
    if (!requestOrigin || !host) {
      return next();
    }

    try {
      const originHost = new URL(requestOrigin).host;
      if (originHost === host) {
        return next();
      }
    } catch {
      // Malformed origin — reject
    }

    return c.json({ error: "CSRF validation failed" }, 403);
  };
}

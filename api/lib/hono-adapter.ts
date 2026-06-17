import type { Context } from "hono";

/**
 * Minimal Hono Context adapter that lets existing Hono handler factories
 * run inside Next.js Route Handlers.
 *
 * Only the Context surface used by api/auth/handlers.ts is implemented.
 */
export function createHonoContext(request: Request): Context {
  const responseHeaders = new Headers();

  return {
    req: {
      method: request.method,
      raw: request,
      header: (name: string) => request.headers.get(name) ?? undefined,
      json: async <T>() => (await request.json()) as T,
    },
    res: {
      headers: responseHeaders,
    },
    header: (name: string, value: string | undefined, options?: { append?: boolean }) => {
      if (value === undefined) {
        responseHeaders.delete(name);
        return;
      }
      if (options?.append) {
        responseHeaders.append(name, value);
      } else {
        responseHeaders.set(name, value);
      }
    },
    json: (body: unknown, status = 200) => {
      return Response.json(body, {
        status,
        headers: responseHeaders,
      });
    },
  } as unknown as Context;
}

export async function runHonoHandler(
  request: Request,
  handler: (c: Context) => Response | Promise<Response>,
): Promise<Response> {
  try {
    return await handler(createHonoContext(request));
  } catch (err) {
    console.error("[runHonoHandler] unhandled error escaped handler:", err);
    return Response.json(
      { error: "An internal error occurred. Please try again." },
      { status: 500 },
    );
  }
}
